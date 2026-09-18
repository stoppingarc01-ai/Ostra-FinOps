import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { initializeDatabase } from '../src/db/connection.js';
import { TraceRepository } from '../src/db/repository.js';
import { createDaemonServer } from '../src/server/http-server.js';
import { loadConfig } from '../src/config.js';
import { readOrCreateDaemonToken } from '../src/security.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
  path.resolve(currentDir, '../dist/ui'),
  path.resolve(currentDir, '../../dist/ui'),
  path.resolve(currentDir, '../ui/dist'),
];
const uiDistDir = candidates.find((p) => fs.existsSync(path.join(p, 'index.html')) && fs.existsSync(path.join(p, 'assets'))) || candidates[0];

function requestHttp(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
  } = {}
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: options.headers,
      },
      (res) => {
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
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runStage3Verification() {
  console.log('================================================================');
  console.log('--- Starting Stage 3 React UI & Static Integration Tests ---');
  console.log('================================================================\n');

  // 1. Verify build artifacts
  console.log('[Test 1] Verifying built UI artifacts in ui/dist...');
  assert.ok(fs.existsSync(uiDistDir), 'ui/dist directory must exist');
  const indexPath = path.join(uiDistDir, 'index.html');
  assert.ok(fs.existsSync(indexPath), 'ui/dist/index.html must exist');
  const assetsDir = path.join(uiDistDir, 'assets');
  assert.ok(fs.existsSync(assetsDir), 'ui/dist/assets directory must exist');

  const assetFiles = fs.readdirSync(assetsDir);
  const jsFile = assetFiles.find((f) => f.endsWith('.js'));
  const cssFile = assetFiles.find((f) => f.endsWith('.css'));
  assert.ok(jsFile, 'Compiled JS bundle must exist');
  assert.ok(cssFile, 'Compiled CSS bundle must exist');
  console.log(`✔ Found UI artifacts: ${jsFile} & ${cssFile}`);

  // 2. Setup server with UI static directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'osterdops-stage3-'));
  const testDbPath = path.join(tmpDir, 'daemon.db');
  const testTokenPath = path.join(tmpDir, 'daemon.token');

  const db = initializeDatabase(testDbPath);
  const repository = new TraceRepository(db);
  const config = loadConfig();
  config.tokenPath = testTokenPath;

  const token = readOrCreateDaemonToken(testTokenPath);

  const daemonInstance = createDaemonServer({
    config,
    repository,
    token,
    staticDir: uiDistDir,
  });

  const { port } = await daemonInstance.listen(0, '127.0.0.1');
  console.log(`Daemon server active on 127.0.0.1:${port}`);

  try {
    // 3. Request Root / (SPA Entrypoint)
    console.log('\n[Test 2] Serving UI root index.html...');
    const rootRes = await requestHttp(`http://127.0.0.1:${port}/`);
    assert.strictEqual(rootRes.statusCode, 200);
    assert.ok(rootRes.headers['content-type']?.includes('text/html'));
    assert.ok(rootRes.body.includes('<div id="root"></div>'));
    console.log('✔ Root index.html successfully served.');

    // 4. Request Static Assets (.js and .css)
    console.log('\n[Test 3] Serving static JS asset with correct MIME type...');
    const jsRes = await requestHttp(`http://127.0.0.1:${port}/assets/${jsFile}`);
    assert.strictEqual(jsRes.statusCode, 200);
    assert.ok(jsRes.headers['content-type']?.includes('application/javascript'));
    assert.ok(jsRes.body.length > 50000, 'JS bundle should contain React runtime');
    console.log('✔ Static JS asset served cleanly with application/javascript.');

    // 5. Request SPA Subroute Fallback
    console.log('\n[Test 4] Testing SPA subroute fallback (/traces/filter)...');
    const subrouteRes = await requestHttp(`http://127.0.0.1:${port}/traces/filter`);
    assert.strictEqual(subrouteRes.statusCode, 200);
    assert.ok(subrouteRes.headers['content-type']?.includes('text/html'));
    assert.ok(subrouteRes.body.includes('<div id="root"></div>'));
    console.log('✔ SPA subroute cleanly falls back to index.html.');

    // 6. Test Daemon Operational Metrics API (/api/metrics)
    console.log('\n[Test 5] Querying /api/metrics...');
    const metricsRes = await requestHttp(`http://127.0.0.1:${port}/api/metrics?token=${token}`);
    assert.strictEqual(metricsRes.statusCode, 200);
    const metrics = JSON.parse(metricsRes.body);
    assert.strictEqual(typeof metrics.uptimeSeconds, 'number');
    assert.strictEqual(typeof metrics.memory.heapUsedMb, 'number');
    assert.strictEqual(typeof metrics.sse.ringBufferCapacity, 'number');
    console.log(`✔ Daemon telemetry metrics: uptime=${metrics.uptimeSeconds}s, heap=${metrics.memory.heapUsedMb}MB, ringCapacity=${metrics.sse.ringBufferCapacity}`);

  } finally {
    await daemonInstance.close();
    db.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log('\nAll test server sockets and databases closed.');
  }

  console.log('\n================================================================');
  console.log('STAGE 3 REACT UI & STATIC INTEGRATION: ALL CHECKS PASSED!');
  console.log('================================================================\n');
}

runStage3Verification().catch((err) => {
  console.error('Stage 3 verification failed:', err);
  process.exit(1);
});
