import http from 'node:http';
import crypto from 'node:crypto';
import type { DaemonConfig } from '../config.js';
import { TraceRepository, type LocalTraceRecord } from '../db/repository.js';
import { RollingVelocityEngine } from '../engine/velocity.js';
import { SseBroker } from '../engine/sse-broker.js';
import { calculateCost } from './pricing.js';
import { estimateMessageTokens, estimateTextTokens, extractStreamingChunk } from './tokenizer.js';
import { getIntraFamilyFallback, isFailoverEligible } from './failover.js';
import { isLoopbackHost } from '../security.js';

export interface IngressContext {
  config: DaemonConfig;
  repository: TraceRepository;
  velocity: RollingVelocityEngine;
  sseBroker: SseBroker;
}

/**
 * Parses raw JSON body from incoming stream safely.
 */
async function readJsonBody(req: http.IncomingMessage, maxBytes = 10 * 1024 * 1024): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    let raw = '';
    let bytes = 0;

    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        req.destroy();
        reject(new Error('Payload Too Large'));
        return;
      }
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', reject);
  });
}

/**
 * In-memory response cache for deterministic / cached requests (Helicone Parity).
 * Persists across requests with LRU max capacity.
 */
interface CacheEntry {
  responseBody: string;
  contentType: string;
  statusCode: number;
  inputTokens: number;
  outputTokens: number;
  routedModel: string;
  expiresAt: number;
}
const MAX_CACHE_ENTRIES = 1000;
const localResponseCache = new Map<string, CacheEntry>();

/**
 * Handles incoming OpenAI and Anthropic proxy requests.
 * Returns true if the route was matched and handled, false otherwise.
 */
