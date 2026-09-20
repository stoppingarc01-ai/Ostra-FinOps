import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateDaemonToken, verifyDaemonToken, validateHost, validateOrigin, } from '../src/security.js';
import { initializeDatabase } from '../src/db/connection.js';
import { TraceRepository } from '../src/db/repository.js';
import { createDaemonServer } from '../src/server/http-server.js';
import { loadConfig } from '../src/config.js';
function requestHttp(url, options = {}) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const req = http.request({
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            port: parsed.port,
            path: parsed.pathname + parsed.search,
            method: options.method || 'GET',
            headers: options.headers,
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk.toString();
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode || 0,
                    headers: res.headers,
                    body,
                });
            });
        });
        req.on('error', reject);
        req.end();
    });
}
async function runStage2Checks() {
    console.log('--- Starting Stage 2 Verification Checks ---');
    // Test 1: Security primitives
    console.log('Test 1: Security primitives & token validation...');
    const token = generateDaemonToken();
    assert.strictEqual(typeof token, 'string');
    assert.strictEqual(token.length, 32); // 16 bytes hex
    assert.strictEqual(verifyDaemonToken(token, token), true);
    assert.strictEqual(verifyDaemonToken('invalid-token', token), false);
    assert.strictEqual(verifyDaemonToken('', token), false);
    assert.strictEqual(verifyDaemonToken(null, token), false);
    assert.strictEqual(validateHost('127.0.0.1:4040', 4040), true);
    assert.strictEqual(validateHost('localhost:4040', 4040), true);
    assert.strictEqual(validateHost('127.0.0.1'), true);
    assert.strictEqual(validateHost('evil.com:4040', 4040), false);
    assert.strictEqual(validateHost('attacker.org'), false);
    assert.strictEqual(validateOrigin(undefined), true);
    assert.strictEqual(validateOrigin('http://127.0.0.1:4040', 4040), true);
    assert.strictEqual(validateOrigin('http://localhost:4040', 4040), true);
    assert.strictEqual(validateOrigin('https://evil-hacker.com'), false);
    console.log('✔ Test 1 passed: Security primitives verified.');
    // Setup test environment
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ostraops-daemon-stage2-'));
    const testDbPath = path.join(tmpDir, 'daemon-test.db');
    const db = initializeDatabase(testDbPath);
    const repository = new TraceRepository(db);
    const config = loadConfig();
    const daemonInstance = createDaemonServer({
        config,
        repository,
        token,
    });
    // Listen on OS-assigned ephemeral port (port 0)
    const { port, url } = await daemonInstance.listen(0, '127.0.0.1');
    console.log(`Daemon server listening on ephemeral port: ${port}`);
    assert.strictEqual(url.includes(`?token=${token}`), true);
    try {
        // Test 2: Unauthenticated Healthcheck
        console.log('Test 2: Unauthenticated /healthz endpoint...');
        const healthRes = await requestHttp(`http://127.0.0.1:${port}/healthz`);
        assert.strictEqual(healthRes.statusCode, 200);
        const healthJson = JSON.parse(healthRes.body);
        assert.strictEqual(healthJson.status, 'ok');
        console.log('✔ Test 2 passed: /healthz accessible without auth.');
        // Test 3: Unauthorized Access Rejection (401 and 403)
        console.log('Test 3: Security rejection (401 Unauthorized / 403 Forbidden)...');
        // Missing token
        const noAuthRes = await requestHttp(`http://127.0.0.1:${port}/api/session`);
        assert.strictEqual(noAuthRes.statusCode, 401);
        // Invalid token
        const badTokenRes = await requestHttp(`http://127.0.0.1:${port}/api/session?token=wrong`);
        assert.strictEqual(badTokenRes.statusCode, 401);
        // Untrusted Origin header
        const badOriginRes = await requestHttp(`http://127.0.0.1:${port}/api/session?token=${token}`, {
            headers: { Origin: 'https://malicious-web.com' },
        });
        assert.strictEqual(badOriginRes.statusCode, 403);
        // Untrusted Host header (DNS rebinding simulation)
        const badHostRes = await requestHttp(`http://127.0.0.1:${port}/api/session?token=${token}`, {
            headers: { Host: 'evil-rebinding.com' },
        });
        assert.strictEqual(badHostRes.statusCode, 403);
        console.log('✔ Test 3 passed: Unauthorized and hostile requests rejected.');
        // Test 4: Authenticated API /api/session & /api/traces
        console.log('Test 4: Authenticated REST APIs...');
        const authSessionRes = await requestHttp(`http://127.0.0.1:${port}/api/session`, {
            headers: { 'X-OstraOps-Daemon-Token': token },
        });
        assert.strictEqual(authSessionRes.statusCode, 200);
        const sessionData = JSON.parse(authSessionRes.body);
        assert.strictEqual(sessionData.summary.totalRequests, 0);
        assert.strictEqual(typeof sessionData.budget.ceiling, 'number');
        assert.strictEqual(typeof sessionData.velocity.velocity5mTPM, 'number');
        // Insert sample trace via recordAndBroadcast
        const sampleTrace = {
            id: 'trace_test_001',
            requestId: 'req_001',
            sessionId: 'sess_1',
            provider: 'anthropic',
            requestedModel: 'claude-3-5-sonnet',
            routedModel: 'claude-3-5-sonnet',
            statusCode: 200,
            inputTokens: 100,
            outputTokens: 50,
            costUsd: 0.0015,
            durationMs: 450,
            ttftMs: 120,
            stream: true,
            timestamp: Date.now(),
            createdAt: new Date().toISOString(),
        };
        daemonInstance.recordAndBroadcast(sampleTrace);
        // Verify /api/traces
        const tracesRes = await requestHttp(`http://127.0.0.1:${port}/api/traces?token=${token}&limit=10`);
        assert.strictEqual(tracesRes.statusCode, 200);
        const tracesData = JSON.parse(tracesRes.body);
        assert.strictEqual(tracesData.count, 1);
        assert.strictEqual(tracesData.traces[0].id, 'trace_test_001');
        // Verify /api/traces/:id
        const singleTraceRes = await requestHttp(`http://127.0.0.1:${port}/api/traces/trace_test_001?token=${token}`);
        assert.strictEqual(singleTraceRes.statusCode, 200);
        const singleData = JSON.parse(singleTraceRes.body);
        assert.strictEqual(singleData.trace.requestedModel, 'claude-3-5-sonnet');
        console.log('✔ Test 4 passed: Authenticated REST endpoints operate accurately.');
        // Test 5: SSE Streaming and Last-Event-ID Replay
        console.log('Test 5: SSE connection, live broadcast, and Last-Event-ID replay...');
        await new Promise((resolve, reject) => {
            const sseReq = http.request(`http://127.0.0.1:${port}/api/stream?token=${token}`, {
                headers: { Accept: 'text/event-stream' },
            }, (sseRes) => {
                assert.strictEqual(sseRes.statusCode, 200);
                assert.strictEqual(sseRes.headers['content-type'], 'text/event-stream');
                let receivedChunks = '';
                sseRes.on('data', (chunk) => {
                    receivedChunks += chunk.toString();
                    if (receivedChunks.includes('trace_test_002')) {
                        sseRes.destroy(); // Close client connection
                        resolve();
                    }
                });
                // Broadcast a second trace while client is connected
                setTimeout(() => {
                    daemonInstance.recordAndBroadcast({
                        id: 'trace_test_002',
                        requestId: 'req_002',
                        sessionId: 'sess_1',
                        provider: 'openai',
                        requestedModel: 'gpt-4o',
                        routedModel: 'gpt-4o',
                        statusCode: 200,
                        inputTokens: 200,
                        outputTokens: 100,
                        costUsd: 0.003,
                        durationMs: 600,
                        ttftMs: 150,
                        stream: true,
                        timestamp: Date.now(),
                        createdAt: new Date().toISOString(),
                    });
                }, 50);
            });
            sseReq.on('error', reject);
            sseReq.end();
        });
        // Now test Replay using Last-Event-ID:
        await new Promise((resolve, reject) => {
            const replayReq = http.request(`http://127.0.0.1:${port}/api/stream?token=${token}`, {
                headers: {
                    Accept: 'text/event-stream',
                    'Last-Event-ID': '1',
                },
            }, (replayRes) => {
                let chunks = '';
                replayRes.on('data', (chunk) => {
                    chunks += chunk.toString();
                    if (chunks.includes('trace_test_002')) {
                        replayRes.destroy();
                        resolve();
                    }
                });
            });
            replayReq.on('error', reject);
            replayReq.end();
        });
        console.log('✔ Test 5 passed: SSE streaming and Last-Event-ID replay verified.');
    }
    finally {
        // Teardown
        await daemonInstance.close();
        db.close();
        fs.rmSync(tmpDir, { recursive: true, force: true });
        console.log('Cleaned up server, database, and temp files.');
    }
    console.log('\n========================================');
    console.log('STAGE 2 VERIFICATION: ALL CHECKS PASSED!');
    console.log('========================================');
}
runStage2Checks().catch((err) => {
    console.error('Stage 2 verification failed:', err);
    process.exit(1);
});
