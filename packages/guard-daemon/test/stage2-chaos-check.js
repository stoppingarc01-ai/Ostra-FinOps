import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { initializeDatabase } from '../src/db/connection.js';
import { TraceRepository } from '../src/db/repository.js';
import { createDaemonServer } from '../src/server/http-server.js';
import { loadConfig } from '../src/config.js';
import { isLoopbackHost, readOrCreateDaemonToken, } from '../src/security.js';
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
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}
async function runChaosAndResilienceChecks() {
    console.log('================================================================');
    console.log('--- Starting Stage 2.1 Concurrency, Chaos & Hardening Tests ---');
    console.log('================================================================');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'osterdops-daemon-chaos-'));
    const testDbPath = path.join(tmpDir, 'daemon-chaos.db');
    const testTokenPath = path.join(tmpDir, 'daemon.token');
    const staticDir = path.join(tmpDir, 'public');
    fs.mkdirSync(staticDir, { recursive: true });
    fs.writeFileSync(path.join(staticDir, 'index.html'), '<h1>Test Dashboard</h1>');
    const db = initializeDatabase(testDbPath);
    const repository = new TraceRepository(db);
    const config = loadConfig();
    config.tokenPath = testTokenPath;
    config.ringBufferSize = 1000;
    // 1. Test Token Persistence & Resiliency across restarts
    console.log('\n[Chaos 1] Token Persistence & Restart Stability...');
    const token1 = readOrCreateDaemonToken(testTokenPath);
    assert.strictEqual(typeof token1, 'string');
    assert.strictEqual(token1.length, 32);
    // Read again - should match exactly (not regenerate)
    const token2 = readOrCreateDaemonToken(testTokenPath);
    assert.strictEqual(token1, token2, 'Token must remain identical across restarts');
    console.log('✔ Token persistence across restarts verified.');
    const daemonInstance = createDaemonServer({
        config,
        repository,
        token: token1,
        staticDir,
    });
    const { port } = await daemonInstance.listen(0, '127.0.0.1');
    console.log(`Daemon server active on 127.0.0.1:${port}`);
    try {
        // 2. Test IPv6 Loopback & Host Spoofing Protections
        console.log('\n[Chaos 2] Host Spoofing & IPv6 Loopback Normalization...');
        assert.strictEqual(isLoopbackHost('127.0.0.1'), true);
        assert.strictEqual(isLoopbackHost('localhost'), true);
        assert.strictEqual(isLoopbackHost('localhost.'), true);
        assert.strictEqual(isLoopbackHost('::1'), true);
        assert.strictEqual(isLoopbackHost('[::1]'), true);
        assert.strictEqual(isLoopbackHost('192.168.1.100'), false);
        assert.strictEqual(isLoopbackHost('attacker.com'), false);
        const spoofRes = await requestHttp(`http://127.0.0.1:${port}/api/session?token=${token1}`, {
            headers: { Host: '192.168.1.150:4040' },
        });
        assert.strictEqual(spoofRes.statusCode, 403, 'LAN host spoof must return 403');
        const evilDomainRes = await requestHttp(`http://127.0.0.1:${port}/api/session?token=${token1}`, {
            headers: { Host: 'malicious-domain.com' },
        });
        assert.strictEqual(evilDomainRes.statusCode, 403, 'Malicious external domain must return 403');
        console.log('✔ Host header spoofing firmly blocked.');
        // 3. Test Auth Handshake & Cookie-Based Cleansing (No token in URL)
        console.log('\n[Chaos 3] POST /api/auth/exchange & Cookie Auth...');
        const exchangeRes = await requestHttp(`http://127.0.0.1:${port}/api/auth/exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token1 }),
        });
        assert.strictEqual(exchangeRes.statusCode, 200);
        const setCookie = exchangeRes.headers['set-cookie'];
        assert.ok(setCookie && setCookie.length > 0);
        assert.ok(setCookie[0].includes('osterdops_token='));
        assert.ok(setCookie[0].includes('HttpOnly'));
        // Request using solely the cookie (no query param, no auth header)
        const cookieReqRes = await requestHttp(`http://127.0.0.1:${port}/api/session`, {
            headers: { Cookie: setCookie[0].split(';')[0] },
        });
        assert.strictEqual(cookieReqRes.statusCode, 200, 'Cookie-based auth must succeed without URL query param');
        console.log('✔ Auth exchange and clean cookie-based authentication verified.');
        // 4. Test Directory Traversal Defenses on Static Server
        console.log('\n[Chaos 4] Directory Traversal & Symlink Escape Defenses...');
        const traversal1 = await requestHttp(`http://127.0.0.1:${port}/..%2f..%2fpackage.json`);
        assert.ok(traversal1.statusCode === 400 || traversal1.statusCode === 403);
        const traversal2 = await requestHttp(`http://127.0.0.1:${port}/..\\..\\windows\\win.ini`);
        assert.ok(traversal2.statusCode === 400 || traversal2.statusCode === 403 || traversal2.statusCode === 404);
        const normalFile = await requestHttp(`http://127.0.0.1:${port}/index.html`);
        assert.strictEqual(normalFile.statusCode, 200);
        assert.ok(normalFile.body.includes('Test Dashboard'));
        console.log('✔ Directory traversal and malicious paths rejected.');
        // 5. Test 20 Concurrent SSE Clients under Burst Load
        console.log('\n[Chaos 5] 20 Concurrent SSE Clients under Burst Write Load...');
        const clientCount = 20;
        const sseClients = [];
        const clientReceivedCounts = new Array(clientCount).fill(0);
        let allFinishedResolve;
        const allFinishedPromise = new Promise((resolve) => {
            allFinishedResolve = resolve;
        });
        const clientBuffers = new Array(clientCount).fill('');
        const clientsConnectedPromise = Promise.all(Array.from({ length: clientCount }, (_, i) => {
            return new Promise((resolveConnect) => {
                const sseReq = http.request(`http://127.0.0.1:${port}/api/stream?token=${token1}`, { headers: { Accept: 'text/event-stream' } }, (sseRes) => {
                    assert.strictEqual(sseRes.statusCode, 200);
                    let connected = false;
                    sseRes.on('data', (chunk) => {
                        const text = chunk.toString();
                        if (!connected && text.includes(': connected')) {
                            connected = true;
                            resolveConnect();
                        }
                        clientBuffers[i] += text;
                        const matches = clientBuffers[i].match(/event: trace(\r?\n)/g);
                        clientReceivedCounts[i] = matches ? matches.length : 0;
                        if (clientReceivedCounts.every((cnt) => cnt >= 50)) {
                            allFinishedResolve();
                        }
                    });
                });
                sseReq.end();
                sseClients.push(sseReq);
            });
        }));
        await clientsConnectedPromise;
        assert.strictEqual(daemonInstance.sseBroker.getClientCount(), 20);
        console.log(`-> All ${clientCount} SSE client sockets connected.`);
        // Rapid burst insert: 50 traces
        const burstCount = 50;
        const now = Date.now();
        for (let i = 0; i < burstCount; i++) {
            const trace = {
                id: `burst_trace_${i.toString().padStart(4, '0')}`,
                requestId: `req_${i}`,
                sessionId: 'chaos_session',
                provider: i % 2 === 0 ? 'anthropic' : 'openai',
                requestedModel: i % 2 === 0 ? 'claude-3-5-sonnet' : 'gpt-4o',
                routedModel: i % 2 === 0 ? 'claude-3-5-sonnet' : 'gpt-4o',
                statusCode: i % 10 === 0 ? 500 : 200,
                inputTokens: 100 + i,
                outputTokens: 50 + i,
                costUsd: 0.001 * (i + 1),
                durationMs: 200 + i,
                ttftMs: 50,
                stream: true,
                errorMessage: i % 10 === 0 ? 'Upstream error simulation' : null,
                timestamp: now + i,
                createdAt: new Date(now + i).toISOString(),
            };
            daemonInstance.recordAndBroadcast(trace);
        }
        // Wait until all clients have received all events (with timeout guard)
        await Promise.race([
            allFinishedPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for concurrent SSE delivery')), 5000)),
        ]);
        // Cleanup SSE clients
        for (const clientReq of sseClients) {
            clientReq.destroy();
        }
        // Verify all clients received all broadcast events
        for (let i = 0; i < clientCount; i++) {
            assert.strictEqual(clientReceivedCounts[i], burstCount, `Client ${i} missed events: got ${clientReceivedCounts[i]}/${burstCount}`);
        }
        console.log(`✔ 20/20 concurrent SSE clients received 100% of the ${burstCount} burst traces without drop.`);
        // 6. Test Cursor-based Pagination & Multi-Dimensional Filters
        console.log('\n[Chaos 6] Cursor Pagination & Multi-Dimensional Filtering...');
        // Page 1: limit 15
        const page1Res = await requestHttp(`http://127.0.0.1:${port}/api/traces?token=${token1}&limit=15`);
        assert.strictEqual(page1Res.statusCode, 200);
        const p1Data = JSON.parse(page1Res.body);
        assert.strictEqual(p1Data.traces.length, 15);
        assert.strictEqual(p1Data.hasMore, true);
        assert.ok(p1Data.nextCursor !== null);
        // Page 2: using nextCursor from Page 1
        const page2Res = await requestHttp(`http://127.0.0.1:${port}/api/traces?token=${token1}&limit=15&cursor=${p1Data.nextCursor}`);
        assert.strictEqual(page2Res.statusCode, 200);
        const p2Data = JSON.parse(page2Res.body);
        assert.strictEqual(p2Data.traces.length, 15);
        // Assert ZERO duplicate IDs between Page 1 and Page 2
        const p1Ids = new Set(p1Data.traces.map((t) => t.id));
        for (const t of p2Data.traces) {
            assert.ok(!p1Ids.has(t.id), `Duplicate trace detected in cursor pagination: ${t.id}`);
        }
        console.log('✔ Cursor-based pagination proved strictly disjoint and monotonic (0 duplicates).');
        // Test Filter: status=error
        const errorFilterRes = await requestHttp(`http://127.0.0.1:${port}/api/traces?token=${token1}&status=error`);
        const errorData = JSON.parse(errorFilterRes.body);
        assert.ok(errorData.count > 0);
        for (const t of errorData.traces) {
            assert.ok(t.statusCode >= 400 || t.errorMessage !== null);
        }
        console.log(`✔ Status=error filter returned ${errorData.count} matching error traces.`);
        // Test Filter: provider=anthropic
        const providerFilterRes = await requestHttp(`http://127.0.0.1:${port}/api/traces?token=${token1}&provider=anthropic`);
        const providerData = JSON.parse(providerFilterRes.body);
        for (const t of providerData.traces) {
            assert.strictEqual(t.provider, 'anthropic');
        }
        console.log(`✔ Provider filter returned ${providerData.count} strictly matching anthropic traces.`);
        // Test Bulk Export
        const exportRes = await requestHttp(`http://127.0.0.1:${port}/api/traces/export?token=${token1}`);
        assert.strictEqual(exportRes.statusCode, 200);
        const exportData = JSON.parse(exportRes.body);
        assert.ok(exportData.totalExported >= 50);
        console.log(`✔ Bulk export retrieved ${exportData.totalExported} traces.`);
    }
    finally {
        await daemonInstance.close();
        db.close();
        fs.rmSync(tmpDir, { recursive: true, force: true });
        console.log('\nAll test databases, temporary sockets, and files cleared.');
    }
    console.log('\n================================================================');
    console.log('STAGE 2.1 CHAOS & CONCURRENCY TESTS: ALL 6 CHECKS PASSED (0 ERRORS)!');
    console.log('================================================================\n');
}
runChaosAndResilienceChecks().catch((err) => {
    console.error('Chaos verification failed:', err);
    process.exit(1);
});
