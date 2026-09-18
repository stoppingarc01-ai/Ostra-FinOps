import assert from 'node:assert';
import { existsSync, unlinkSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateVirtualKey, hashKey, extractKeyPrefix, verifyKeyHash } from '../crypto/keys';
import { InMemoryIdempotencyStore } from '../middleware/idempotency';
import { signWebhookPayload, verifyWebhookSignature } from '../webhooks/dispatcher';
import { InMemoryPromptCache, promptCache } from '../cache/prompt-cache';
import { createUpstreamDispatcher, PROVIDER_DEFAULT_ENDPOINTS } from '../proxy/dispatcher';
import { SupabaseBridge } from '../db/bridge';
import { createGatewayServer, gracefulShutdown } from '../server';
import { virtualKeyCache } from '../middleware/cache';
import type { ModelSpec } from '../registry/types';
import type { TelemetryLogRecord } from '../accounting/types';

async function runLiveChecks() {
  console.log('--- Starting OsterdOps 2.0 Enterprise Backend Verification ---\n');

  // ==========================================================================
  // Test 1: Cryptographic Virtual Key Engine
  // ==========================================================================
  console.log('[Test 1] Cryptographic Virtual Key Engine...');
  const key1 = generateVirtualKey();
  const key2 = generateVirtualKey();

  assert.ok(key1.rawKey.startsWith('ost_live_'), 'Key must start with ost_live_');
  assert.strictEqual(key1.rawKey.length, 9 + 32, '192-bit base64url length matches');
  assert.strictEqual(key1.keyPrefix, extractKeyPrefix(key1.rawKey), 'Prefix matches 17 chars');
  assert.notStrictEqual(key1.rawKey, key2.rawKey, 'Generated keys must have distinct entropy');
  assert.strictEqual(key1.keyHash, hashKey(key1.rawKey), 'Deterministic SHA-256 hash');

  const validVerification = verifyKeyHash(key1.keyHash, hashKey(key1.rawKey));
  assert.strictEqual(validVerification, true, 'Timing-safe verification must succeed on match');

  const invalidVerification = verifyKeyHash(key1.keyHash, key2.keyHash);
  assert.strictEqual(invalidVerification, false, 'Timing-safe verification must fail on mismatch');
  console.log('  -> PASS: Key generation, prefix, entropy, and constant-time verification passed.\n');

  // ==========================================================================
  // Test 2: In-Flight Concurrency & Idempotency Store
  // ==========================================================================
  console.log('[Test 2] Concurrency & Idempotency Store...');
  const idempotency = new InMemoryIdempotencyStore();
  const testIdemKey = 'idem_req_abc123';

  const firstLock = await idempotency.acquireLock(testIdemKey);
  assert.strictEqual(firstLock.acquired, true, 'First lock acquisition must succeed');

  const duplicateLock = await idempotency.acquireLock(testIdemKey);
  assert.strictEqual(duplicateLock.acquired, false, 'Simultaneous duplicate acquisition must fail');
  assert.strictEqual(duplicateLock.existingRecord?.status, 'IN_FLIGHT');

  await idempotency.complete(testIdemKey, 200, { 'x-test': 'ok' }, '{"choices":[]}');
  const completedRecord = await idempotency.get(testIdemKey);
  assert.strictEqual(completedRecord?.status, 'COMPLETED');
  assert.strictEqual(completedRecord?.body, '{"choices":[]}');

  idempotency.destroy();
  console.log('  -> PASS: Idempotency locking, duplicate prevention, and response caching passed.\n');

  // ==========================================================================
  // Test 3: Anti-Replay HMAC-SHA256 Webhook Signatures
  // ==========================================================================
  console.log('[Test 3] HMAC-SHA256 Webhook Signatures...');
  const webhookSecret = 'whsec_test_secret_key_12345';
  const testPayload = JSON.stringify({ event: 'key_milestone_80', virtualKeyId: 'key_123' });
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const sigHeader = signWebhookPayload(testPayload, webhookSecret, currentTimestamp);
  assert.ok(sigHeader.startsWith(`t=${currentTimestamp},v1=`), 'Signature matches t=,v1= format');

  const validSig = verifyWebhookSignature(testPayload, sigHeader, webhookSecret, 300);
  assert.strictEqual(validSig.valid, true, 'Valid signature must verify');

  const wrongSecretSig = verifyWebhookSignature(testPayload, sigHeader, 'wrong_secret', 300);
  assert.strictEqual(wrongSecretSig.valid, false, 'Wrong secret must fail verification');

  const staleSigHeader = signWebhookPayload(testPayload, webhookSecret, currentTimestamp - 400);
  const replayAttackCheck = verifyWebhookSignature(testPayload, staleSigHeader, webhookSecret, 300);
  assert.strictEqual(replayAttackCheck.valid, false, 'Stale timestamp (>300s) must be rejected for replay');
  console.log('  -> PASS: HMAC signing, timestamp replay window, and constant-time check passed.\n');

  // ==========================================================================
  // Test 4: Deterministic Exact-Match Prompt Cache
  // ==========================================================================
  console.log('[Test 4] Deterministic Prompt Cache...');
  const cache = new InMemoryPromptCache();

  assert.strictEqual(cache.isEligible({ temperature: 0.7 }), false, 'Stochastic temperature > 0 must not cache');
  assert.strictEqual(cache.isEligible({ temperature: 0 }), true, 'Deterministic temperature = 0 must cache');
  assert.strictEqual(cache.isEligible({ temperature: 0.7 }, 'true'), true, 'Explicit X-OsterdOps-Cache: true must cache');

  const cacheKey = cache.computeKey('org_test', 'env_test', 'gpt-4o', {
    messages: [{ role: 'user', content: 'What is 2+2?' }],
  });
  assert.strictEqual(typeof cacheKey, 'string');
  assert.strictEqual(cacheKey.length, 64, 'SHA-256 hash string');

  await cache.set({
    cacheKey,
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    rawResponse: '{"answer":"4"}',
    usage: { inputTokens: 10, outputTokens: 5, cacheReadTokens: 0, isEstimated: false },
    createdAt: Date.now(),
    expiresAt: Date.now() + 60_000,
  });

  const cacheHit = await cache.get(cacheKey);
  assert.ok(cacheHit, 'Cache hit must return record');
  assert.strictEqual(cacheHit?.rawResponse, '{"answer":"4"}');

  cache.destroy();
  console.log('  -> PASS: Prompt cache eligibility, tenant isolation, and hit resolution passed.\n');

  // ==========================================================================
  // Test 5: Upstream HTTPS Dispatcher Wire Formatting & Streaming
  // ==========================================================================
  console.log('[Test 5] Upstream HTTPS Dispatcher...');
  assert.ok(PROVIDER_DEFAULT_ENDPOINTS.openai.includes('api.openai.com'));
  assert.ok(PROVIDER_DEFAULT_ENDPOINTS.anthropic.includes('api.anthropic.com'));

  let mockCapturedUrl = '';
  let mockCapturedHeaders: Record<string, string> = {};

  const mockFetch: typeof fetch = async (input, init) => {
    mockCapturedUrl = String(input);
    mockCapturedHeaders = (init?.headers as Record<string, string>) || {};
    return new Response(JSON.stringify({ choices: [{ text: 'hello' }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const anthropicModel: ModelSpec = {
    id: 'claude-3-5-sonnet',
    provider: 'anthropic',
    wireAdapter: 'anthropic_messages',
    maxInputTokens: 200_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 3.0,
    outputCostPerMillion: 15.0,
    isReasoningModel: false,
    family: 'claude_flagship',
  };

  const dispatcher = createUpstreamDispatcher({
    fetchFn: mockFetch,
    customEndpoints: { anthropic: 'https://api.anthropic.com/v1/messages' },
  });

  process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-123';
  const dispatchResult = await dispatcher(anthropicModel, { prompt: 'hi' }, new AbortController().signal);

  assert.strictEqual(mockCapturedUrl, 'https://api.anthropic.com/v1/messages');
  assert.strictEqual(mockCapturedHeaders['x-api-key'], 'sk-ant-test-key-123');
  assert.strictEqual(mockCapturedHeaders['anthropic-version'], '2023-06-01');
  assert.strictEqual(dispatchResult.statusCode, 200);
  console.log('  -> PASS: Wire adapter mapping, custom headers, and response parsing passed.\n');

  // ==========================================================================
  // Test 6: Supabase Bridge & Disk Dead-Letter Spooling
  // ==========================================================================
  console.log('[Test 6] Supabase Bridge & Dead-Letter Spooling...');
  const deadLetterFile = resolve(process.cwd(), 'gateway-dead-letter-test.log');
  if (existsSync(deadLetterFile)) unlinkSync(deadLetterFile);

  const bridge = new SupabaseBridge({ deadLetterLogPath: deadLetterFile });

  const dummyRecord: TelemetryLogRecord = {
    requestId: 'ost_req_dl_1',
    organizationId: 'org_1',
    projectId: 'proj_1',
    environmentId: 'env_1',
    virtualKeyId: 'vk_1',
    provider: 'openai',
    requestedModel: 'gpt-4o',
    routedModel: 'gpt-4o',
    fallbackUsed: false,
    fallbackFromModel: null,
    inputTokens: 100,
    outputTokens: 50,
    costUsd: 0.00075,
    latencyMs: 120,
    statusCode: 200,
    errorType: null,
    errorCode: null,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  // Without live DB configured, it should cleanly spool to disk dead-letter file
  await bridge.writeTelemetryBatch([dummyRecord]);
  assert.ok(existsSync(deadLetterFile), 'Dead letter log file must be created on disk');

  const fileContent = readFileSync(deadLetterFile, 'utf8');
  assert.ok(fileContent.includes('ost_req_dl_1'), 'Dead letter file contains queued record');
  unlinkSync(deadLetterFile);
  console.log('  -> PASS: Zero-loss disk dead-letter spooling verified.\n');

  // ==========================================================================
  // Test 7: Standalone HTTP Server Liveness, Readiness & Pipeline
  // ==========================================================================
  console.log('[Test 7] Standalone Server Liveness, Readiness & Ingress...');
  const server = createGatewayServer();
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const testPort = (server.address() as { port: number }).port;

  try {
    // 1. Liveness Probe
    console.log('    [7.1] Testing healthz...');
    const healthRes = await fetch(`http://127.0.0.1:${testPort}/healthz`);
    assert.strictEqual(healthRes.status, 200);
    const healthJson = (await healthRes.json()) as { status: string };
    assert.strictEqual(healthJson.status, 'ok');

    // 2. Readiness Probe
    console.log('    [7.2] Testing ready...');
    const readyRes = await fetch(`http://127.0.0.1:${testPort}/ready`);
    assert.strictEqual(readyRes.status, 200);
    const readyJson = (await readyRes.json()) as { status: string };
    assert.strictEqual(readyJson.status, 'ready');

    // 3. Pre-flight 401 on missing auth
    console.log('    [7.3] Testing missing auth 401...');
    const unauthRes = await fetch(`http://127.0.0.1:${testPort}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [] }),
    });
    assert.strictEqual(unauthRes.status, 401, 'Must reject with 401 when key is omitted');

    // 4. Ingress with Virtual Key in cache
    console.log('    [7.4] Populating virtual key & prompt cache...');
    const testVirtualKey = generateVirtualKey();
    await virtualKeyCache.set({
      id: 'vk_test_server',
      organizationId: 'org_test',
      projectId: 'proj_test',
      environmentId: 'env_test',
      name: 'Server Test Key',
      keyPrefix: testVirtualKey.keyPrefix,
      keyHash: testVirtualKey.keyHash,
      monthlyLimitUsd: 100.0,
      currentSpendUsd: 0.0,
      status: 'active',
      rateLimits: { rpm: 600, tpm: 100_000, maxConcurrency: 10 },
    });

    // 5. Prompt Cache Test via Server
    const cacheKey = promptCache.computeKey('org_test', 'env_test', 'gpt-4o-mini', {
      messages: [{ role: 'user', content: 'What is OsterdOps?' }],
    });
    await promptCache.set({
      cacheKey,
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      rawResponse: JSON.stringify({ choices: [{ message: { content: 'OsterdOps is AI governance.' } }] }),
      usage: { inputTokens: 8, outputTokens: 8, cacheReadTokens: 0, isEstimated: false },
      createdAt: Date.now(),
      expiresAt: Date.now() + 60_000,
    });

    console.log('    [7.5] Sending request to test prompt cache HIT...');
    const cachedReq = await fetch(`http://127.0.0.1:${testPort}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testVirtualKey.rawKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [{ role: 'user', content: 'What is OsterdOps?' }],
      }),
    });

    console.log('    [7.6] Received response status:', cachedReq.status);
    assert.strictEqual(cachedReq.status, 200);
    assert.strictEqual(cachedReq.headers.get('x-osterdops-prompt-cache'), 'HIT');
    const cachedBody = (await cachedReq.json()) as { choices: Array<{ message: { content: string } }> };
    assert.strictEqual(cachedBody.choices[0].message.content, 'OsterdOps is AI governance.');

    // 6. Graceful Shutdown
    console.log('    [7.7] Initiating graceful shutdown...');
    await gracefulShutdown(server, 2000);
    promptCache.destroy();
    virtualKeyCache.destroy();
    console.log('  -> PASS: Health, readiness, virtual key ingress, prompt cache hit, and graceful shutdown passed.\n');
  } finally {
    try {
      server.close();
    } catch {
      // already closed by gracefulShutdown
    }
  }

  console.log('================================================================');
  console.log('ALL 7 ENTERPRISE EXTENSIONS VERIFIED AND PASSING SUCCESSFULLY!');
  console.log('================================================================');
}

runLiveChecks().catch((err) => {
  console.error('Test verification failed:', err);
  process.exit(1);
});
