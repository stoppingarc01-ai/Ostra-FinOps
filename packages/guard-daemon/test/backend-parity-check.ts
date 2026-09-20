import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { calculateCost, getModelPricing } from '../src/proxy/pricing.js';
import { estimateMessageTokens, estimateTextTokens, extractStreamingChunk } from '../src/proxy/tokenizer.js';
import { getIntraFamilyFallback, isFailoverEligible } from '../src/proxy/failover.js';
import { RollingVelocityEngine } from '../src/engine/velocity.js';
import { initializeDatabase } from '../src/db/connection.js';
import { TraceRepository } from '../src/db/repository.js';
import { createDaemonServer } from '../src/server/http-server.js';
import { DEFAULT_CONFIG } from '../src/config.js';

async function runBackendParityVerification() {
  console.log('🚀 Starting Backend Hardening & Parity Test Suite...\n');

  // =========================================================================
  // Test 1: Complete Pricing Table & Tiered Fallback
  // =========================================================================
  console.log('1. Testing Comprehensive Pricing Table & Tiered Fallback...');

  // Google Gemini models
  const costGemini25Pro = calculateCost('gemini-2.5-pro', 1_000_000, 1_000_000);
  assert.equal(costGemini25Pro, 6.25, `Expected 6.25 for Gemini 2.5 Pro, got ${costGemini25Pro}`);

  const costGeminiFlash = calculateCost('gemini-2.0-flash', 1_000_000, 1_000_000);
  assert.equal(costGeminiFlash, 0.50, `Expected 0.50 for Gemini 2.0 Flash, got ${costGeminiFlash}`);

  // xAI Grok
  const costGrok = calculateCost('grok-2', 1_000_000, 1_000_000);
  assert.equal(costGrok, 12.0, `Expected 12.0 for Grok 2, got ${costGrok}`);

  // Mistral & Llama
  const costMistral = calculateCost('mistral-large-latest', 1_000_000, 1_000_000);
  assert.equal(costMistral, 8.0, `Expected 8.0 for Mistral Large, got ${costMistral}`);

  const costLlama = calculateCost('llama-3.3-70b', 1_000_000, 1_000_000);
  assert.equal(costLlama, 1.50, `Expected 1.50 for Llama 3.3 70B, got ${costLlama}`);

  // DeepSeek R1
  const costR1 = calculateCost('deepseek-r1', 1_000_000, 1_000_000);
  assert.equal(costR1, 2.74, `Expected 2.74 for DeepSeek R1, got ${costR1}`);

  // Intelligent Tiered Fallback (no more flat $2/$8!)
  const priceUnknownMini = getModelPricing('my-custom-fine-tuned-mini');
  assert.equal(priceUnknownMini.inputPerMillion, 0.15, 'Small/mini model must resolve to low-cost tier');

  const priceUnknownReasoner = getModelPricing('future-deep-reasoner-v3');
  assert.equal(priceUnknownReasoner.inputPerMillion, 5.0, 'Reasoner model must resolve to high-cost tier');

  console.log('   ✅ Comprehensive pricing table and tiered fallback verified.\n');

  // =========================================================================
  // Test 2: Token Counting with Messages, Tools, and Streaming Deltas
  // =========================================================================
  console.log('2. Testing Structure-Aware Token Estimation & Tool Calling...');

  const sampleMessages = [
    { role: 'system', content: 'You are an autonomous AI coding assistant.' },
    { role: 'user', content: 'Refactor the database connection to use WAL mode.' },
    {
      role: 'assistant',
      content: null,
      tool_calls: [
        {
          id: 'call_1',
          type: 'function',
          function: { name: 'replace_file_content', arguments: '{"path":"db.ts","content":"PRAGMA journal_mode=WAL;"}' },
        },
      ],
    },
  ];

  const estimatedTokens = estimateMessageTokens(sampleMessages);
  assert.ok(estimatedTokens > 30, `Expected >30 tokens for rich tool call messages, got ${estimatedTokens}`);

  // Streaming chunk extraction: tool call partial arguments
  const streamChunk = {
    choices: [
      {
        delta: {
          tool_calls: [
            {
              index: 0,
              function: { arguments: '{"journal_mode":"WAL"}' },
            },
          ],
        },
      },
    ],
  };

  const extracted = extractStreamingChunk(streamChunk, 'openai');
  assert.ok(extracted.textDelta.includes('journal_mode'), 'Tool call partial arguments must be extracted from stream');
  const textTokens = estimateTextTokens('PRAGMA journal_mode=WAL;');
  assert.ok(textTokens > 3, `Expected >3 tokens for SQL string, got ${textTokens}`);
  console.log(`   ✅ Token estimation and tool call extraction verified (${estimatedTokens} msg tokens, ${textTokens} text tokens).`);

  // =========================================================================
  // Test 3: Rolling Spend Velocity & Hard Circuit Breaker
  // =========================================================================
  console.log('\n3. Testing Spend Rate ($/min) Rolling Velocity Hard Breaker...');

  const velocityEngine = new RollingVelocityEngine(300); // 5 min window
  const now = Date.now();

  // Record spend: $1.00 now, $1.50 next request
  velocityEngine.record(10_000, 5_000, 1.00, now);
  velocityEngine.record(15_000, 8_000, 1.50, now + 1000);

  const metrics = velocityEngine.getMetrics(now + 2000);
  assert.ok(metrics.velocity5mCostUsd >= 2.50, `Expected >= $2.50 total cost, got ${metrics.velocity5mCostUsd}`);
  assert.ok(metrics.velocityCostPerMinuteUsd > 0, `Expected positive $/min rate, got ${metrics.velocityCostPerMinuteUsd}`);

  // Test breaker check with $0.40/min threshold (which should trip!)
  const breakerResult = velocityEngine.checkVelocityBreaker({ maxCostPerMinUsd: 0.40 }, now + 2000);
  assert.equal(breakerResult.tripped, true, 'Velocity circuit breaker must trip when $/min threshold exceeded');
  assert.equal(breakerResult.metric, 'cost_velocity');
  console.log(`   ✅ Velocity breaker tripped as expected: ${breakerResult.reason}`);

  // Test breaker with high threshold (should NOT trip)
  const safeResult = velocityEngine.checkVelocityBreaker({ maxCostPerMinUsd: 100.0 }, now + 2000);
  assert.equal(safeResult.tripped, false, 'Velocity breaker must pass under safe thresholds');
  console.log('   ✅ Safe velocity thresholds pass cleanly.\n');

  // =========================================================================
  // Test 4: Deterministic Intra-Family Cascader (Sonnet -> Haiku, GPT-4o -> GPT-4o-mini)
  // =========================================================================
  console.log('4. Testing Intra-Family Cascader Logic...');

  assert.equal(getIntraFamilyFallback('claude-3-5-sonnet-20241022'), 'claude-3-5-haiku-20241022');
  assert.equal(getIntraFamilyFallback('claude-3-7-sonnet'), 'claude-3-5-sonnet');
  assert.equal(getIntraFamilyFallback('gpt-4o'), 'gpt-4o-mini');
  assert.equal(getIntraFamilyFallback('deepseek-reasoner'), 'deepseek-chat');
  assert.equal(getIntraFamilyFallback('gemini-2.5-pro'), 'gemini-2.5-flash');

  assert.equal(isFailoverEligible(500), true, 'HTTP 500 must trigger failover');
  assert.equal(isFailoverEligible(503), true, 'HTTP 503 must trigger failover');
  assert.equal(isFailoverEligible(429, 'Engine overloaded, try again later'), true, 'Overloaded 429 must trigger failover');
  assert.equal(isFailoverEligible(401, 'Invalid API key'), false, 'Client 401 must NOT trigger failover');
  console.log('   ✅ Intra-family cascade rules mapped correctly.\n');

  // =========================================================================
  // Test 5: End-to-End Ingress Proxy with Failover and Velocity Breaker
  // =========================================================================
  console.log('5. Testing End-to-End Ingress Proxy with Failover...');

  // Setup Mock Upstream that returns 503 for claude-3-5-sonnet, but 200 for claude-3-5-haiku
  let mockRequests: any[] = [];
  const mockServer = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const body = raw ? JSON.parse(raw) : {};
      mockRequests.push({ url: req.url, model: body.model });

      if (body.model?.includes('sonnet')) {
        // Simulate upstream temporary outage
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'Anthropic upstream capacity unavailable' } }));
      } else if (body.model?.includes('haiku')) {
        // Sibling succeeds!
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            id: 'msg_failover_success',
            model: body.model,
            content: [{ type: 'text', text: 'Cascaded response from Haiku!' }],
            usage: { input_tokens: 30, output_tokens: 15 },
          })
        );
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: 'msg_ok', model: body.model, choices: [{ message: { content: 'ok' } }] }));
      }
    });
  });

  await new Promise<void>((resolve) => mockServer.listen(0, '127.0.0.1', () => resolve()));
  const mockAddr = mockServer.address() as any;
  const mockUrl = `http://127.0.0.1:${mockAddr.port}`;

  const testDb = path.resolve(process.cwd(), 'packages/guard-daemon/test/parity-test.sqlite');
  if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
  if (fs.existsSync(`${testDb}-wal`)) fs.unlinkSync(`${testDb}-wal`);
  if (fs.existsSync(`${testDb}-shm`)) fs.unlinkSync(`${testDb}-shm`);

  const db = initializeDatabase(testDb);
  const repository = new TraceRepository(db);

  const testConfig = {
    ...DEFAULT_CONFIG,
    uiPort: 0,
    proxyPort: 0,
    sessionBudgetUsd: 100.0,
    maxVelocityUsdPerMin: 50.0,
    intraFamilyFailover: true,
    upstreamGatewayUrl: mockUrl,
  };

  const daemon = createDaemonServer({
    config: testConfig,
    repository,
    token: 'test_token',
  });

  const { port: proxyPort } = await daemon.listen(0, '127.0.0.1', 0);

  // Send request for Sonnet -> must automatically cascade to Haiku!
  const cascadeRes = await fetch(`http://127.0.0.1:${proxyPort}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'sk-ant-test',
      'X-Session-ID': 'cascade-session',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet',
      messages: [{ role: 'user', content: 'Generate code' }],
    }),
  });

  assert.equal(cascadeRes.status, 200, `Expected 200 via failover, got ${cascadeRes.status}`);
  assert.equal(cascadeRes.headers.get('x-ostra-failover'), 'true', 'Must set X-Ostra-Failover header');
  assert.equal(cascadeRes.headers.get('x-ostra-original-model'), 'claude-3-5-sonnet');
  assert.equal(cascadeRes.headers.get('x-ostra-routed-model'), 'claude-3-5-haiku');

  const cascadeBody = (await cascadeRes.json()) as any;
  assert.ok(cascadeBody.content[0].text.includes('Haiku'), 'Response content must come from Haiku sibling');
  console.log('   ✅ Live failover succeeded: Sonnet (503) -> Haiku (200).');

  // Verify trace was recorded with failover metadata
  const traces = repository.getRecent(5, 0, 'cascade-session');
  assert.equal(traces.length, 1);
  assert.equal(traces[0].requestedModel, 'claude-3-5-sonnet');
  assert.equal(traces[0].routedModel, 'claude-3-5-haiku');
  assert.equal(traces[0].statusCode, 200);
  console.log('   ✅ SQLite WAL trace recorded with requested vs routed model parity.');

  // Clean up
  await daemon.close();
  await new Promise<void>((resolve) => mockServer.close(() => resolve()));
  db.close();
  if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
  if (fs.existsSync(`${testDb}-wal`)) fs.unlinkSync(`${testDb}-wal`);
  if (fs.existsSync(`${testDb}-shm`)) fs.unlinkSync(`${testDb}-shm`);

  console.log('\n🎉 ALL 5 BACKEND GAPS VERIFIED AND RESOLVED 100%!\n');
}

runBackendParityVerification().catch((err) => {
  console.error('❌ Parity Test Failed:', err);
  process.exit(1);
});
