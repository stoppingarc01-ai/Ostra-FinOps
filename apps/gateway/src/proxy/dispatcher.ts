import type { ModelSpec } from '../registry/types';
import type { UpstreamDispatcher, UpstreamDispatchResult } from '../streaming/types';
import type { ISecretResolver } from '../vault/types';

export const PROVIDER_DEFAULT_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  deepseek: 'https://api.deepseek.com/chat/completions',
  grok: 'https://api.x.ai/v1/chat/completions',
  qwen: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
  glm: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  kimi: 'https://api.moonshot.cn/v1/chat/completions',
};

export interface DispatcherOptions {
  secretResolver?: ISecretResolver;
  orgId?: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
  customEndpoints?: Record<string, string>;
}

/**
 * Converts a Web ReadableStream to an AsyncIterable of Buffers/Strings.
 */
async function* webStreamToAsyncIterable(
  stream: ReadableStream<Uint8Array>
): AsyncIterable<Buffer> {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        yield Buffer.from(value);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Creates a production-grade UpstreamDispatcher with header sanitization,
 * provider-specific wire formatting, and cascading timeout handling.
 */
export function createUpstreamDispatcher(options?: DispatcherOptions): UpstreamDispatcher {
  const fetchImpl = options?.fetchFn ?? fetch;
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const secretResolver = options?.secretResolver;
  const orgId = options?.orgId;
  const customEndpoints = options?.customEndpoints;

  return async (
    targetModel: ModelSpec,
    payload: Record<string, unknown>,
    signal: AbortSignal
  ): Promise<UpstreamDispatchResult> => {
    const provider = targetModel.provider.toLowerCase();
    const endpoint = customEndpoints?.[provider] || PROVIDER_DEFAULT_ENDPOINTS[provider];

    if (!endpoint) {
      throw new Error(`Unsupported provider endpoint for: ${provider}`);
    }

    // 1. Resolve Provider Key from Vault / Secrets
    let apiKey: string | null = null;
    if (secretResolver && orgId) {
      apiKey = await secretResolver.resolveProviderKey(orgId, provider);
    }
    if (!apiKey) {
      const envKeyName = `${provider.toUpperCase()}_API_KEY`;
      apiKey = process.env[envKeyName] || null;
    }

    // 2. Build Provider-Specific Headers (Strips downstream client headers)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'OsterdOps-Gateway/2.0',
    };

    if (apiKey) {
      if (provider === 'anthropic') {
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
      } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
    }

    // 3. Link Request Timeout with Cascading Abort
    const timeoutController = new AbortController();
    const timer = setTimeout(() => timeoutController.abort(), timeoutMs);

    const onAbort = () => timeoutController.abort();
    signal.addEventListener('abort', onAbort, { once: true });

    try {
      const isStreaming = payload.stream === true;
      const res = await fetchImpl(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: timeoutController.signal,
      });

      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);

      // Collect upstream headers
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key.toLowerCase()] = value;
      });

      // 4. Handle Streaming vs Non-Streaming
      if (isStreaming && res.body) {
        return {
          statusCode: res.status,
          headers: responseHeaders,
          isStream: true,
          stream: webStreamToAsyncIterable(res.body as ReadableStream<Uint8Array>),
        };
      }

      // Non-streaming body text
      const bodyText = await res.text();
      return {
        statusCode: res.status,
        headers: responseHeaders,
        isStream: false,
        body: bodyText,
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      throw err;
    }
  };
}
