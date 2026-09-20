import { createServer, type IncomingMessage, type ServerResponse, type Server } from 'node:http';
import { handleGatewayIngress, type IngressContext, sendOpenAiError } from './proxy/ingress';
import { executeStreamingPipeline } from './streaming/pipeline';
import { createUpstreamDispatcher } from './proxy/dispatcher';
import { ScopedSecretResolver } from './vault/resolver';
import { getModelSpec, MODEL_CATALOG } from './registry/catalog';
import { StreamTokenAccumulator, extractUsageFromNonStreamingJson } from './accounting/extractor';
import { calculateModelCost } from './accounting/cost';
import { AtomicSpendSync } from './accounting/spend-sync';
import { GovernanceEngine } from './accounting/governance';
import { telemetryQueue } from './accounting/queue';
import { supabaseBridge } from './db/bridge';
import { promptCache } from './cache/prompt-cache';
import { idempotencyStore } from './middleware/idempotency';
import { dispatchSignedWebhook } from './webhooks/dispatcher';
import type { TelemetryLogRecord } from './accounting/types';

export interface GatewayServerOptions {
  port?: number;
  host?: string;
  webhookSecret?: string;
  webhookUrl?: string;
}

// Wire up Supabase persistence and spend synchronizer
telemetryQueue.setWriter(async (records) => {
  await supabaseBridge.writeTelemetryBatch(records);
});

const spendSync = new AtomicSpendSync(async (keyId, delta) => {
  return supabaseBridge.incrementSpend(keyId, delta);
});

