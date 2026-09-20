import assert from 'node:assert';
import { Readable, Writable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleGatewayIngress } from '../proxy/ingress';
import { hashApiKey, InMemoryVirtualKeyCache, type CachedVirtualKey } from '../middleware/cache';
import { InMemoryRateLimitStore } from '../middleware/gatekeeper';
import { extractOrGenerateRequestId } from '../middleware/correlation';

// Helper mock to construct IncomingMessage
function createMockRequest(options: {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}): { req: IncomingMessage; emitClientClose: () => void } {
  const stream = new Readable({
    read() {
      if (options.body !== undefined) {
        this.push(Buffer.from(options.body, 'utf8'));
      }
      this.push(null);
    },
  });

  const req = stream as unknown as IncomingMessage;
  req.url = options.url || '/v1/chat/completions';
  req.method = options.method || 'POST';
  req.headers = options.headers || {};

  const emitClientClose = () => {
    stream.emit('close');
  };

  return { req, emitClientClose };
}

// Helper mock to capture ServerResponse
interface MockResponseResult {
  res: ServerResponse;
  getStatusCode: () => number;
  getHeaders: () => Record<string, string | number | readonly string[]>;
  getBody: () => string;
  getJson: () => Record<string, unknown>;
}

function createMockResponse(): MockResponseResult {
  let statusCode = 200;
  const headers: Record<string, string | number | readonly string[]> = {};
  const chunks: Buffer[] = [];

  const writable = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      callback();
    },
  });

  const res = writable as unknown as ServerResponse;
  (res as any).writeHead = (status: number, hdrs?: Record<string, string | number | readonly string[]>) => {
    statusCode = status;
    if (hdrs) Object.assign(headers, hdrs);
    return res;
  };
  res.setHeader = (key: string, value: string | number | readonly string[]) => {
    headers[key.toLowerCase()] = value;
    return res;
  };
  const origEnd = writable.end.bind(writable);
  res.end = (chunk?: unknown) => {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
    }
    origEnd();
    return res;
  };

  return {
    res,
    getStatusCode: () => statusCode,
    getHeaders: () => headers,
    getBody: () => Buffer.concat(chunks).toString('utf8'),
    getJson: () => JSON.parse(Buffer.concat(chunks).toString('utf8')),
  };
}

