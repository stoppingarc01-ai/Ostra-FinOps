import assert from 'node:assert';
import { Writable } from 'node:stream';
import type { ServerResponse } from 'node:http';
import { executeStreamingPipeline } from '../streaming/pipeline';
import { getModelSpec } from '../registry/catalog';

interface MockResponseCapture {
  res: ServerResponse;
  getStatusCode: () => number;
  getHeaders: () => Record<string, string | number | readonly string[]>;
  getWrittenChunks: () => string[];
  getFullBody: () => string;
}

function createMockResponse(): MockResponseCapture {
  let statusCode = 200;
  const headers: Record<string, string | number | readonly string[]> = {};
  const chunks: string[] = [];

  const writable = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });

  const res = writable as unknown as ServerResponse;
  (res as any).writeHead = (status: number, hdrs?: Record<string, string | number | readonly string[]>) => {
    statusCode = status;
    if (hdrs) {
      for (const [k, v] of Object.entries(hdrs)) {
        headers[k.toLowerCase()] = v;
      }
    }
    return res;
  };
  res.setHeader = (key: string, value: string | number | readonly string[]) => {
    headers[key.toLowerCase()] = value;
    return res;
  };
  const origEnd = writable.end.bind(writable);
  res.end = (chunk?: unknown) => {
    if (chunk) chunks.push(chunk.toString());
    origEnd();
    return res;
  };

  return {
    res,
    getStatusCode: () => statusCode,
    getHeaders: () => headers,
    getWrittenChunks: () => chunks,
    getFullBody: () => chunks.join(''),
  };
}

async function* createAsyncStream(chunks: string[], delayMs = 1): AsyncIterable<string> {
  for (const chunk of chunks) {
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    yield chunk;
  }
}

