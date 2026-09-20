import http from 'node:http';
import crypto from 'node:crypto';
import type { DaemonConfig } from '../config.js';
import { TraceRepository, type LocalTraceRecord } from '../db/repository.js';
import { RollingVelocityEngine } from '../engine/velocity.js';
import { SseBroker } from '../engine/sse-broker.js';
import { calculateCost } from './pricing.js';

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

  const isOpenAI = url === '/v1/chat/completions' || url === '/chat/completions';
  const isAnthropic = url === '/v1/messages' || url === '/messages';

  if (!isOpenAI && !isAnthropic) {
    return false;
  }

  // Support CORS preflight for browser-based extensions or local apps
  res.setHeader('Access-Control-Allow-Origin', '*');
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
  const sessionId = (req.headers['x-session-id'] as string) || (req.headers['ostraops-session'] as string) || 'default-session';

  // 1. Circuit Breaker: Check session budget
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
  } catch (err) {
    // Non-fatal, proceed
  }

  // 2. Read client payload
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

  // 3. Resolve upstream destination and credentials
  let upstreamUrl: string;
  const upstreamHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isOpenAI) {
    const base = ctx.config.upstreamGatewayUrl || 'https://api.openai.com';
    upstreamUrl = base.replace(/\/+$/, '') + '/v1/chat/completions';

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
    upstreamUrl = base.replace(/\/+$/, '') + '/v1/messages';

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

  // 4. Setup AbortController for client disconnect propagation
  const abortController = new AbortController();
  req.on('close', () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  // 5. Dispatch upstream request
  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify(body),
      signal: abortController.signal,
    });
  } catch (fetchErr: any) {
    if (abortController.signal.aborted) {
      return true;
    }
    const durationMs = Date.now() - startTime;
    const errMsg = fetchErr.message || 'Upstream gateway unreachable';
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { message: errMsg, type: 'gateway_error' } }));

    // Record failure trace
    recordTrace(ctx, {
      id: crypto.randomUUID(),
      requestId,
      sessionId,
      provider,
      requestedModel,
      routedModel: requestedModel,
      statusCode: 502,
      inputTokens: 0,
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

  const statusCode = upstreamRes.status;

  // 6. Handle Streaming vs Non-Streaming
  if (isStreaming && statusCode === 200) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    let inputTokens = 0;
    let outputTokens = 0;
    let routedModel = requestedModel;
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

          // Forward chunk directly to client immediately
          res.write(value);

          // Parse SSE chunk for token usage and model metadata
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
              if (dataObj.model) routedModel = dataObj.model;

              if (isOpenAI) {
                // OpenAI streaming usage or delta
                if (dataObj.usage) {
                  if (dataObj.usage.prompt_tokens) inputTokens = dataObj.usage.prompt_tokens;
                  if (dataObj.usage.completion_tokens) outputTokens = dataObj.usage.completion_tokens;
                }
                const deltaContent = dataObj.choices?.[0]?.delta?.content;
                if (deltaContent) accumulatedText += deltaContent;
              } else {
                // Anthropic SSE events
                if (dataObj.type === 'message_start' && dataObj.message) {
                  if (dataObj.message.model) routedModel = dataObj.message.model;
                  if (dataObj.message.usage?.input_tokens) {
                    inputTokens = dataObj.message.usage.input_tokens;
                  }
                }
                if (dataObj.type === 'message_delta' && dataObj.usage) {
                  if (dataObj.usage.output_tokens) {
                    outputTokens = dataObj.usage.output_tokens;
                  }
                }
                if (dataObj.type === 'content_block_delta' && dataObj.delta?.text) {
                  accumulatedText += dataObj.delta.text;
                }
              }
            } catch {
              // Ignore unparseable SSE sub-frame
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

    // Fallback token estimation if upstream didn't send usage chunks
    if (outputTokens === 0 && accumulatedText.length > 0) {
      outputTokens = Math.max(1, Math.ceil(accumulatedText.length / 4));
    }
    if (inputTokens === 0) {
      // Estimate input tokens from request body messages length
      const rawPrompt = JSON.stringify(body.messages || body.prompt || '');
      inputTokens = Math.max(1, Math.ceil(rawPrompt.length / 4));
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

  // 7. Handle Non-Streaming (or Error Response)
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

  let inputTokens = 0;
  let outputTokens = 0;
  let routedModel = requestedModel;
  let errorMessage: string | null = null;

  if (statusCode >= 400) {
    errorMessage = parsedRes.error?.message || parsedRes.message || `Upstream error HTTP ${statusCode}`;
  } else {
    if (parsedRes.model) routedModel = parsedRes.model;

    if (isOpenAI) {
      if (parsedRes.usage) {
        inputTokens = parsedRes.usage.prompt_tokens || 0;
        outputTokens = parsedRes.usage.completion_tokens || 0;
      }
    } else {
      // Anthropic
      if (parsedRes.usage) {
        inputTokens = parsedRes.usage.input_tokens || 0;
        outputTokens = parsedRes.usage.output_tokens || 0;
      }
    }
  }

  const costUsd = calculateCost(routedModel, inputTokens, outputTokens);

  // Send upstream response back to client
  res.writeHead(statusCode, {
    'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
  });
  res.end(rawResponseText);

  // Record completed trace
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
 * Commits trace to SQLite WAL and broadcasts update to SSE consumers.
 */
function recordTrace(ctx: IngressContext, trace: LocalTraceRecord): void {
  try {
    ctx.repository.insert(trace);
    ctx.velocity.record(trace.inputTokens, trace.outputTokens, trace.timestamp);
    ctx.sseBroker.broadcast('trace', trace);
    ctx.sseBroker.broadcast('metrics', {
      velocity: ctx.velocity.getMetrics(),
      totalCostUsd: ctx.repository.getSessionSummary(trace.sessionId).totalCostUsd,
    });
  } catch (err) {
    console.error('[Proxy] Failed to record trace to repository:', err);
  }
}
