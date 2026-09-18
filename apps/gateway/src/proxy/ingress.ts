import type { IncomingMessage, ServerResponse } from 'node:http';
import { extractOrGenerateRequestId, attachCorrelationHeader } from '../middleware/correlation';
import { extractApiKey, hashApiKey, virtualKeyCache, type CachedVirtualKey, type IVirtualKeyCache } from '../middleware/cache';
import { rateLimitStore, budgetGatekeeper, type IRateLimitStore, type OpenAIErrorResponse } from '../middleware/gatekeeper';

export interface IngressContext {
  requestId: string;
  virtualKey: CachedVirtualKey;
  abortController: AbortController;
  body: string;
  parsedPayload?: Record<string, unknown>;
}

export type VirtualKeyResolver = (keyHash: string) => Promise<CachedVirtualKey | null>;

// Hard payload stream ceiling (30MB)
export const MAX_PAYLOAD_BYTES = 30 * 1024 * 1024;

/**
 * Sends a standardized OpenAI-compatible error response container.
 */
export function sendOpenAiError(
  res: ServerResponse,
  statusCode: number,
  code: string,
  type: string,
  message: string,
  requestId: string
): void {
  if (res.headersSent) return;

  const payload: OpenAIErrorResponse = {
    error: {
      message,
      type,
      param: null,
      code,
    },
  };

  const serialized = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(serialized),
    'X-OsterdOps-Request-ID': requestId,
  });
  res.end(serialized);
}

/**
 * Streams the request body with a hard size guard to prevent DoS memory attacks.
 */
async function streamRequestBodyWithLimit(req: IncomingMessage, maxBytes = MAX_PAYLOAD_BYTES): Promise<string> {
  const chunks: Buffer[] = [];
  let receivedBytes = 0;

  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    receivedBytes += buf.length;
    if (receivedBytes > maxBytes) {
      throw new Error('PAYLOAD_TOO_LARGE');
    }
    chunks.push(buf);
  }

  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Main Hosted Gateway Ingress Pipeline.
 *
 * Execution Protocol:
 * 1. Generate & propagate correlation identifier (X-OsterdOps-Request-ID).
 * 2. Guarded Client AbortController instantiation (!res.writableEnded && !isCompleted).
 * 3. ZERO-BYTE PRE-INGEST:
 *    - Authenticate headers (extract token, hash SHA-256, query hot-path cache).
 *    - Execute Layer 1 Velocity Gatekeeping (RPM & active concurrency).
 *    - Reject early before reading a single byte of request body.
 * 4. Acquire concurrency slot wrapped in strict `try ... finally` release block.
 * 5. Stream request payload guarded by 30MB ceiling.
 * 6. Execute Layer 2 Pre-Flight Safety Budget Gatekeeper (ceil(bytes/3) * rate * 1.35x).
 * 7. Forward to Upstream Provider Router or acknowledge.
 */