export function createGatewayServer(options?: GatewayServerOptions): Server {
  const webhookSecret = options?.webhookSecret || process.env.OSTRAOPS_WEBHOOK_SECRET || 'whsec_local_development';
  const webhookUrl = options?.webhookUrl || process.env.OSTRAOPS_WEBHOOK_URL;

  const governance = new GovernanceEngine(async (payload) => {
    if (webhookUrl) {
      await dispatchSignedWebhook(webhookUrl, webhookSecret, payload);
    }
  });

  const secretResolver = new ScopedSecretResolver({
    dbFetcher: async (orgId, provider) => supabaseBridge.resolveProviderSecret(orgId, provider),
  });

  let activeRequests = 0;
  let isShuttingDown = false;

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const start = Date.now();
    const url = req.url || '';

    // Liveness Probe
    if (req.method === 'GET' && url === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), activeRequests }));
      return;
    }

    // Readiness Probe
    if (req.method === 'GET' && url === '/ready') {
      const ready = !isShuttingDown;
      res.writeHead(ready ? 200 : 503, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: ready ? 'ready' : 'shutting_down',
          uptime: process.uptime(),
          dbConfigured: supabaseBridge.isConfigured(),
        })
      );
      return;
    }

    if (isShuttingDown) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server is undergoing graceful shutdown.' }));
      return;
    }

    activeRequests++;
    let requestFinished = false;
    const cleanupActive = () => {
      if (!requestFinished) {
        requestFinished = true;
        activeRequests--;
      }
    };
    res.on('finish', cleanupActive);
    res.on('close', cleanupActive);

    // LLM Ingress Dispatcher
    try {
      await handleGatewayIngress(req, res, {
        keyResolver: async (hash) => supabaseBridge.resolveVirtualKey(hash),
        onForwardToRouter: async (ctx: IngressContext, forwardRes: ServerResponse) => {
          const rawIdempotencyKey =
            (req.headers['idempotency-key'] as string) ||
            (req.headers['x-idempotency-key'] as string) ||
            null;

          const isStreaming = ctx.parsedPayload?.stream === true;

          // ------------------------------------------------------------------
          // 1. Idempotency Lock Acquisition
          // ------------------------------------------------------------------
          if (rawIdempotencyKey) {
            const lockResult = await idempotencyStore.acquireLock(rawIdempotencyKey);
            if (!lockResult.acquired && lockResult.existingRecord) {
              const rec = lockResult.existingRecord;
              if (rec.status === 'COMPLETED' && !isStreaming && rec.body && rec.statusCode) {
                forwardRes.writeHead(rec.statusCode, {
                  ...rec.headers,
                  'X-OstraOps-Idempotency-Replayed': 'true',
                  'X-OstraOps-Request-ID': ctx.requestId,
                });
                forwardRes.end(rec.body);
                return;
              }

              sendOpenAiError(
                forwardRes,
                409,
                'OSTRAOPS_IDEMPOTENCY_CONFLICT',
                'conflict_error',
                'A request with this Idempotency-Key is currently in-flight or already completed.',
                ctx.requestId
              );
              return;
            }
          }

          // ------------------------------------------------------------------
          // 2. Exact-Match Prompt Cache Check
          // ------------------------------------------------------------------
          const explicitCacheHeader = (req.headers['x-ostraops-cache'] as string) || null;
          const requestedModelId = (ctx.parsedPayload?.model as string) || 'gpt-4o-mini';
          const isCacheEligible = promptCache.isEligible(
            ctx.parsedPayload || {},
            explicitCacheHeader
          );

          let promptCacheKey: string | null = null;
          if (isCacheEligible) {
            promptCacheKey = promptCache.computeKey(
              ctx.virtualKey.organizationId,
              ctx.virtualKey.environmentId,
              requestedModelId,
              ctx.parsedPayload || {}
            );

            const cached = await promptCache.get(promptCacheKey);
            if (cached) {
              if (isStreaming) {
                // Emit simulated SSE stream for streaming clients
                forwardRes.writeHead(200, {
                  'Content-Type': 'text/event-stream',
                  'Cache-Control': 'no-cache',
                  'Connection': 'keep-alive',
                  'X-OstraOps-Prompt-Cache': 'HIT',
                  'X-OstraOps-Request-ID': ctx.requestId,
                });
                const sseData = `data: ${JSON.stringify(cached.parsedResponse || { cached: true })}\n\ndata: [DONE]\n\n`;
                forwardRes.write(sseData);
                forwardRes.end();
              } else {
                // Emit cached JSON
                forwardRes.writeHead(200, {
                  'Content-Type': 'application/json',
                  'X-OstraOps-Prompt-Cache': 'HIT',
                  'X-OstraOps-Request-ID': ctx.requestId,
                });
                forwardRes.end(cached.rawResponse);
              }

              // Zero-cost telemetry log
              telemetryQueue.enqueue({
                requestId: ctx.requestId,
                organizationId: ctx.virtualKey.organizationId,
                projectId: ctx.virtualKey.projectId,
                environmentId: ctx.virtualKey.environmentId,
                virtualKeyId: ctx.virtualKey.id,
                provider: 'cache',
                requestedModel: requestedModelId,
                routedModel: requestedModelId,
                fallbackUsed: false,
                fallbackFromModel: null,
                inputTokens: cached.usage.inputTokens,
                outputTokens: cached.usage.outputTokens,
                costUsd: 0,
                latencyMs: Date.now() - start,
                statusCode: 200,
                errorType: null,
                errorCode: null,
                createdAt: new Date(start).toISOString(),
                completedAt: new Date().toISOString(),
              });

              if (rawIdempotencyKey) {
                await idempotencyStore.complete(
                  rawIdempotencyKey,
                  200,
                  { 'Content-Type': 'application/json' },
                  cached.rawResponse
                );
              }
              return;
            }
          }

          // ------------------------------------------------------------------
          // 3. Resolve Target Model & Create Upstream Dispatcher
          // ------------------------------------------------------------------
          const modelSpec = getModelSpec(requestedModelId) || MODEL_CATALOG['gpt-4o-mini'];
          const dispatcher = createUpstreamDispatcher({
            secretResolver,
            orgId: ctx.virtualKey.organizationId,
          });

          const accumulator = new StreamTokenAccumulator(ctx.body);
          let nonStreamingBody = '';

          // ------------------------------------------------------------------
          // 4. Run Resilient Two-State Streaming Pipeline
          // ------------------------------------------------------------------
          const pipelineResult = await executeStreamingPipeline(forwardRes, {
            identity: {
              requestId: ctx.requestId,
              organizationId: ctx.virtualKey.organizationId,
              virtualKeyId: ctx.virtualKey.id,
            },
            initialModel: modelSpec,
            payload: ctx.parsedPayload || {},
            isStreaming,
            clientSignal: ctx.abortController.signal,
            upstreamDispatcher: dispatcher,
            onChunk: (chunk) => {
              accumulator.ingestChunk(chunk);
            },
            onResponseCompleted: (resInfo) => {
              if (resInfo.body) {
                nonStreamingBody = resInfo.body;
              }
            },
          });

          // ------------------------------------------------------------------
          // 5. Post-Stream Accounting & Automated Governance
          // ------------------------------------------------------------------
          const finalModelSpec = getModelSpec(pipelineResult.routedModelId) || modelSpec;
          let usage = accumulator.finalize();

          if (!isStreaming && nonStreamingBody) {
            try {
              const parsedJson = JSON.parse(nonStreamingBody);
              usage = extractUsageFromNonStreamingJson(parsedJson, ctx.body.length);
            } catch {
              // fallback to accumulator finalize
            }
          }

          const cost = calculateModelCost(finalModelSpec.id, usage);

          // Atomic Spend Synchronization
          const spendResult = await spendSync.commitSpend(
            ctx.virtualKey.id,
            ctx.virtualKey.keyHash,
            cost.totalCostUsd
          );

          // Automated Financial Governance Check
          await governance.checkMilestones({
            organizationId: ctx.virtualKey.organizationId,
            virtualKeyId: ctx.virtualKey.id,
            keyHash: ctx.virtualKey.keyHash,
            keyPrefix: ctx.virtualKey.keyPrefix,
            currentSpendUsd: spendResult.currentSpendUsd,
            monthlyLimitUsd: ctx.virtualKey.monthlyLimitUsd,
          });

          // Enqueue Telemetry Log
          const logRecord: TelemetryLogRecord = {
            requestId: ctx.requestId,
            organizationId: ctx.virtualKey.organizationId,
            projectId: ctx.virtualKey.projectId,
            environmentId: ctx.virtualKey.environmentId,
            virtualKeyId: ctx.virtualKey.id,
            provider: finalModelSpec.provider,
            requestedModel: requestedModelId,
            routedModel: finalModelSpec.id,
            fallbackUsed: finalModelSpec.id !== requestedModelId,
            fallbackFromModel: finalModelSpec.id !== requestedModelId ? requestedModelId : null,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            costUsd: cost.totalCostUsd,
            latencyMs: Date.now() - start,
            statusCode: pipelineResult.finalState === 'COMPLETED' ? 200 : 500,
            errorType: pipelineResult.error?.name || null,
            errorCode: (pipelineResult.error as { code?: string })?.code || null,
            createdAt: new Date(start).toISOString(),
            completedAt: new Date().toISOString(),
          };
          telemetryQueue.enqueue(logRecord);

          // Populate Prompt Cache
          if (isCacheEligible && promptCacheKey && pipelineResult.finalState === 'COMPLETED') {
            await promptCache.set({
              cacheKey: promptCacheKey,
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' },
              rawResponse: nonStreamingBody,
              parsedResponse: nonStreamingBody ? JSON.parse(nonStreamingBody) : undefined,
              usage,
              createdAt: Date.now(),
              expiresAt: Date.now() + 300_000, // 5 min default TTL
            });
          }

          // Complete Idempotency Record
          if (rawIdempotencyKey && pipelineResult.finalState === 'COMPLETED') {
            await idempotencyStore.complete(
              rawIdempotencyKey,
              200,
              { 'Content-Type': 'application/json' },
              nonStreamingBody
            );
          }
        },
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      sendOpenAiError(res, 500, 'OSTRAOPS_INTERNAL_ERROR', 'internal_error', errMsg, 'ost_req_err');
    }
  });

  return server;
}

