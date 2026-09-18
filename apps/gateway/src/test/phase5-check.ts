import assert from 'node:assert';
import { StreamTokenAccumulator } from '../accounting/extractor';
import { calculateModelCost } from '../accounting/cost';
import { TelemetryBatchQueue } from '../accounting/queue';
import { AtomicSpendSync } from '../accounting/spend-sync';
import { GovernanceEngine } from '../accounting/governance';
import { hashApiKey, InMemoryVirtualKeyCache, type CachedVirtualKey } from '../middleware/cache';
import type { TelemetryLogRecord, WebhookAlertPayload } from '../accounting/types';

async function runPhase5Check() {
  console.log('[Phase 5 Check] Starting Post-Stream Accounting & Automated Governance Validation...\n');

  // --------------------------------------------------------------------------
  // Scenario 1: OpenAI Terminal Usage Extraction
  // --------------------------------------------------------------------------
  {
    console.log('-> Scenario 1: OpenAI Terminal Usage Extraction...');
    const accumulator = new StreamTokenAccumulator('Tell me a short joke');

    // Simulate streaming chunks
    accumulator.ingestChunk('data: {"choices":[{"delta":{"content":"Why did "}}]}\n\n');
    accumulator.ingestChunk('data: {"choices":[{"delta":{"content":"the chicken cross?"}}]}\n\n');
    // Terminal chunk with usage
    accumulator.ingestChunk(
      'data: {"choices":[],"usage":{"prompt_tokens":14,"completion_tokens":28,"prompt_tokens_details":{"cached_tokens":4}}}\n\n'
    );
    accumulator.ingestChunk('data: [DONE]\n\n');

    const usage = accumulator.finalize();
    assert.strictEqual(usage.inputTokens, 14, 'Must extract prompt_tokens = 14');
    assert.strictEqual(usage.outputTokens, 28, 'Must extract completion_tokens = 28');
    assert.strictEqual(usage.cacheReadTokens, 4, 'Must extract cached_tokens = 4');
    assert.strictEqual(usage.isEstimated, false, 'Must be exact, not estimated');
    console.log('   ✔ OpenAI terminal chunk usage extracted successfully.');
  }

  // --------------------------------------------------------------------------
  // Scenario 2: Anthropic Asymmetric Multi-Event Usage Extraction
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 2: Anthropic Multi-Event Usage (message_start + message_delta)...');
    const accumulator = new StreamTokenAccumulator();

    // Event 1: message_start emits input tokens
    accumulator.ingestChunk(
      'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":42,"cache_read_input_tokens":12}}}\n\n'
    );
    // Content chunks
    accumulator.ingestChunk('event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"text":"Hello"}}\n\n');
    // Event 2: message_delta emits output tokens
    accumulator.ingestChunk(
      'event: message_delta\ndata: {"type":"message_delta","usage":{"output_tokens":85}}\n\n'
    );

    const usage = accumulator.finalize();
    assert.strictEqual(usage.inputTokens, 42, 'Must capture input_tokens from message_start');
    assert.strictEqual(usage.outputTokens, 85, 'Must capture output_tokens from message_delta');
    assert.strictEqual(usage.cacheReadTokens, 12, 'Must capture cache_read_input_tokens');
    assert.strictEqual(usage.isEstimated, false, 'Must not fall back to estimation');
    console.log('   ✔ Anthropic asymmetric usage successfully aggregated across stream lifecycle.');
  }

  // --------------------------------------------------------------------------
  // Scenario 3: Aborted Stream Fallback Heuristics
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 3: Aborted Stream Fallback Tokenizer Heuristics...');
    const promptText = 'Explain quantum computing in comprehensive technical detail with math';
    const accumulator = new StreamTokenAccumulator(promptText);

    // Stream delivers partial chunks then aborts without usage metadata
    accumulator.ingestChunk('data: {"choices":[{"delta":{"content":"Quantum computers utilize qubits "}}]}\n\n');
    accumulator.ingestChunk('data: {"choices":[{"delta":{"content":"operating via superposition and entanglement."}}]}\n\n');

    // Stream disconnects prematurely!
    const usage = accumulator.finalize();
    assert.ok(usage.inputTokens > 0, 'Must compute estimated input tokens');
    assert.ok(usage.outputTokens > 0, 'Must compute estimated output tokens from accumulated characters');
    assert.strictEqual(usage.isEstimated, true, 'Flagged as estimated usage');
    console.log(`   ✔ Aborted stream gracefully estimated: in=${usage.inputTokens}, out=${usage.outputTokens} tokens.`);
  }

  // --------------------------------------------------------------------------
  // Scenario 4: Sub-Cent Cost Engine Calculation
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 4: Dynamic Sub-Cent Cost Engine (Claude 3.7 Sonnet)...');
    // claude-3-7-sonnet rates: input: $3.00/1M, output: $15.00/1M
    const usage = {
      inputTokens: 10_000,
      outputTokens: 2_000,
      cacheReadTokens: 4_000,
      isEstimated: false,
    };

    const cost = calculateModelCost('claude-3-7-sonnet', usage);
    // Expected calculation:
    // Input: (10,000 / 1M) * 3.00 = $0.030000
    // Output: (2,000 / 1M) * 15.00 = $0.030000
    // Cache: (4,000 / 1M) * (3.00 * 0.5) = $0.006000
    // Total: $0.066000
    assert.strictEqual(cost.inputCostUsd, 0.03);
    assert.strictEqual(cost.outputCostUsd, 0.03);
    assert.strictEqual(cost.cacheReadCostUsd, 0.006);
    assert.strictEqual(cost.totalCostUsd, 0.066);
    console.log(`   ✔ Total cost computed with sub-cent accuracy: $${cost.totalCostUsd.toFixed(6)}.`);
  }

  // --------------------------------------------------------------------------
  // Scenario 5: Micro-Batched Ingestion Queue & Size Trigger
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 5: Micro-Batched Ingestion Queue & Batch Flushing...');
    const flushedBatches: TelemetryLogRecord[][] = [];

    const queue = new TelemetryBatchQueue({
      maxBatchSize: 5, // Triggers flush on 5 items
      flushIntervalMs: 5000,
      writer: async (records) => {
        flushedBatches.push(records);
      },
    });

    const createMockLog = (i: number): TelemetryLogRecord => ({
      requestId: `ost_req_test_${i}`,
      organizationId: 'org_test',
      projectId: 'proj_test',
      environmentId: 'env_test',
      virtualKeyId: 'vk_test',
      provider: 'openai',
      requestedModel: 'gpt-4o',
      routedModel: 'gpt-4o',
      fallbackUsed: false,
      fallbackFromModel: null,
      inputTokens: 100,
      outputTokens: 50,
      costUsd: 0.00075,
      latencyMs: 320,
      statusCode: 200,
      errorType: null,
      errorCode: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    // Enqueue 4 records (no flush yet)
    for (let i = 0; i < 4; i++) queue.enqueue(createMockLog(i));
    assert.strictEqual(flushedBatches.length, 0, 'Should buffer before hitting threshold');
    assert.strictEqual(queue.size(), 4);

    // Enqueue 5th record -> hits maxBatchSize -> triggers flush!
    queue.enqueue(createMockLog(4));
    // Yield to let async flush complete
    await new Promise((r) => setTimeout(r, 10));

    assert.strictEqual(flushedBatches.length, 1, 'Must flush bulk batch');
    assert.strictEqual(flushedBatches[0].length, 5);
    assert.strictEqual(queue.size(), 0, 'Buffer must be empty after flush');
    console.log('   ✔ Micro-batched queue buffered and executed single bulk flush.');
  }

  // --------------------------------------------------------------------------
  // Scenario 6: Graceful Process Drain Hook
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 6: Graceful Process Drain Hook (SIGTERM / shutdown)...');
    let drainedRecords: TelemetryLogRecord[] = [];

    const queue = new TelemetryBatchQueue({
      maxBatchSize: 100,
      flushIntervalMs: 10000,
      writer: async (records) => {
        drainedRecords = [...drainedRecords, ...records];
      },
    });

    // Enqueue 3 lingering records
    queue.enqueue({
      requestId: 'ost_req_drain_1',
      organizationId: 'org_test',
      projectId: 'proj_test',
      environmentId: 'env_test',
      virtualKeyId: 'vk_test',
      provider: 'anthropic',
      requestedModel: 'claude-3-5-sonnet',
      routedModel: 'claude-3-5-sonnet',
      fallbackUsed: false,
      fallbackFromModel: null,
      inputTokens: 200,
      outputTokens: 100,
      costUsd: 0.0021,
      latencyMs: 450,
      statusCode: 200,
      errorType: null,
      errorCode: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    assert.strictEqual(queue.size(), 1);

    // Trigger graceful drain
    await queue.drain();
    assert.strictEqual(queue.size(), 0, 'Buffer must be completely drained');
    assert.strictEqual(drainedRecords.length, 1, 'Lingering records successfully persisted on drain');
    console.log('   ✔ Drain hook safely flushed in-flight records before shutdown.');
  }

  // --------------------------------------------------------------------------
  // Scenario 7: Atomic Spend Sync & Auto-Freeze Trigger
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 7: Atomic Spend Sync & Key Invalidation on Freeze...');
    const rawKey = 'ost_live_sync_test_key_001';
    const keyHash = hashApiKey(rawKey);

    const cache = new InMemoryVirtualKeyCache(60);
    const initialKey: CachedVirtualKey = {
      id: 'vk_sync_test',
      organizationId: 'org_test',
      projectId: 'proj_test',
      environmentId: 'env_test',
      name: 'Sync Key',
      keyPrefix: 'ost_live_sync',
      keyHash,
      monthlyLimitUsd: 10.0,
      currentSpendUsd: 9.5,
      status: 'active',
      rateLimits: { rpm: 60, tpm: 100000, maxConcurrency: 10 },
      cachedAt: Date.now(),
      expiresAt: Date.now() + 60000,
    };
    cache.set(initialKey);

    const spendSync = new AtomicSpendSync(async (_keyId, delta) => {
      const newSpend = 9.5 + delta;
      const isFrozen = newSpend >= 10.0;
      return {
        success: true,
        currentSpendUsd: newSpend,
        monthlyLimitUsd: 10.0,
        isFrozen,
      };
    });

    // Commit $0.80 delta -> crosses $10.00 limit ($10.30) -> auto freezes!
    const syncRes = await spendSync.commitSpend('vk_sync_test', keyHash, 0.8);
    assert.strictEqual(syncRes.isFrozen, true, 'Key must be marked frozen');
    assert.strictEqual(syncRes.currentSpendUsd, 10.3);
    console.log('   ✔ Atomic delta committed and budget ceiling freeze reported.');
  }

  // --------------------------------------------------------------------------
  // Scenario 8: Milestone Alert De-Duplication & Webhook Engine
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Scenario 8: Milestone Alert De-Duplication (80% & 100% Webhooks)...');
    const dispatchedWebhooks: WebhookAlertPayload[] = [];

    const governance = new GovernanceEngine(async (payload) => {
      dispatchedWebhooks.push(payload);
    });

    const options = {
      organizationId: 'org_test',
      virtualKeyId: 'vk_governance_test',
      keyHash: 'hash_test',
      keyPrefix: 'ost_live_gov',
      currentSpendUsd: 70.0,
      monthlyLimitUsd: 100.0,
    };

    // Step 1: 70% utilization -> No alerts
    let res = await governance.checkMilestones(options);
    assert.strictEqual(res.alerted80, false);
    assert.strictEqual(res.alerted100, false);
    assert.strictEqual(dispatchedWebhooks.length, 0);

    // Step 2: Cross 80% boundary ($82.00) -> 80% warning fires!
    res = await governance.checkMilestones({ ...options, currentSpendUsd: 82.0 });
    assert.strictEqual(res.alerted80, true);
    assert.strictEqual(dispatchedWebhooks.length, 1);
    assert.strictEqual(dispatchedWebhooks[0].event, 'key_milestone_80');

    // Step 3: Subsequent request at $85.00 -> DE-DUPLICATION: MUST NOT FIRE AGAIN!
    res = await governance.checkMilestones({ ...options, currentSpendUsd: 85.0 });
    assert.strictEqual(res.alerted80, false, 'Must de-duplicate 80% warning');
    assert.strictEqual(dispatchedWebhooks.length, 1, 'Webhook count must remain 1');

    // Step 4: Cross 100% boundary ($101.00) -> Critical freeze alert fires!
    res = await governance.checkMilestones({ ...options, currentSpendUsd: 101.0 });
    assert.strictEqual(res.alerted100, true);
    assert.strictEqual(dispatchedWebhooks.length, 2);
    assert.strictEqual(dispatchedWebhooks[1].event, 'key_budget_frozen_100');

    // Step 5: Subsequent request at $105.00 -> MUST NOT FIRE AGAIN!
    res = await governance.checkMilestones({ ...options, currentSpendUsd: 105.0 });
    assert.strictEqual(res.alerted100, false);
    assert.strictEqual(dispatchedWebhooks.length, 2, 'Webhook count must remain 2');
    console.log('   ✔ 80% warning and 100% freeze webhooks dispatched strictly ONCE per threshold crossing.');
  }

  console.log('\n=============================================================');
  console.log('✔ ALL PHASE 5 ACCEPTANCE TESTS PASSED CLEANLY (0 ERRORS)');
  console.log('=============================================================\n');
}

runPhase5Check().catch((err) => {
  console.error('Phase 5 Verification Failed:', err);
  process.exit(1);
});