export async function handleLocalIngress(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  ctx: IngressContext
): Promise<boolean> {
  const url = (req.url || '/').split('?')[0];
  const method = req.method?.toUpperCase();

  // Validate Cross-Origin requests: block third-party websites from abusing local proxy
  const origin = req.headers['origin'] as string | undefined;
  if (origin) {
    try {
      const parsedOrigin = new URL(origin);
      if (!isLoopbackHost(parsedOrigin.hostname)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: {
              message: `OstraOps Security Guard: Cross-origin access from external web origin '${origin}' is forbidden.`,
              type: 'security_error',
              code: 'untrusted_origin',
            },
          })
        );
        return true;
      }
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } catch {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: 'Invalid Origin header', type: 'security_error' } }));
      return true;
    }
  }

  // 1. Standard Model Discovery (Fixes Cursor / Cline / LibreChat connection tests)
  const isModelsRoute = url === '/v1/models' || url === '/models';
  if (isModelsRoute) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return true;
    }
    const standardModels = [
      { id: 'gpt-4o', object: 'model', created: 1715367049, owned_by: 'openai' },
      { id: 'gpt-4o-mini', object: 'model', created: 1721260800, owned_by: 'openai' },
      { id: 'o1', object: 'model', created: 1726000000, owned_by: 'openai' },
      { id: 'o3-mini', object: 'model', created: 1738000000, owned_by: 'openai' },
      { id: 'claude-3-7-sonnet-20250219', object: 'model', created: 1739900000, owned_by: 'anthropic' },
      { id: 'claude-3-5-sonnet-20241022', object: 'model', created: 1729500000, owned_by: 'anthropic' },
      { id: 'claude-3-5-haiku-20241022', object: 'model', created: 1729500000, owned_by: 'anthropic' },
      { id: 'gemini-2.5-pro', object: 'model', created: 1735000000, owned_by: 'google' },
      { id: 'gemini-2.0-flash', object: 'model', created: 1733000000, owned_by: 'google' },
      { id: 'deepseek-chat', object: 'model', created: 1730000000, owned_by: 'deepseek' },
      { id: 'deepseek-reasoner', object: 'model', created: 1737000000, owned_by: 'deepseek' },
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ object: 'list', data: standardModels }));
    return true;
  }

  const isOpenAIChat = url === '/v1/chat/completions' || url === '/chat/completions';
  const isOpenAIEmbeddings = url === '/v1/embeddings' || url === '/embeddings';
  const isAnthropicMessages = url === '/v1/messages' || url === '/messages';
  const isAnthropicCountTokens = url === '/v1/messages/count_tokens' || url === '/messages/count_tokens';

  const isOpenAI = isOpenAIChat || isOpenAIEmbeddings;
  const isAnthropic = isAnthropicMessages || isAnthropicCountTokens;

  if (!isOpenAI && !isAnthropic) {
    return false;
  }

  // Support CORS preflight for browser-based extensions or local apps on loopback
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }

  if (method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { message: 'Method Not Allowed', type: 'invalid_request_error' } }));
    return true;
  }

  const startTime = Date.now();
  let ttftMs: number | null = null;
  const provider = isOpenAI ? 'openai' : 'anthropic';
  const sessionId =
    (req.headers['x-session-id'] as string) ||
    (req.headers['ostraops-session'] as string) ||
    (req.headers['helicone-session-id'] as string) ||
    (req.headers['helicone-user-id'] as string) ||
    (req.headers['x-user-id'] as string) ||
    'default-session';

  // =========================================================================
  // 1. FINANCIAL & VELOCITY CIRCUIT BREAKER ENFORCEMENT
  // =========================================================================

  // A. Total Session Budget Cap Check
  try {
    const sessionSummary = ctx.repository.getSessionSummary(sessionId);
    if (sessionSummary.totalCostUsd >= ctx.config.sessionBudgetUsd) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: {
            message: `OstraOps Guard Circuit Breaker: Session budget cap of $${ctx.config.sessionBudgetUsd.toFixed(
              2
            )} USD reached. Current spend: $${sessionSummary.totalCostUsd.toFixed(4)} USD.`,
            type: 'budget_exceeded',
            code: 'budget_cap_exceeded',
          },
        })
      );
      return true;
    }
  } catch {
    // Non-fatal if session query fails
  }

  // B. Rolling Velocity Hard Circuit Breaker ($/min, TPM, RPM)
  const velocityBreaker = ctx.velocity.checkVelocityBreaker({
    maxCostPerMinUsd: ctx.config.maxVelocityUsdPerMin,
    maxTpm: ctx.config.maxTpm,
    maxRpm: ctx.config.rateLimitRpm,
  });

  if (velocityBreaker.tripped) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: {
          message: `OstraOps Financial Circuit Breaker: ${velocityBreaker.reason}`,
          type: 'velocity_limit_exceeded',
          code: 'circuit_breaker_tripped',
          details: {
            metric: velocityBreaker.metric,
            current: velocityBreaker.current,
            limit: velocityBreaker.limit,
            window_seconds: velocityBreaker.metrics.windowSeconds,
          },
        },
      })
    );
    return true;
  }

  // =========================================================================
  // 2. READ CLIENT PAYLOAD
  // =========================================================================
  let body: Record<string, any>;
  try {
    body = await readJsonBody(req);
  } catch (err: any) {
    res.writeHead(err.message === 'Payload Too Large' ? 413 : 400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { message: err.message, type: 'invalid_request_error' } }));
    return true;
  }

  const requestedModel = String(body.model || (isOpenAI ? 'gpt-4o' : 'claude-3-5-sonnet'));
  const isStreaming = Boolean(body.stream);
  const requestId = (req.headers['x-request-id'] as string) || `req_${crypto.randomBytes(8).toString('hex')}`;

  // Estimate baseline input tokens accurately up front
  const estimatedInputTokens = estimateMessageTokens(
    body.messages || body.prompt || (body.system ? [{ role: 'system', content: body.system }] : undefined),
    body.tools || body.functions
  );

  // Force stream_options: { include_usage: true } on OpenAI streaming to receive ground-truth tokens
  if (isOpenAIChat && isStreaming && !body.stream_options) {
    body.stream_options = { include_usage: true };
  }

  // =========================================================================
  // 3. RESOLVE UPSTREAM DESTINATION AND HEADERS
  // =========================================================================
  let upstreamUrl: string;
  const upstreamHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isOpenAI) {
    const base = ctx.config.upstreamGatewayUrl || 'https://api.openai.com';
    upstreamUrl = base.replace(/\/+$/, '') + (isOpenAIChat ? '/v1/chat/completions' : '/v1/embeddings');

    const clientAuth = req.headers['authorization'];
    if (clientAuth) {
      upstreamHeaders['Authorization'] = clientAuth as string;
    } else if (ctx.config.openaiApiKey) {
      upstreamHeaders['Authorization'] = `Bearer ${ctx.config.openaiApiKey}`;
    }

    if (req.headers['openai-organization']) {
      upstreamHeaders['OpenAI-Organization'] = req.headers['openai-organization'] as string;
    }
    if (req.headers['openai-project']) {
      upstreamHeaders['OpenAI-Project'] = req.headers['openai-project'] as string;
    }
  } else {
    // Anthropic
    const base = ctx.config.upstreamGatewayUrl || 'https://api.anthropic.com';
    upstreamUrl = base.replace(/\/+$/, '') + (isAnthropicMessages ? '/v1/messages' : '/v1/messages/count_tokens');

    const clientKey = req.headers['x-api-key'];
    if (clientKey) {
      upstreamHeaders['x-api-key'] = clientKey as string;
    } else if (ctx.config.anthropicApiKey) {
      upstreamHeaders['x-api-key'] = ctx.config.anthropicApiKey;
    }

    upstreamHeaders['anthropic-version'] =
      (req.headers['anthropic-version'] as string) || '2023-06-01';

    if (req.headers['anthropic-beta']) {
      upstreamHeaders['anthropic-beta'] = req.headers['anthropic-beta'] as string;
    }
  }

  // =========================================================================
  // 3.5 RESPONSE CACHING (Helicone Cache Parity)
  // =========================================================================
  const isCacheRequested =
    req.headers['x-ostra-cache'] === 'true' ||
    req.headers['helicone-cache-enabled'] === 'true' ||
    (body.temperature === 0 && !isStreaming);

  const customTtlSec = parseInt(
    (req.headers['x-ostra-cache-ttl'] as string) ||
    (req.headers['helicone-cache-ttl'] as string) ||
    '3600',
    10
  );
  const cacheTtlMs = Math.max(60, isNaN(customTtlSec) ? 3600 : customTtlSec) * 1000;

  if (isCacheRequested && !isStreaming) {
    const cacheKey = crypto
      .createHash('sha256')
      .update(`${provider}:${requestedModel}:${JSON.stringify(body)}`)
      .digest('hex');

    const cached = localResponseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      res.writeHead(cached.statusCode, {
        'Content-Type': cached.contentType,
        'X-Ostra-Cache': 'HIT',
        'Helicone-Cache-Status': 'HIT',
        'X-Ostra-Spend-Velocity': `${ctx.velocity.getMetrics().velocityCostPerMinuteUsd.toFixed(4)}/min`,
      });
      res.end(cached.responseBody);

      recordTrace(ctx, {
        id: crypto.randomUUID(),
        requestId,
        sessionId,
        provider,
        requestedModel,
        routedModel: cached.routedModel,
        statusCode: cached.statusCode,
        inputTokens: cached.inputTokens,
        outputTokens: cached.outputTokens,
        costUsd: 0,
        durationMs: 1,
        ttftMs: 1,
        stream: false,
        errorMessage: null,
        timestamp: startTime,
        createdAt: new Date(startTime).toISOString(),
      });
      return true;
    }
  }

  // =========================================================================
  // 4. DISPATCH UPSTREAM CALL WITH INTRA-FAMILY CASCADING
  // =========================================================================
  const abortController = new AbortController();
  req.on('close', () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  let upstreamRes: Response | null = null;
  let routedModel = requestedModel;
  let isFailedOver = false;

  const executeFetch = async (modelToUse: string): Promise<Response> => {
    const payload = { ...body, model: modelToUse };
    return await fetch(upstreamUrl, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });
  };

  try {
    upstreamRes = await executeFetch(requestedModel);

    // Check if intra-family failover applies (e.g. 5xx or overloaded 429)
    const fallbackModel = ctx.config.intraFamilyFailover ? getIntraFamilyFallback(requestedModel) : null;
    if (fallbackModel && isFailoverEligible(upstreamRes.status)) {
      console.warn(`[Guard] Upstream status ${upstreamRes.status} for ${requestedModel}. Cascading to sibling: ${fallbackModel}`);
      try {
        const cascadeRes = await executeFetch(fallbackModel);
        if (cascadeRes.status < 500) {
          upstreamRes = cascadeRes;
          routedModel = fallbackModel;
          isFailedOver = true;
        }
      } catch (cascadeErr) {
        console.warn('[Guard] Cascade attempt encountered error:', cascadeErr);
      }
    }
  } catch (fetchErr: any) {
    if (abortController.signal.aborted) {
      return true;
    }

    // Attempt cascade on network outage
    const fallbackModel = ctx.config.intraFamilyFailover ? getIntraFamilyFallback(requestedModel) : null;
    if (fallbackModel) {
      console.warn(`[Guard] Upstream unreachable for ${requestedModel}. Attempting cascade to: ${fallbackModel}`);
      try {
        upstreamRes = await executeFetch(fallbackModel);
        routedModel = fallbackModel;
        isFailedOver = true;
      } catch {
        // Fall through to 502
      }
    }

    if (!upstreamRes) {
      const durationMs = Date.now() - startTime;
      const errMsg = fetchErr.message || 'Upstream gateway unreachable';
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: errMsg, type: 'gateway_error' } }));

      recordTrace(ctx, {
        id: crypto.randomUUID(),
        requestId,
        sessionId,
        provider,
        requestedModel,
        routedModel: requestedModel,
        statusCode: 502,
        inputTokens: estimatedInputTokens,
        outputTokens: 0,
        costUsd: 0,
        durationMs,
        ttftMs: null,
        stream: isStreaming,
        errorMessage: errMsg,
        timestamp: startTime,
        createdAt: new Date(startTime).toISOString(),
      });

      return true;
    }
  }

  const statusCode = upstreamRes.status;

  // =========================================================================
  // 5. STREAMING RESPONSE HANDLER (SSE)
  // =========================================================================
  if (isStreaming && statusCode === 200) {
    const streamHeaders: Record<string, string> = {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'X-Ostra-Spend-Velocity': `${ctx.velocity.getMetrics().velocityCostPerMinuteUsd.toFixed(4)}/min`,
    };
    if (isFailedOver) {
      streamHeaders['X-Ostra-Failover'] = 'true';
      streamHeaders['X-Ostra-Original-Model'] = requestedModel;
      streamHeaders['X-Ostra-Routed-Model'] = routedModel;
    }

    res.writeHead(200, streamHeaders);

    let inputTokens = estimatedInputTokens;
    let outputTokens = 0;
    let accumulatedText = '';
    let buffer = '';

    const reader = upstreamRes.body?.getReader();

    if (reader) {
      const decoder = new TextDecoder('utf-8');

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (ttftMs === null) {
            ttftMs = Date.now() - startTime;
          }

          // Forward chunk immediately to client with zero added latency
          res.write(value);

          // Parse SSE chunk
          const textChunk = decoder.decode(value, { stream: true });
          buffer += textChunk;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.slice(5).trim();
            if (!dataStr || dataStr === '[DONE]') continue;

            try {
              const dataObj = JSON.parse(dataStr);
              const delta = extractStreamingChunk(dataObj, provider);

              if (delta.routedModel) routedModel = delta.routedModel;
              if (delta.textDelta) accumulatedText += delta.textDelta;
              if (typeof delta.inputTokens === 'number') inputTokens = delta.inputTokens;
              if (typeof delta.outputTokens === 'number') outputTokens = delta.outputTokens;
            } catch {
              // Ignore unparseable SSE frame
            }
          }
        }
      } catch (streamErr: any) {
        if (!abortController.signal.aborted) {
          console.warn('[Proxy] Stream consumption warning:', streamErr.message);
        }
      } finally {
        res.end();
      }
    } else {
      res.end();
    }

    // Precise fallback token counting if upstream omitted usage frame
    if (outputTokens === 0 && accumulatedText.length > 0) {
      outputTokens = estimateTextTokens(accumulatedText);
    }
    if (inputTokens === 0) {
      inputTokens = Math.max(1, estimatedInputTokens);
    }

    const durationMs = Date.now() - startTime;
    const costUsd = calculateCost(routedModel, inputTokens, outputTokens);

    recordTrace(ctx, {
      id: crypto.randomUUID(),
      requestId,
      sessionId,
      provider,
      requestedModel,
      routedModel,
      statusCode,
      inputTokens,
      outputTokens,
      costUsd,
      durationMs,
      ttftMs,
      stream: true,
      errorMessage: null,
      timestamp: startTime,
      createdAt: new Date(startTime).toISOString(),
    });

    return true;
  }

  // =========================================================================
  // 6. NON-STREAMING RESPONSE (OR ERROR) HANDLER
  // =========================================================================
  let rawResponseText = '';
  try {
    rawResponseText = await upstreamRes.text();
  } catch (err: any) {
    rawResponseText = JSON.stringify({ error: { message: err.message } });
  }

  const durationMs = Date.now() - startTime;
  let parsedRes: Record<string, any> = {};
  try {
    parsedRes = JSON.parse(rawResponseText);
  } catch {
    // Non-JSON response
  }

  let inputTokens = estimatedInputTokens;
  let outputTokens = 0;
  let errorMessage: string | null = null;

  if (statusCode >= 400) {
    errorMessage = parsedRes.error?.message || parsedRes.message || `Upstream error HTTP ${statusCode}`;
  } else {
    if (parsedRes.model) routedModel = parsedRes.model;

    if (isOpenAI) {
      if (parsedRes.usage) {
        inputTokens = parsedRes.usage.prompt_tokens || inputTokens;
        outputTokens = parsedRes.usage.completion_tokens || 0;
      }
    } else {
      // Anthropic
      if (parsedRes.usage) {
        inputTokens = parsedRes.usage.input_tokens || inputTokens;
        outputTokens = parsedRes.usage.output_tokens || 0;
      }
    }

    // If usage block was absent in non-streaming response
    if (outputTokens === 0) {
      const completionText =
        parsedRes.choices?.[0]?.message?.content ||
        parsedRes.content?.[0]?.text ||
        '';
      if (completionText) {
        outputTokens = estimateTextTokens(completionText);
      }
    }
  }

  const costUsd = calculateCost(routedModel, inputTokens, outputTokens);

  // Save to Cache if eligible
  if (isCacheRequested && statusCode === 200) {
    const cacheKey = crypto
      .createHash('sha256')
      .update(`${provider}:${requestedModel}:${JSON.stringify(body)}`)
      .digest('hex');

    if (localResponseCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = localResponseCache.keys().next().value;
      if (oldestKey) localResponseCache.delete(oldestKey);
    }

    localResponseCache.set(cacheKey, {
      responseBody: rawResponseText,
      contentType: upstreamRes.headers.get('content-type') || 'application/json',
      statusCode: 200,
      inputTokens,
      outputTokens,
      routedModel,
      expiresAt: Date.now() + cacheTtlMs,
    });
    res.setHeader('X-Ostra-Cache', 'MISS');
    res.setHeader('Helicone-Cache-Status', 'MISS');
  }

  const responseHeaders: Record<string, string> = {
    'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
    'X-Ostra-Spend-Velocity': `${ctx.velocity.getMetrics().velocityCostPerMinuteUsd.toFixed(4)}/min`,
    'X-Ostra-Session-Cost': `$${(ctx.repository.getSessionSummary(sessionId).totalCostUsd + costUsd).toFixed(4)}`,
  };
  if (isFailedOver) {
    responseHeaders['X-Ostra-Failover'] = 'true';
    responseHeaders['X-Ostra-Original-Model'] = requestedModel;
    responseHeaders['X-Ostra-Routed-Model'] = routedModel;
  }

  res.writeHead(statusCode, responseHeaders);
  res.end(rawResponseText);

  recordTrace(ctx, {
    id: crypto.randomUUID(),
    requestId,
    sessionId,
    provider,
    requestedModel,
    routedModel,
    statusCode,
    inputTokens,
    outputTokens,
    costUsd,
    durationMs,
    ttftMs: null,
    stream: false,
    errorMessage,
    timestamp: startTime,
    createdAt: new Date(startTime).toISOString(),
  });

  return true;
}

/**
 * Commits trace to SQLite WAL and broadcasts updates to SSE consumers.
 */
function recordTrace(ctx: IngressContext, trace: LocalTraceRecord): void {
  try {
    ctx.repository.insert(trace);
    ctx.velocity.record(trace.inputTokens, trace.outputTokens, trace.costUsd, trace.timestamp);
    ctx.sseBroker.broadcast('trace', trace);
    ctx.sseBroker.broadcast('metrics', {
      velocity: ctx.velocity.getMetrics(),
      totalCostUsd: ctx.repository.getSessionSummary(trace.sessionId).totalCostUsd,
    });
  } catch (err) {
    console.error('[Proxy] Failed to record trace to repository:', err);
  }
}