/**
 * Handles graceful server shutdown, waiting up to `timeoutMs` for active streams to drain.
 */
export async function gracefulShutdown(
  server: Server,
  timeoutMs = 15_000
): Promise<void> {
  return new Promise((resolve) => {
    let resolved = false;
    const finish = async () => {
      if (!resolved) {
        resolved = true;
        await telemetryQueue.drain();
        resolve();
      }
    };

    if (typeof server.closeIdleConnections === 'function') {
      server.closeIdleConnections();
    }

    server.close(() => {
      finish();
    });

    const forceTimer = setTimeout(() => {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      finish();
    }, timeoutMs);

    if (forceTimer.unref) {
      forceTimer.unref();
    }
  });
}

// Standalone runner execution
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));

if (isDirectRun) {
  const port = parseInt(process.env.PORT || '8080', 10);
  const server = createGatewayServer();

  server.listen(port, () => {
    console.log(`[OstraOps Gateway] Listening on http://localhost:${port}`);
  });

  const onSignal = async (signal: string) => {
    console.log(`[OstraOps Gateway] Received ${signal}, starting graceful shutdown...`);
    await gracefulShutdown(server);
    process.exit(0);
  };

  process.on('SIGINT', () => onSignal('SIGINT'));
  process.on('SIGTERM', () => onSignal('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('[OstraOps Gateway] Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[OstraOps Gateway] Uncaught Exception:', err);
  });
}
