import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { calculateCost } from '../src/proxy/pricing.js';
import { initializeDatabase } from '../src/db/connection.js';
import { TraceRepository } from '../src/db/repository.js';
import { createDaemonServer } from '../src/server/http-server.js';
import { DEFAULT_CONFIG } from '../src/config.js';

async function runTests() {
  console.log('🧪 Starting Ingress Proxy & Core Hardening Test Suite...\n');

  // Test 1: Pricing Calculation
  console.log('1. Testing Token Pricing Engine...');
  // claude-3-7-sonnet: $3/1M input, $15/1M output
  // 1,000,000 in + 1,000,000 out = $18.00
  const costClaude = calculateCost('claude-3-7-sonnet', 1_000_000, 1_000_000);
  assert.equal(costClaude, 18.0, `Expected 18.0, got ${costClaude}`);

  // gpt-4o: $2.5/1M in, $10/1M out
  const costGpt4o = calculateCost('gpt-4o', 100_000, 50_000);
  // (100000/1000000)*2.5 + (50000/1000000)*10 = 0.25 + 0.5 = 0.75
  assert.equal(costGpt4o, 0.75, `Expected 0.75, got ${costGpt4o}`);
  console.log('   ✅ Pricing Engine calculations exact.\n');

  // Set up mock upstream AI provider server
  console.log('2. Setting up Mock Upstream Provider...');
  let upstreamRequests: any[] = [];
  const mockUpstream = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      upstreamRequests.push({ url: req.url, method: req.method, headers: req.headers, body: raw ? JSON.parse(raw) : {} });

      if (req.url === '/v1/chat/completions') {
        const body = raw ? JSON.parse(raw) : {};
        if (body.stream) {
          res.writeHead(200, { 'Content-Type': 'text/event-stream' });
          res.write('data: {"id":"chatcmpl-1","choices":[{"delta":{"content":"Hello "}}]}\n\n');
          res.write('data: {"id":"chatcmpl-1","choices":[{"delta":{"content":"world!"}}],"usage":{"prompt_tokens":12,"completion_tokens":5}}\n\n');
          res.write('data: [DONE]\n\n');
          res.end();
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              id: 'chatcmpl-1',
              model: 'gpt-4o',
              choices: [{ message: { role: 'assistant', content: 'Hello human!' } }],
              usage: { prompt_tokens: 15, completion_tokens: 8 },
            })
          );
        }
      } else if (req.url === '/v1/messages') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            id: 'msg_1',
            model: 'claude-3-7-sonnet-20250219',
            content: [{ type: 'text', text: 'Anthropic response' }],
            usage: { input_tokens: 20, output_tokens: 10 },
          })
        );
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
  });

  await new Promise<void>((resolve) => mockUpstream.listen(0, '127.0.0.1', () => resolve()));
  const upstreamAddr = mockUpstream.address() as any;
  const mockUpstreamUrl = `http://127.0.0.1:${upstreamAddr.port}`;
  console.log(`   ✅ Mock Upstream listening on ${mockUpstreamUrl}\n`);

  // Set up daemon with temp database
  const testDbPath = path.resolve(process.cwd(), 'packages/guard-daemon/test/test-proxy.sqlite');
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  if (fs.existsSync(`${testDbPath}-wal`)) fs.unlinkSync(`${testDbPath}-wal`);
  if (fs.existsSync(`${testDbPath}-shm`)) fs.unlinkSync(`${testDbPath}-shm`);

  const db = initializeDatabase(testDbPath);
  const repository = new TraceRepository(db);

  const testConfig = {
    ...DEFAULT_CONFIG,
    uiPort: 0,
    proxyPort: 0,
    sessionBudgetUsd: 10.0,
    upstreamGatewayUrl: mockUpstreamUrl,
  };

  const daemon = createDaemonServer({
    config: testConfig,
    repository,
    token: 'test_secret_token_123',
  });

  const { port: uiPort } = await daemon.listen(0, '127.0.0.1', 0);
  console.log(`3. Daemon listening on UI Port ${uiPort}`);

  // Test 3: OpenAI Non-Streaming Chat Completion
  console.log('\n3. Testing OpenAI Non-Streaming Proxy Route...');
  const resOpenAI = await fetch(`http://127.0.0.1:${uiPort}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-test-client-key',
      'X-Session-ID': 'session-test-a',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Say hello' }],
    }),
  });

  assert.equal(resOpenAI.status, 200, `Expected 200, got ${resOpenAI.status}`);
  const jsonOpenAI = (await resOpenAI.json()) as any;
  assert.equal(jsonOpenAI.model, 'gpt-4o');
  assert.equal(jsonOpenAI.usage.prompt_tokens, 15);
  console.log('   ✅ OpenAI Non-Streaming response received.');

  // Verify trace was persisted to SQLite
  const traces = repository.getRecent(10);
  assert.equal(traces.length, 1);
  assert.equal(traces[0].provider, 'openai');
  assert.equal(traces[0].requestedModel, 'gpt-4o');
  assert.equal(traces[0].inputTokens, 15);
  assert.equal(traces[0].outputTokens, 8);
  assert.ok(traces[0].costUsd > 0);
  console.log(`   ✅ Trace committed to SQLite WAL: cost=$${traces[0].costUsd}, duration=${traces[0].durationMs}ms`);

  // Test 4: OpenAI Streaming Chat Completion
  console.log('\n4. Testing OpenAI Streaming Proxy Route...');
  const resStream = await fetch(`http://127.0.0.1:${uiPort}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': 'session-test-a',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Say hello stream' }],
      stream: true,
    }),
  });

  assert.equal(resStream.status, 200);
  assert.ok(resStream.headers.get('content-type')?.includes('text/event-stream'));
  const streamText = await resStream.text();
  assert.ok(streamText.includes('Hello '));
  assert.ok(streamText.includes('world!'));
  console.log('   ✅ SSE Stream received and parsed.');

  const tracesAfterStream = repository.getRecent(10);
  assert.equal(tracesAfterStream.length, 2);
  const streamTrace = tracesAfterStream[0];
  assert.equal(streamTrace.stream, true);
  assert.equal(streamTrace.inputTokens, 12);
  assert.equal(streamTrace.outputTokens, 5);
  assert.ok(streamTrace.ttftMs !== null);
  console.log(`   ✅ Streaming trace committed: TTFT=${streamTrace.ttftMs}ms, tokens=${streamTrace.inputTokens}/${streamTrace.outputTokens}`);

  // Test 5: Anthropic Messages Proxy Route
  console.log('\n5. Testing Anthropic Messages Proxy Route...');
  const resAnthropic = await fetch(`http://127.0.0.1:${uiPort}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'sk-ant-test',
      'X-Session-ID': 'session-test-a',
    },
    body: JSON.stringify({
      model: 'claude-3-7-sonnet',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Hi Claude' }],
    }),
  });

  assert.equal(resAnthropic.status, 200);
  const jsonAnthropic = (await resAnthropic.json()) as any;
  assert.equal(jsonAnthropic.usage.input_tokens, 20);
  assert.equal(jsonAnthropic.usage.output_tokens, 10);
  console.log('   ✅ Anthropic proxy route succeeded.');

  const tracesAnthropic = repository.getRecent(10);
  assert.equal(tracesAnthropic.length, 3);
  assert.equal(tracesAnthropic[0].provider, 'anthropic');
  console.log(`   ✅ Anthropic trace committed: model=${tracesAnthropic[0].routedModel}`);

  // Test 6: Circuit Breaker Budget Cap
  console.log('\n6. Testing Circuit Breaker Budget Limit...');
  // Force budget cap to microscopic amount
  testConfig.sessionBudgetUsd = 0.000001;
  const resBlocked = await fetch(`http://127.0.0.1:${uiPort}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': 'session-test-a',
    },
    body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: 'test' }] }),
  });

  assert.equal(resBlocked.status, 429, `Expected 429, got ${resBlocked.status}`);
  const blockedJson = (await resBlocked.json()) as any;
  assert.equal(blockedJson.error.type, 'budget_exceeded');
  console.log(`   ✅ Circuit breaker tripped cleanly with HTTP 429: "${blockedJson.error.message}"`);

  // Test 7: Cloud Account Pairing API
  console.log('\n7. Testing POST /api/account/pair...');
  const resPair = await fetch(`http://127.0.0.1:${uiPort}/api/account/pair`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test_secret_token_123',
    },
    body: JSON.stringify({
      virtualKey: 'ost_live_99887766554433221100aabbccddeeff',
      keyName: 'Production E2E Key',
      orgName: 'Acme Test Corp',
      projectName: 'Sentinel E2E',
    }),
  });

  assert.equal(resPair.status, 200, `Expected 200, got ${resPair.status}`);
  const pairJson = (await resPair.json()) as any;
  assert.equal(pairJson.ok, true);
  assert.equal(pairJson.account.pairing.linked, true);
  assert.equal(pairJson.account.pairing.orgName, 'Acme Test Corp');
  assert.equal(pairJson.account.activeKey.name, 'Production E2E Key');
  console.log('   ✅ Cloud pairing API verified successfully.');

  // Cleanup
  console.log('\n8. Cleaning up resources...');
  await daemon.close();
  await new Promise<void>((resolve) => mockUpstream.close(() => resolve()));
  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  if (fs.existsSync(`${testDbPath}-wal`)) fs.unlinkSync(`${testDbPath}-wal`);
  if (fs.existsSync(`${testDbPath}-shm`)) fs.unlinkSync(`${testDbPath}-shm`);

  console.log('\n🎉 ALL INGRESS PROXY & CORE HARDENING TESTS PASSED 100%!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
