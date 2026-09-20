import assert from 'node:assert';
import { initializeDatabase } from '../src/db/connection.js';
import { TraceRepository } from '../src/db/repository.js';
import { TaskRepository } from '../src/db/tasks-repository.js';
import { createDaemonServer } from '../src/server/http-server.js';
import { loadConfig } from '../src/config.js';

async function runAccountTests() {
  console.log('--- Testing Account & Machine Identity API Endpoints ---');

  const db = initializeDatabase(':memory:');
  const traceRepo = new TraceRepository(db);
  const taskRepo = new TaskRepository(db);
  const config = loadConfig();

  const daemon = createDaemonServer({
    config,
    repository: traceRepo,
    tasksRepository: taskRepo,
    token: 'account_test_token',
  });

  const { port } = await daemon.listen(0, '127.0.0.1');
  const baseUrl = `http://127.0.0.1:${port}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-OstraOps-Daemon-Token': 'account_test_token',
  };

  // 1. GET /api/account
  const resGet = await fetch(`${baseUrl}/api/account`, { headers });
  assert.strictEqual(resGet.status, 200);
  const jsonGet = await resGet.json() as any;
  assert.ok(jsonGet.account);
  assert.ok(jsonGet.account.runtime.hostname);
  assert.strictEqual(jsonGet.account.runtime.daemonVersion, 'v2.1.0');
  assert.ok(jsonGet.account.activeKey.maskedKey);
  console.log('✔ GET /api/account returned runtime identity and pairing status.');

  // 2. PATCH /api/account/preferences
  const resPatch = await fetch(`${baseUrl}/api/account/preferences`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ allowPromptCaching: true, offlineSpooling: false }),
  });
  assert.strictEqual(resPatch.status, 200);
  const jsonPatch = await resPatch.json() as any;
  assert.strictEqual(jsonPatch.preferences.allowPromptCaching, true);
  assert.strictEqual(jsonPatch.preferences.offlineSpooling, false);
  console.log('✔ PATCH /api/account/preferences updated telemetry preferences.');

  // 3. POST /api/account/key
  const resKey = await fetch(`${baseUrl}/api/account/key`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ keyId: 'key_live_stg' }),
  });
  assert.strictEqual(resKey.status, 200);
  const jsonKey = await resKey.json() as any;
  assert.strictEqual(jsonKey.activeKey.id, 'key_live_stg');
  console.log('✔ POST /api/account/key switched active virtual key.');

  // 4. POST /api/account/unlink
  const resUnlink = await fetch(`${baseUrl}/api/account/unlink`, {
    method: 'POST',
    headers,
  });
  assert.strictEqual(resUnlink.status, 200);
  const jsonUnlink = await resUnlink.json() as any;
  assert.strictEqual(jsonUnlink.account.pairing.linked, false);
  console.log('✔ POST /api/account/unlink cleared cloud linkage.');

  await daemon.close();
  db.close();

  console.log('\n=============================================');
  console.log('ALL ACCOUNT & MACHINE API CHECKS PASSED! 🚀');
  console.log('=============================================\n');
}

runAccountTests().catch((err) => {
  console.error('Account test failed:', err);
  process.exit(1);
});