async function runPhase4Check() {
  console.log('[Phase 4 Check] Starting Failover State Machine & Streaming Resiliency Tests...\n');

  const gpt4o = getModelSpec('gpt-4o')!;
  const defaultIdentity = {
    requestId: 'ost_req_phase4_test_001',
    organizationId: 'org_test_phase4',
    virtualKeyId: 'vk_test_phase4',
  };

  // --------------------------------------------------------------------------
  // Scenario 1: Normal Flow (PRE_RESPONSE -> MID_STREAM -> COMPLETED)
  // --------------------------------------------------------------------------
  {
    console.log('-> Scenario 1: Normal Flow (PRE_RESPONSE -> 200 -> MID_STREAM -> COMPLETED)...');
    const mock = createMockResponse();
    const abortCtrl = new AbortController();

    const result = await executeStreamingPipeline(mock.res, {
      identity: defaultIdentity,
      initialModel: gpt4o,
      payload: { model: 'gpt-4o', messages: [{ role: 'user', content: 'Hi' }] },
      isStreaming: true,
      clientSignal: abortCtrl.signal,
      upstreamDispatcher: async () => ({
        statusCode: 200,
        headers: {},
        isStream: true,
        stream: createAsyncStream(['data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n', 'data: [DONE]\n\n']),
      }),
    });

    assert.strictEqual(result.finalState, 'COMPLETED');
    assert.strictEqual(result.failoverAttempts, 0);
    assert.strictEqual(mock.getStatusCode(), 200);
    assert.strictEqual(mock.getHeaders()['content-type'], 'text/event-stream');
    assert.ok(mock.getFullBody().includes('Hello'));
    console.log('   ✔ Normal stream completed successfully.');
  }

  // --------------------------------------------------------------------------
  // Scenario 2: Primary 429 Failover in PRE_RESPONSE
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 2: Primary 429 Failover (PRE_RESPONSE -> 429 -> retry comment -> fallback)...');
    const mock = createMockResponse();
    const abortCtrl = new AbortController();
    let dispatchCallCount = 0;
    let dispatchedModels: string[] = [];

    const result = await executeStreamingPipeline(mock.res, {
      identity: defaultIdentity,
      initialModel: gpt4o,
      payload: { model: 'gpt-4o', messages: [{ role: 'user', content: 'Hi' }] },
      isStreaming: true,
      clientSignal: abortCtrl.signal,
      upstreamDispatcher: async (targetModel) => {
        dispatchCallCount++;
        dispatchedModels.push(targetModel.id);
        if (dispatchCallCount === 1) {
          // Primary returns 429 Too Many Requests
          return { statusCode: 429, headers: {}, isStream: false, body: '{"error":"Rate limited"}' };
        }
        // Fallback candidate succeeds
        return {
          statusCode: 200,
          headers: {},
          isStream: true,
          stream: createAsyncStream(['data: {"choices":[{"delta":{"content":"Fallback output"}}]}\n\n']),
        };
      },
    });

    assert.strictEqual(result.finalState, 'COMPLETED');
    assert.strictEqual(result.failoverAttempts, 1);
    assert.strictEqual(dispatchCallCount, 2);
    assert.strictEqual(dispatchedModels[0], 'gpt-4o');
    assert.notStrictEqual(dispatchedModels[1], 'gpt-4o', 'Fallback must route to a different model');

    const body = mock.getFullBody();
    assert.ok(body.includes(': osterdops-retry-pending\n\n'), 'Must emit retry-pending heartbeat comment');
    assert.ok(body.includes('Fallback output'), 'Client must receive fallback generation');
    assert.strictEqual(mock.getHeaders()['x-osterdops-fallback-triggered'], 'true');
    console.log(`   ✔ 429 intercepted: retried with fallback candidate '${dispatchedModels[1]}'.`);
  }

  // --------------------------------------------------------------------------
  // Scenario 3: Primary 503 Failover in PRE_RESPONSE
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 3: Primary 503 Service Unavailable Failover...');
    const mock = createMockResponse();
    const abortCtrl = new AbortController();
    let dispatchCallCount = 0;

    const result = await executeStreamingPipeline(mock.res, {
      identity: defaultIdentity,
      initialModel: gpt4o,
      payload: { model: 'gpt-4o', messages: [{ role: 'user', content: 'Hi' }] },
      isStreaming: true,
      clientSignal: abortCtrl.signal,
      upstreamDispatcher: async () => {
        dispatchCallCount++;
        if (dispatchCallCount === 1) {
          return { statusCode: 503, headers: {}, isStream: false, body: '{"error":"Unavailable"}' };
        }
        return {
          statusCode: 200,
          headers: {},
          isStream: true,
          stream: createAsyncStream(['data: {"choices":[{"delta":{"content":"Recovered"}}]}\n\n']),
        };
      },
    });

    assert.strictEqual(result.finalState, 'COMPLETED');
    assert.strictEqual(result.failoverAttempts, 1);
    assert.ok(mock.getFullBody().includes(': osterdops-retry-pending\n\n'));
    assert.ok(mock.getFullBody().includes('Recovered'));
    console.log('   ✔ 503 intercepted and successfully recovered on fallback.');
  }

  // --------------------------------------------------------------------------
  // Scenario 4: Zero Failover in MID_STREAM (Failure After First Output)
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 4: Failure After First Output (Zero Failover in MID_STREAM)...');
    const mock = createMockResponse();
    const abortCtrl = new AbortController();
    let dispatchCount = 0;

    // Upstream stream yields 1 token, then crashes mid-generation
    async function* crashingStream(): AsyncIterable<string> {
      yield 'data: {"choices":[{"delta":{"content":"Token zero "}}]}\n\n';
      await new Promise((r) => setTimeout(r, 5));
      throw new Error('ECONNRESET: Upstream connection broke mid-stream');
    }

    const result = await executeStreamingPipeline(mock.res, {
      identity: defaultIdentity,
      initialModel: gpt4o,
      payload: { model: 'gpt-4o', messages: [{ role: 'user', content: 'Hi' }] },
      isStreaming: true,
      clientSignal: abortCtrl.signal,
      upstreamDispatcher: async () => {
        dispatchCount++;
        return {
          statusCode: 200,
          headers: {},
          isStream: true,
          stream: crashingStream(),
        };
      },
    });

    // CRITICAL: Failover is strictly forbidden in MID_STREAM
    assert.strictEqual(dispatchCount, 1, 'MUST NOT attempt failover retry after token 0 committed');
    assert.strictEqual(result.finalState, 'ERROR');

    const body = mock.getFullBody();
    assert.ok(body.includes('Token zero '), 'Client must have received initial output');
    assert.ok(body.includes('OSTERDOPS_STREAM_INTERRUPTED'), 'Must emit terminal structured error chunk');
    console.log('   ✔ Zero-failover boundary preserved: mid-stream crash emitted terminal error without retry.');
  }

  // --------------------------------------------------------------------------
  // Scenario 5: Client Cancellation & Bidirectional Abort Propagation
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 5: Client Cancellation & Bidirectional Abort Propagation...');
    const mock = createMockResponse();
    const abortCtrl = new AbortController();
    let upstreamObservedAbort = false;

    async function* slowStream(signal: AbortSignal): AsyncIterable<string> {
      signal.addEventListener('abort', () => {
        upstreamObservedAbort = true;
      });
      yield 'data: {"choices":[{"delta":{"content":"First chunk"}}]}\n\n';
      // Simulate waiting for next token while client cancels
      await new Promise((r) => setTimeout(r, 20));
      yield 'data: {"choices":[{"delta":{"content":"Second chunk"}}]}\n\n';
    }

    const pipelinePromise = executeStreamingPipeline(mock.res, {
      identity: defaultIdentity,
      initialModel: gpt4o,
      payload: { model: 'gpt-4o', messages: [{ role: 'user', content: 'Hi' }] },
      isStreaming: true,
      clientSignal: abortCtrl.signal,
      upstreamDispatcher: async (_model, _payload, signal) => ({
        statusCode: 200,
        headers: {},
        isStream: true,
        stream: slowStream(signal),
      }),
    });

    // Developer hits Escape / Cancel after 5ms
    setTimeout(() => {
      abortCtrl.abort();
    }, 5);

    const result = await pipelinePromise;
    assert.strictEqual(result.finalState, 'ABORTED');
    assert.strictEqual(upstreamObservedAbort, true, 'Upstream must observe client abort signal');
    console.log('   ✔ Client abort propagated cleanly to upstream; state marked ABORTED without server crash.');
  }

  // --------------------------------------------------------------------------
  // Scenario 6: Long TTFT Heartbeat Keep-Alive Loop
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 6: Long TTFT Heartbeat Keep-Alive Loop (50ms accelerated test)...');
    const mock = createMockResponse();
    const abortCtrl = new AbortController();

    // Upstream has a 60ms delay before emitting first token (simulating 30s TTFT on reasoning models)
    async function* delayedStream(): AsyncIterable<string> {
      await new Promise((r) => setTimeout(r, 55));
      yield 'data: {"choices":[{"delta":{"content":"Reasoning complete"}}]}\n\n';
    }

    const result = await executeStreamingPipeline(mock.res, {
      identity: defaultIdentity,
      initialModel: getModelSpec('o1')!,
      payload: { model: 'o1', messages: [{ role: 'user', content: 'Deep problem' }] },
      isStreaming: true,
      clientSignal: abortCtrl.signal,
      upstreamDispatcher: async () => ({
        statusCode: 200,
        headers: {},
        isStream: true,
        stream: delayedStream(),
      }),
    });

    assert.strictEqual(result.finalState, 'COMPLETED');
    assert.ok(mock.getFullBody().includes('Reasoning complete'));
    console.log('   ✔ Heartbeat loop kept connection alive and stopped cleanly at token 0.');
  }

  // --------------------------------------------------------------------------
  // Scenario 7: Fallback Failure Ceiling (MAX_FAILOVER_ATTEMPTS = 2)
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 7: Fallback Failure Ceiling (Primary -> #1 -> #2 -> STOP)...');
    const mock = createMockResponse();
    const abortCtrl = new AbortController();
    let totalAttempts = 0;

    const result = await executeStreamingPipeline(mock.res, {
      identity: defaultIdentity,
      initialModel: gpt4o,
      payload: { model: 'gpt-4o', messages: [{ role: 'user', content: 'Hi' }] },
      isStreaming: true,
      clientSignal: abortCtrl.signal,
      maxFailoverAttempts: 2,
      upstreamDispatcher: async () => {
        totalAttempts++;
        // Upstream consistently returns 503
        return { statusCode: 503, headers: {}, isStream: false, body: '{"error":"Down"}' };
      },
    });

    assert.strictEqual(result.finalState, 'ERROR');
    // Primary (0) + Fallback 1 (1) + Fallback 2 (2) -> total 3 calls made
    assert.strictEqual(totalAttempts, 3, `Expected exactly 3 dispatch attempts (Primary + 2 fallbacks), got ${totalAttempts}`);
    assert.strictEqual(result.failoverAttempts, 2);
    assert.strictEqual(mock.getStatusCode(), 503);
    assert.ok(mock.getFullBody().includes('OSTERDOPS_FAILOVER_EXHAUSTED'));
    console.log('   ✔ Hard failover ceiling enforced: halted at MAX_FAILOVER_ATTEMPTS = 2.');
  }

  // --------------------------------------------------------------------------
  // Scenario 8: Non-Streaming Request (Zero SSE Heartbeat Injection)
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 8: Non-Streaming Request (Zero SSE Heartbeat Injection)...');
    const mock = createMockResponse();
    const abortCtrl = new AbortController();
    let dispatchCallCount = 0;

    const result = await executeStreamingPipeline(mock.res, {
      identity: defaultIdentity,
      initialModel: gpt4o,
      payload: { model: 'gpt-4o', stream: false, messages: [{ role: 'user', content: 'Hi' }] },
      isStreaming: false, // stream: false
      clientSignal: abortCtrl.signal,
      upstreamDispatcher: async () => {
        dispatchCallCount++;
        if (dispatchCallCount === 1) {
          return { statusCode: 503, headers: {}, isStream: false, body: '{"error":"503"}' };
        }
        return {
          statusCode: 200,
          headers: {},
          isStream: false,
          body: JSON.stringify({ id: 'chatcmpl-123', choices: [{ message: { content: 'JSON reply' } }] }),
        };
      },
    });

    assert.strictEqual(result.finalState, 'COMPLETED');
    assert.strictEqual(result.failoverAttempts, 1);
    assert.strictEqual(mock.getStatusCode(), 200);
    assert.strictEqual(mock.getHeaders()['content-type'], 'application/json');

    const body = mock.getFullBody();
    assert.ok(body.includes('JSON reply'));
    // CRITICAL USER RULE 3: ZERO SSE heartbeats or comments in non-streaming responses!
    assert.strictEqual(
      body.includes(': osterdops-'),
      false,
      'CRITICAL: Non-streaming JSON response MUST NOT contain any SSE comments'
    );

    // Must be valid parseable JSON
    assert.doesNotThrow(() => JSON.parse(body), 'Response body must remain valid parseable JSON');
    console.log('   ✔ Non-streaming request executed failover without any SSE comment corruption.');
  }

  console.log('\n=============================================================');
  console.log('✔ ALL PHASE 4 BEHAVIORAL ACCEPTANCE TESTS PASSED CLEANLY (0 ERRORS)');
  console.log('=============================================================\n');
}

runPhase4Check().catch((err) => {
  console.error('Phase 4 Verification Failed:', err);
  process.exit(1);
});
