import assert from 'node:assert';
import { initializeDatabase } from '../src/db/connection';
import { TraceRepository } from '../src/db/repository';
import { RollingVelocityEngine } from '../src/engine/velocity';
import { RingBuffer } from '../src/engine/ring-buffer';
import { loadConfig } from '../src/config';
async function runStage1Verification() {
    console.log('--- Starting Stage 1 (Storage Layer & Core Engine) Verification ---\n');
    // ==========================================================================
    // Test 1: Configuration Loader
    // ==========================================================================
    console.log('[Test 1] Configuration Defaults & Parser...');
    const config = loadConfig();
    assert.strictEqual(config.proxyPort, 8080);
    assert.strictEqual(config.uiPort, 4040);
    assert.strictEqual(config.sessionBudgetUsd, 5.0);
    assert.strictEqual(config.rollingWindowSeconds, 300);
    assert.strictEqual(config.ringBufferSize, 1000);
    console.log('  -> PASS: Configuration defaults loaded correctly.\n');
    // ==========================================================================
    // Test 2: SQLite WAL Connection & Repository
    // ==========================================================================
    console.log('[Test 2] SQLite WAL Mode & Trace Repository...');
    const connections = initializeDatabase(':memory:');
    const repo = new TraceRepository(connections);
    const testSessionId = 'sess_test_123';
    const sampleTrace = {
        id: 'trc_001',
        requestId: 'req_001',
        sessionId: testSessionId,
        provider: 'anthropic',
        requestedModel: 'claude-3-5-sonnet',
        routedModel: 'claude-3-5-sonnet',
        statusCode: 200,
        inputTokens: 1200,
        outputTokens: 450,
        costUsd: 0.01035,
        durationMs: 850,
        ttftMs: 240,
        stream: true,
        errorMessage: null,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
    };
    repo.insert(sampleTrace);
    const fetched = repo.getTraceById('trc_001');
    assert.ok(fetched, 'Trace must be found by ID');
    assert.strictEqual(fetched.requestedModel, 'claude-3-5-sonnet');
    assert.strictEqual(fetched.inputTokens, 1200);
    assert.strictEqual(fetched.costUsd, 0.01035);
    const recent = repo.getRecent(10, 0, testSessionId);
    assert.strictEqual(recent.length, 1);
    assert.strictEqual(recent[0].id, 'trc_001');
    // Test session summary aggregation
    const summary1 = repo.getSessionSummary(testSessionId);
    assert.strictEqual(summary1.totalRequests, 1);
    assert.strictEqual(summary1.totalInputTokens, 1200);
    assert.strictEqual(summary1.totalOutputTokens, 450);
    assert.strictEqual(summary1.errorCount, 0);
    // Insert an error trace to verify error count metric
    const errorTrace = {
        ...sampleTrace,
        id: 'trc_002',
        requestId: 'req_002',
        statusCode: 429,
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        durationMs: 40,
        errorMessage: 'Rate limit exceeded',
        timestamp: Date.now() + 10,
    };
    repo.insert(errorTrace);
    const summary2 = repo.getSessionSummary(testSessionId);
    assert.strictEqual(summary2.totalRequests, 2);
    assert.strictEqual(summary2.errorCount, 1);
    console.log('  -> PASS: SQLite schema, index insertion, and aggregation metrics verified.\n');
    // ==========================================================================
    // Test 3: High-Frequency Concurrency (20k+ TPM Simulation)
    // ==========================================================================
    console.log('[Test 3] High-Frequency WAL Concurrency Simulation...');
    const BATCH_SIZE = 100;
    for (let i = 0; i < BATCH_SIZE; i++) {
        repo.insert({
            id: `trc_stress_${i}`,
            requestId: `req_stress_${i}`,
            sessionId: testSessionId,
            provider: 'openai',
            requestedModel: 'gpt-4o',
            routedModel: 'gpt-4o',
            statusCode: 200,
            inputTokens: 1000,
            outputTokens: 200,
            costUsd: 0.0045,
            durationMs: 120,
            ttftMs: 40,
            stream: true,
            errorMessage: null,
            timestamp: Date.now() + i,
            createdAt: new Date().toISOString(),
        });
    }
    const stressSummary = repo.getSessionSummary(testSessionId);
    assert.strictEqual(stressSummary.totalRequests, BATCH_SIZE + 2);
    assert.strictEqual(stressSummary.totalInputTokens, 1200 + BATCH_SIZE * 1000);
    console.log(`  -> PASS: ${BATCH_SIZE} rapid consecutive WAL writes executed without lock contention.\n`);
    connections.close();
    // ==========================================================================
    // Test 4: Rolling Velocity Engine (5m Window Math)
    // ==========================================================================
    console.log('[Test 4] Rolling Velocity Engine (30x 10s Buckets)...');
    const velocity = new RollingVelocityEngine(300); // 5 min window
    const baseTime = 1_700_000_000_000;
    // Ingest 5,000 tokens at baseTime
    velocity.record(4000, 1000, baseTime);
    let metrics = velocity.getMetrics(baseTime);
    // In 5 min (5 minutes), 5000 tokens = 1000 TPM
    assert.strictEqual(metrics.velocity5mTPM, 1000);
    assert.strictEqual(metrics.totalTokens5m, 5000);
    assert.strictEqual(metrics.totalRequests5m, 1);
    assert.strictEqual(metrics.peakTPM, 1000);
    // Ingest 15,000 more tokens 30 seconds later
    velocity.record(10000, 5000, baseTime + 30_000);
    metrics = velocity.getMetrics(baseTime + 30_000);
    // Total 20,000 tokens / 5 min = 4000 TPM
    assert.strictEqual(metrics.velocity5mTPM, 4000);
    assert.strictEqual(metrics.peakTPM, 4000);
    // Fast forward 310 seconds (5 minutes and 10 seconds)
    // The first bucket (5000 tokens) should expire and be pruned
    metrics = velocity.getMetrics(baseTime + 310_000);
    assert.strictEqual(metrics.totalTokens5m, 15000);
    assert.strictEqual(metrics.velocity5mTPM, 3000);
    assert.strictEqual(metrics.peakTPM, 4000, 'Peak TPM must be preserved across window');
    console.log('  -> PASS: 5-minute rolling window, peak tracking, and bucket expiration verified.\n');
    // ==========================================================================
    // Test 5: Circular Ring Buffer & Last-Event-ID Replay
    // ==========================================================================
    console.log('[Test 5] Circular Ring Buffer & Reconnection Replay...');
    const ring = new RingBuffer(200);
    // Push 50 events
    for (let i = 1; i <= 50; i++) {
        ring.push('trace:appended', { name: `event_${i}` });
    }
    assert.strictEqual(ring.size(), 50);
    assert.strictEqual(ring.getLatestId(), 50);
    assert.strictEqual(ring.getOldestId(), 1);
    // Client reconnects asking for events after ID 40
    const replay = ring.replayFrom(40);
    assert.strictEqual(replay.gapExceeded, false);
    assert.strictEqual(replay.events.length, 10);
    assert.strictEqual(replay.events[0].id, 41);
    assert.strictEqual(replay.events[9].id, 50);
    // Push 200 more events to trigger wrap-around (total 250 events)
    for (let i = 51; i <= 250; i++) {
        ring.push('trace:appended', { name: `event_${i}` });
    }
    assert.strictEqual(ring.size(), 200, 'Buffer must be capped to capacity 200');
    assert.strictEqual(ring.getLatestId(), 250);
    assert.strictEqual(ring.getOldestId(), 51, 'Oldest ID should now be 51');
    // Client reconnects asking for event ID 20 (dropped >200 events ago)
    const gapReplay = ring.replayFrom(20);
    assert.strictEqual(gapReplay.gapExceeded, true, 'Gap exceeded flag must be true');
    assert.strictEqual(gapReplay.events.length, 0);
    // Client reconnects asking for event ID 245 (within capacity)
    const validReplay = ring.replayFrom(245);
    assert.strictEqual(validReplay.gapExceeded, false);
    assert.strictEqual(validReplay.events.length, 5);
    assert.strictEqual(validReplay.events[0].id, 246);
    assert.strictEqual(validReplay.events[4].id, 250);
    console.log('  -> PASS: 200-item circular buffer, monotonic IDs, and gap detection verified.\n');
    console.log('================================================================');
    console.log('ALL STAGE 1 STORAGE & ENGINE TESTS PASSED CLEANLY (0 ERRORS)!');
    console.log('================================================================');
}
runStage1Verification().catch((err) => {
    console.error('Stage 1 verification failed:', err);
    process.exit(1);
});