export async function handleGatewayIngress(
  req: IncomingMessage,
  res: ServerResponse,
  options?: {
    keyResolver?: VirtualKeyResolver;
    cache?: IVirtualKeyCache;
    limiter?: IRateLimitStore;
    onForwardToRouter?: (ctx: IngressContext, res: ServerResponse) => Promise<void>;
  }
): Promise<void> {
  const cache = options?.cache ?? virtualKeyCache;
  const limiter = options?.limiter ?? rateLimitStore;
  const keyResolver = options?.keyResolver;
  const onForwardToRouter = options?.onForwardToRouter;

  // 1. Request Correlation
  const requestId = extractOrGenerateRequestId(req.headers);
  attachCorrelationHeader(res, requestId);

  // 2. CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, x-api-key, X-Request-ID',
      'X-OsterdOps-Request-ID': requestId,
    });
    res.end();
    return;
  }

  // 3. Guarded Client Abort Controller
  const abortController = new AbortController();
  let isCompleted = false;

  res.on('finish', () => {
    isCompleted = true;
  });

  res.on('close', () => {
    // Only abort if connection closed prematurely before normal completion
    if (!isCompleted && !res.writableEnded) {
      abortController.abort();
    }
  });

  // 4. Ingress Route Verification
  const url = req.url || '';
  const isLlmEndpoint =
    url.includes('/v1/chat/completions') ||
    url.includes('/v1/messages') ||
    url.endsWith('/completions');

  if (!isLlmEndpoint) {
    sendOpenAiError(
      res,
      404,
      'OSTERDOPS_ROUTE_NOT_FOUND',
      'invalid_request_error',
      `Unknown gateway endpoint: ${url}`,
      requestId
    );
    return;
  }

  // --------------------------------------------------------------------------
  // 5. ZERO-BYTE PRE-INGEST: Header Authentication & Layer 1 Velocity
  // --------------------------------------------------------------------------
  const rawApiKey = extractApiKey(req.headers);
  if (!rawApiKey) {
    sendOpenAiError(
      res,
      401,
      'OSTERDOPS_UNAUTHORIZED',
      'authentication_error',
      'Missing or malformed authorization credentials. Provide Bearer ost_live_... or x-api-key.',
      requestId
    );
    return;
  }

  const keyHash = hashApiKey(rawApiKey);
  let cachedKey = await cache.get(keyHash);
  if (!cachedKey && keyResolver) {
    cachedKey = await keyResolver(keyHash);
    if (cachedKey) {
      await cache.set(cachedKey);
    }
  }

  if (!cachedKey) {
    sendOpenAiError(
      res,
      401,
      'OSTERDOPS_INVALID_KEY',
      'authentication_error',
      'Invalid or unrecognized virtual key.',
      requestId
    );
    return;
  }

  // Layer 1 Velocity & Rate Check (Evaluated BEFORE reading body)
  const velocityCheck = await limiter.checkLimit(cachedKey);
  if (!velocityCheck.allowed) {
    sendOpenAiError(
      res,
      velocityCheck.status || 429,
      velocityCheck.errorPayload?.error.code || 'OSTERDOPS_RATE_LIMITED',
      velocityCheck.errorPayload?.error.type || 'osterdops_rate_limited',
      velocityCheck.errorPayload?.error.message || 'Rate limit exceeded.',
      requestId
    );
    return;
  }

  // --------------------------------------------------------------------------
  // 6. Concurrency Acquisition with Strict Try ... Finally Protection
  // --------------------------------------------------------------------------
  await limiter.acquireSlot(cachedKey.id);

  try {
    // 7. Stream request payload with 30MB ceiling
    let rawBody = '';
    let parsedPayload: Record<string, unknown> | undefined;

    try {
      rawBody = await streamRequestBodyWithLimit(req, MAX_PAYLOAD_BYTES);
      if (rawBody.trim().length > 0) {
        parsedPayload = JSON.parse(rawBody);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'PAYLOAD_TOO_LARGE') {
        sendOpenAiError(
          res,
          413,
          'OSTERDOPS_PAYLOAD_TOO_LARGE',
          'invalid_request_error',
          `Payload exceeds maximum allowable size of ${MAX_PAYLOAD_BYTES / 1024 / 1024}MB.`,
          requestId
        );
        return;
      }
      sendOpenAiError(
        res,
        400,
        'OSTERDOPS_MALFORMED_JSON',
        'invalid_request_error',
        'Failed to parse JSON request body.',
        requestId
      );
      return;
    }

    // 8. Layer 2 Gatekeeper: Pre-Flight Safety Budget Check
    const payloadByteLength = Buffer.byteLength(rawBody, 'utf8');
    const requestedModel = (parsedPayload?.model as string) || undefined;

    const budgetCheck = budgetGatekeeper.checkBudget(cachedKey, payloadByteLength, requestedModel);
    if (!budgetCheck.allowed) {
      sendOpenAiError(
        res,
        budgetCheck.status || 402,
        budgetCheck.errorPayload?.error.code || 'OSTERDOPS_BUDGET_EXCEEDED',
        budgetCheck.errorPayload?.error.type || 'osterdops_budget_exceeded',
        budgetCheck.errorPayload?.error.message || 'Monthly spend cap reached.',
        requestId
      );
      return;
    }

    // 9. Forward to Upstream Provider Router
    if (abortController.signal.aborted) {
      return;
    }

    const ctx: IngressContext = {
      requestId,
      virtualKey: cachedKey,
      abortController,
      body: rawBody,
      parsedPayload,
    };

    if (onForwardToRouter) {
      await onForwardToRouter(ctx, res);
    } else {
      // Default Phase 2 Ingress Handshake Response
      const ackPayload = JSON.stringify({
        id: requestId,
        status: 'ingested',
        virtual_key_prefix: cachedKey.keyPrefix,
        environment_id: cachedKey.environmentId,
        model: requestedModel || 'conservative_default',
      });

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(ackPayload),
        'X-OsterdOps-Request-ID': requestId,
      });
      res.end(ackPayload);
    }
  } finally {
    // Guarantees slot release on all paths: early return, error, or completion
    await limiter.releaseSlot(cachedKey.id);
  }
}