async function runSelfCheck() {
  console.log('[Self-Check] Starting Phase 2 Gateway Edge Validation...');

  const cache = new InMemoryVirtualKeyCache(60);
  const limiter = new InMemoryRateLimitStore();

  const rawToken = 'ost_live_test_secret_key_12345';
  const hashedKey = hashApiKey(rawToken);

  const activeKey: CachedVirtualKey = {
    id: 'vk_test_active_1',
    organizationId: 'org_test_1',
    projectId: 'proj_test_1',
    environmentId: 'env_test_1',
    name: 'Production Worker Key',
    keyPrefix: 'ost_live_test',
    keyHash: hashedKey,
    monthlyLimitUsd: 100.0,
    currentSpendUsd: 10.0,
    status: 'active',
    rateLimits: {
      rpm: 5,
      tpm: 10000,
      maxConcurrency: 2,
    },
    cachedAt: Date.now(),
    expiresAt: Date.now() + 60000,
  };

  cache.set(activeKey);

  // --------------------------------------------------------------------------
  // Test 1: Request correlation header generation & propagation
  // --------------------------------------------------------------------------
  {
    console.log('-> Test 1: Correlation ID extraction and generation...');
    const customId = 'ost_req_custom_trace_999';
    const extracted = extractOrGenerateRequestId({ 'x-request-id': customId });
    assert.strictEqual(extracted, customId, 'Should extract custom X-Request-ID');

    const generated = extractOrGenerateRequestId({});
    assert.ok(generated.startsWith('ost_req_'), 'Generated ID must start with ost_req_');
  }

  // --------------------------------------------------------------------------
  // Test 2: Zero-byte pre-ingest auth check (401 without reading body)
  // --------------------------------------------------------------------------
  {
    console.log('-> Test 2: Zero-byte auth rejection with OpenAI error payload...');
    const { req } = createMockRequest({
      headers: {}, // No authorization header
      body: '{"model":"gpt-4o","messages":[]}',
    });
    const { res, getStatusCode, getJson } = createMockResponse();

    await handleGatewayIngress(req, res, { cache, limiter });

    assert.strictEqual(getStatusCode(), 401, 'Must return 401 on missing auth');
    const json = getJson() as { error: { code: string; type: string; param: unknown; message: string } };
    assert.strictEqual(json.error.code, 'OSTRAOPS_UNAUTHORIZED');
    assert.strictEqual(json.error.type, 'authentication_error');
    assert.strictEqual(json.error.param, null);
  }

  // --------------------------------------------------------------------------
  // Test 3: Layer 1 Velocity Check (RPM & Concurrency Limits)
  // --------------------------------------------------------------------------
  {
    console.log('-> Test 3: Layer 1 Rate limit & concurrency slot tracking...');
    limiter.reset();

    // Key allows 2 max concurrency
    const mockKey = cache.get(hashedKey)!;

    // Concurrency slot 1
    limiter.acquireSlot(mockKey.id);
    assert.strictEqual(limiter.getActiveConcurrency(mockKey.id), 1);

    // Concurrency slot 2
    limiter.acquireSlot(mockKey.id);
    assert.strictEqual(limiter.getActiveConcurrency(mockKey.id), 2);

    // Concurrency slot 3 should be rejected with 429
    const check = limiter.checkLimit(mockKey);
    assert.strictEqual(check.allowed, false);
    assert.strictEqual(check.status, 429);
    assert.strictEqual(check.errorPayload?.error.code, 'OSTRAOPS_RATE_LIMITED');

    // Release slots
    limiter.releaseSlot(mockKey.id);
    limiter.releaseSlot(mockKey.id);
    assert.strictEqual(limiter.getActiveConcurrency(mockKey.id), 0);
  }

  // --------------------------------------------------------------------------
  // Test 4: Concurrency slot leak protection via try ... finally
  // --------------------------------------------------------------------------
  {
    console.log('-> Test 4: Guaranteed slot release on malformed JSON payload...');
    limiter.reset();

    const { req } = createMockRequest({
      headers: { authorization: `Bearer ${rawToken}` },
      body: '{ this is malformed json }}}',
    });
    const { res, getStatusCode, getJson } = createMockResponse();

    await handleGatewayIngress(req, res, { cache, limiter });

    assert.strictEqual(getStatusCode(), 400, 'Must return 400 on malformed JSON');
    const json = getJson() as { error: { code: string } };
    assert.strictEqual(json.error.code, 'OSTRAOPS_MALFORMED_JSON');

    // Concurrency slot MUST have been released in finally block
    assert.strictEqual(
      limiter.getActiveConcurrency(activeKey.id),
      0,
      'Active concurrency slot must be 0 after error'
    );
  }

  // --------------------------------------------------------------------------
  // Test 5: Layer 2 Pre-flight budget check with conservative fallback rate
  // --------------------------------------------------------------------------
  {
    console.log('-> Test 5: Layer 2 budget check & conservative flagship rate...');
    const nearLimitKey: CachedVirtualKey = {
      ...activeKey,
      id: 'vk_test_near_limit',
      keyHash: hashApiKey('ost_live_near_limit_key'),
      monthlyLimitUsd: 10.0,
      currentSpendUsd: 9.99, // Only $0.01 headroom left
    };
    cache.set(nearLimitKey);

    // Request with unknown model (must use conservative $15/1M fallback rate * 1.35 safety buffer)
    const largePromptBody = JSON.stringify({
      model: 'unknown-experimental-reasoning-model',
      messages: [{ role: 'user', content: 'A'.repeat(5000) }],
    });

    const { req } = createMockRequest({
      headers: { authorization: 'Bearer ost_live_near_limit_key' },
      body: largePromptBody,
    });
    const { res, getStatusCode, getJson } = createMockResponse();

    await handleGatewayIngress(req, res, { cache, limiter });

    assert.strictEqual(getStatusCode(), 402, 'Must return 402 on budget cap exhaustion');
    const json = getJson() as { error: { code: string; type: string } };
    assert.strictEqual(json.error.code, 'OSTRAOPS_BUDGET_EXCEEDED');
    assert.strictEqual(json.error.type, 'ostraops_budget_exceeded');

    // Concurrency slot must still be 0
    assert.strictEqual(limiter.getActiveConcurrency(nearLimitKey.id), 0);
  }

  // --------------------------------------------------------------------------
  // Test 6: Guarded Abort Controller (No false positive after normal completion)
  // --------------------------------------------------------------------------
  {
    console.log('-> Test 6: Guarded abort signal does not fire after normal response...');
    let observedAbort = false;

    const { req, emitClientClose } = createMockRequest({
      headers: { authorization: `Bearer ${rawToken}` },
      body: JSON.stringify({ model: 'gpt-4o', messages: [] }),
    });
    const { res, getStatusCode } = createMockResponse();

    await handleGatewayIngress(req, res, {
      cache,
      limiter,
      onForwardToRouter: async (ctx, response) => {
        ctx.abortController.signal.addEventListener('abort', () => {
          observedAbort = true;
        });
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end('{"status":"ok"}');
      },
    });

    assert.strictEqual(getStatusCode(), 200);

    // Simulate socket close AFTER response has already finished
    emitClientClose();

    // Guard ensures abort was NOT fired on natural completion
    assert.strictEqual(observedAbort, false, 'AbortController must not trigger after res finishes');
  }

  console.log('✔ All Phase 2 Self-Check Tests Passed Successfully!');
  // Clean up
  cache.destroy();
}

runSelfCheck().catch((err) => {
  console.error('Self-Check Failed:', err);
  process.exit(1);
});
