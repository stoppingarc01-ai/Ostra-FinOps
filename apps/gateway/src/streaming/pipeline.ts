import type { ServerResponse } from 'node:http';
import { StreamingStateMachine } from './state-machine';
import { HeartbeatManager } from './heartbeat';
import { RetryController, isRetryableStatus, MAX_FAILOVER_ATTEMPTS } from './retry';
import { CleanupCoordinator } from './cleanup';
import type { PipelineOptions, PipelineResult } from './types';
import { resolveFailoverCandidate } from '../registry/failover';
import { sanitizePayloadForModel, buildRoutingHeaders, buildRoutingSseComment } from '../registry/sanitizer';
import {
  createStreamInterruptedError,
  createFailoverExhaustedError,
  createClientAbortedError,
  StreamError,
} from '../errors/stream-errors';
import type { ModelSpec } from '../registry/types';

/**
 * Unified Streaming Pipeline Orchestrator.
 * Adheres strictly to the deterministic two-state engine and zero-failover boundary.
 */
export async function executeStreamingPipeline(
  res: ServerResponse,
  options: PipelineOptions
): Promise<PipelineResult> {
  const {
    identity,
    initialModel,
    payload: initialPayload,
    isStreaming,
    clientSignal,
    upstreamDispatcher,
    maxFailoverAttempts = MAX_FAILOVER_ATTEMPTS,
  } = options;

  const stateMachine = new StreamingStateMachine();
  const heartbeat = new HeartbeatManager();
  const retryController = new RetryController(maxFailoverAttempts);
  const cleanup = new CleanupCoordinator();

  cleanup.registerHeartbeat(heartbeat);

  let currentModel: ModelSpec = initialModel;
  let currentPayload: Record<string, unknown> = initialPayload;
  let fallbackTriggered = false;
  let outputClamped = false;
  let clampedLimit: number | undefined;
  let failoverCount = 0;
  let activeUpstreamAbortController: AbortController | null = null;

  // Abort handling: if client disconnects, transition to ABORTED and abort active upstream
  let clientAborted = false;
  const onClientAbort = () => {
    clientAborted = true;
    stateMachine.abort();
    activeUpstreamAbortController?.abort();
    cleanup.execute();
  };
  cleanup.registerAbortListener(clientSignal, onClientAbort);

  if (clientSignal.aborted) {
    onClientAbort();
    return {
      finalState: 'ABORTED',
      routedModelId: currentModel.id,
      failoverAttempts: 0,
      outputClamped: false,
      error: createClientAbortedError(),
    };
  }

  // 1. Start in PRE_RESPONSE: activate keepalive if streaming
  if (isStreaming) {
    heartbeat.startKeepAlive(res, isStreaming);
  }

  try {
    let activeDispatchResult: Awaited<ReturnType<typeof upstreamDispatcher>> | null = null;

    // ------------------------------------------------------------------------
    // Phase A: PRE_RESPONSE Failover Dispatch Loop
    // ------------------------------------------------------------------------
    while (stateMachine.canFailover()) {
      if (clientAborted) {
        return {
          finalState: 'ABORTED',
          routedModelId: currentModel.id,
          failoverAttempts: failoverCount,
          outputClamped,
          error: createClientAbortedError(),
        };
      }

      // Upstream abort controller linked to active client state
      const upstreamAbortController = new AbortController();
      activeUpstreamAbortController = upstreamAbortController;
      if (clientSignal.aborted) {
        upstreamAbortController.abort();
      }

      try {
        const dispatchResult = await upstreamDispatcher(
          currentModel,
          currentPayload,
          upstreamAbortController.signal
        );

        // Check for Retryable Status Codes strictly in [429, 500, 502, 503, 504]
        if (isRetryableStatus(dispatchResult.statusCode)) {
          if (!retryController.canRetry) {
            stateMachine.error();
            cleanup.execute();
            const err = createFailoverExhaustedError(failoverCount + 1);
            sendTerminalErrorResponse(res, err, identity.requestId);
            return {
              finalState: 'ERROR',
              routedModelId: currentModel.id,
              failoverAttempts: failoverCount,
              outputClamped,
              error: err,
            };
          }

          // Authorized for retry: increment attempt counter
          retryController.recordAttempt();
          failoverCount++;
          fallbackTriggered = true;

          // Emit synthetic SSE heartbeat comment informing client of transparent retry
          heartbeat.sendRetryPending(res, isStreaming);

          // Resolve candidate from Phase 3 Dynamic Catalog
          const candidateResult = resolveFailoverCandidate(
            currentModel.id,
            estimatePromptTokens(currentPayload),
            (currentPayload.max_tokens || currentPayload.max_completion_tokens) as number | undefined
          );

          if (!candidateResult.compatible || !candidateResult.candidate) {
            stateMachine.error();
            cleanup.execute();
            const err = new StreamError(
              candidateResult.reason || 'No compatible failover candidate available.',
              'OSTERDOPS_NO_FAILOVER_CANDIDATE',
              503
            );
            sendTerminalErrorResponse(res, err, identity.requestId);
            return {
              finalState: 'ERROR',
              routedModelId: currentModel.id,
              failoverAttempts: failoverCount,
              outputClamped,
              error: err,
            };
          }

          // Sanitize payload for destination model
          const sourceSpec = currentModel;
          currentModel = candidateResult.candidate;
          outputClamped = candidateResult.outputClamped;
          clampedLimit = candidateResult.clampedLimit;

          const sanitization = sanitizePayloadForModel(
            currentPayload,
            sourceSpec,
            currentModel,
            clampedLimit
          );
          currentPayload = sanitization.sanitizedPayload;

          // Next iteration of PRE_RESPONSE failover loop
          continue;
        }

        // Non-retryable status or success (200) received!
        activeDispatchResult = dispatchResult;
        break;
      } catch (err: unknown) {
        if (clientAborted || clientSignal.aborted) {
          stateMachine.abort();
          cleanup.execute();
          return {
            finalState: 'ABORTED',
            routedModelId: currentModel.id,
            failoverAttempts: failoverCount,
            outputClamped,
            error: createClientAbortedError(),
          };
        }

        // Network failure / connection reset before response headers
        if (retryController.canRetry) {
          retryController.recordAttempt();
          failoverCount++;
          fallbackTriggered = true;
          heartbeat.sendRetryPending(res, isStreaming);

          const candidateResult = resolveFailoverCandidate(
            currentModel.id,
            estimatePromptTokens(currentPayload),
            (currentPayload.max_tokens || currentPayload.max_completion_tokens) as number | undefined
          );

          if (candidateResult.compatible && candidateResult.candidate) {
            const sourceSpec = currentModel;
            currentModel = candidateResult.candidate;
            outputClamped = candidateResult.outputClamped;
            clampedLimit = candidateResult.clampedLimit;
            const sanitization = sanitizePayloadForModel(
              currentPayload,
              sourceSpec,
              currentModel,
              clampedLimit
            );
            currentPayload = sanitization.sanitizedPayload;
            continue;
          }
        }

        stateMachine.error();
        cleanup.execute();
        const streamErr = new StreamError(
          err instanceof Error ? err.message : 'Upstream dispatch failed',
          'OSTERDOPS_UPSTREAM_DISPATCH_FAILED',
          502
        );
        sendTerminalErrorResponse(res, streamErr, identity.requestId);
        return {
          finalState: 'ERROR',
          routedModelId: currentModel.id,
          failoverAttempts: failoverCount,
          outputClamped,
          error: streamErr,
        };
      }
    }

    if (!activeDispatchResult) {
      stateMachine.error();
      cleanup.execute();
      const err = createFailoverExhaustedError(failoverCount);
      sendTerminalErrorResponse(res, err, identity.requestId);
      return {
        finalState: 'ERROR',
        routedModelId: currentModel.id,
        failoverAttempts: failoverCount,
        outputClamped,
        error: err,
      };
    }

    // ------------------------------------------------------------------------
    // Phase B: Non-Streaming Response Path
    // ------------------------------------------------------------------------
    if (!isStreaming || !activeDispatchResult.isStream) {
      heartbeat.stop();

      const routingHeaders = buildRoutingHeaders({
        originalModel: initialModel.id,
        routedModel: currentModel.id,
        fallbackTriggered,
        outputClamped,
        clampedLimit,
      });

      const responseBody = activeDispatchResult.body ?? '';
      res.writeHead(activeDispatchResult.statusCode, {
        'Content-Type': 'application/json',
        'X-OsterdOps-Request-ID': identity.requestId,
        ...routingHeaders,
      });
      res.end(responseBody);

      if (options.onResponseCompleted) {
        options.onResponseCompleted({
          statusCode: activeDispatchResult.statusCode,
          headers: activeDispatchResult.headers,
          body: responseBody,
        });
      }

      stateMachine.complete();
      cleanup.execute();

      return {
        finalState: 'COMPLETED',
        routedModelId: currentModel.id,
        failoverAttempts: failoverCount,
        outputClamped,
      };
    }

    // ------------------------------------------------------------------------
    // Phase C: Streaming SSE Response Path (MID_STREAM Boundary)
    // ------------------------------------------------------------------------
    const stream = activeDispatchResult.stream;
    if (!stream) {
      stateMachine.error();
      cleanup.execute();
      const err = new StreamError('Upstream did not return valid stream iterator', 'OSTERDOPS_INVALID_STREAM', 502);
      sendTerminalErrorResponse(res, err, identity.requestId);
      return {
        finalState: 'ERROR',
        routedModelId: currentModel.id,
        failoverAttempts: failoverCount,
        outputClamped,
        error: err,
      };
    }

    try {
      for await (const chunk of stream) {
        if (clientAborted || clientSignal.aborted) {
          stateMachine.abort();
          cleanup.execute();
          return {
            finalState: 'ABORTED',
            routedModelId: currentModel.id,
            failoverAttempts: failoverCount,
            outputClamped,
            error: createClientAbortedError(),
          };
        }

        // Before or at first successful downstream write: Transition to MID_STREAM
        if (stateMachine.isPreResponse) {
          heartbeat.stop();

          const routingHeaders = buildRoutingHeaders({
            originalModel: initialModel.id,
            routedModel: currentModel.id,
            fallbackTriggered,
            outputClamped,
            clampedLimit,
          });

          res.writeHead(activeDispatchResult.statusCode, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-OsterdOps-Request-ID': identity.requestId,
            ...routingHeaders,
          });

          // Inject initial SSE routing comment for IDE agent transparency
          if (fallbackTriggered || outputClamped) {
            const sseComment = buildRoutingSseComment({
              originalModel: initialModel.id,
              routedModel: currentModel.id,
              fallbackTriggered,
              outputClamped,
              clampedLimit,
            });
            res.write(sseComment);
          }

          // ZERO FAILOVER BOUNDARY: Commit to client
          stateMachine.markFirstDownstreamWrite();
        }

        // Write chunk downstream
        res.write(chunk);

        if (options.onChunk) {
          options.onChunk(chunk);
        }
      }

      // Clean EOF reached from upstream
      res.end();

      if (options.onResponseCompleted) {
        options.onResponseCompleted({
          statusCode: activeDispatchResult.statusCode,
          headers: activeDispatchResult.headers,
        });
      }

      stateMachine.complete();
      cleanup.execute();

      return {
        finalState: 'COMPLETED',
        routedModelId: currentModel.id,
        failoverAttempts: failoverCount,
        outputClamped,
      };
    } catch (streamErr: unknown) {
      // ----------------------------------------------------------------------
      // ZERO-FAILOVER IN MID_STREAM: Connection broke mid-generation!
      // ----------------------------------------------------------------------
      cleanup.execute();

      if (clientAborted || clientSignal.aborted) {
        stateMachine.abort();
        return {
          finalState: 'ABORTED',
          routedModelId: currentModel.id,
          failoverAttempts: failoverCount,
          outputClamped,
          error: createClientAbortedError(),
        };
      }

      // Mark state machine as ERROR. Re-dispatching mid-stream is strictly forbidden.
      stateMachine.error();

      // Emit terminal structured SSE error frame and terminate cleanly
      const interruptedError = createStreamInterruptedError();
      try {
        const errorFrame = `data: ${JSON.stringify(interruptedError.toOpenAiPayload())}\n\n`;
        res.write(errorFrame);
        res.end();
      } catch {
        // Socket already closed
      }

      return {
        finalState: 'ERROR',
        routedModelId: currentModel.id,
        failoverAttempts: failoverCount,
        outputClamped,
        error: streamErr instanceof Error ? streamErr : interruptedError,
      };
    }
  } finally {
    cleanup.execute();
  }
}

/**
 * Sends a standardized JSON error when failure occurs before first write.
 */
function sendTerminalErrorResponse(res: ServerResponse, error: StreamError, requestId: string): void {
  if (res.headersSent || res.writableEnded) return;

  const payload = JSON.stringify(error.toOpenAiPayload());
  res.writeHead(error.statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'X-OsterdOps-Request-ID': requestId,
  });
  res.end(payload);
}

function estimatePromptTokens(payload: Record<string, unknown>): number {
  try {
    const raw = JSON.stringify(payload);
    return Math.max(1, Math.ceil(raw.length / 3));
  } catch {
    return 1000;
  }
}
