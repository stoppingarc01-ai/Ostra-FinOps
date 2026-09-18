#!/usr/bin/env node
import { exec } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../dist/src/config.js';
import { initializeDatabase } from '../dist/src/db/connection.js';
import { TraceRepository } from '../dist/src/db/repository.js';
import { createDaemonServer } from '../dist/src/server/http-server.js';
import { readOrCreateDaemonToken } from '../dist/src/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function openBrowser(url) {
  const startCmd =
    process.platform === 'darwin'
      ? `open "${url}"`
      : process.platform === 'win32'
      ? `start "" "${url}"`
      : `xdg-open "${url}"`;

  exec(startCmd, (err) => {
    if (err) {
      console.log(`[Guard] Open dashboard manually in browser: ${url}`);
    }
  });
}

function checkPortAvailable(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close();
      })
      .listen(port, host);
  });
}

async function findAvailablePort(startPort, host = '127.0.0.1') {
  for (let p = startPort; p < startPort + 20; p++) {
    const isAvail = await checkPortAvailable(p, host);
    if (isAvail) return p;
  }
  return startPort;
}

async function main() {
  const args = process.argv.slice(2);
  const noOpen = args.includes('--no-open') || args.includes('--no-browser');

  let customUiPort;
  const uiPortIdx = args.findIndex((a) => a === '--ui-port' || a === '--port' || a === '-p');
  if (uiPortIdx !== -1 && args[uiPortIdx + 1]) {
    customUiPort = parseInt(args[uiPortIdx + 1], 10);
  }

  let customProxyPort;
  const proxyPortIdx = args.findIndex((a) => a === '--proxy-port');
  if (proxyPortIdx !== -1 && args[proxyPortIdx + 1]) {
    customProxyPort = parseInt(args[proxyPortIdx + 1], 10);
  }

  let customBudget;
  const budgetIdx = args.findIndex((a) => a === '--budget');
  if (budgetIdx !== -1 && args[budgetIdx + 1]) {
    customBudget = parseFloat(args[budgetIdx + 1]);
  }

  let customDataDir;
  const dataDirIdx = args.findIndex((a) => a === '--data-dir');
  if (dataDirIdx !== -1 && args[dataDirIdx + 1]) {
    customDataDir = path.resolve(args[dataDirIdx + 1]);
  }

  let customGatewayUrl;
  const gwIdx = args.findIndex((a) => a === '--gateway-url');
  if (gwIdx !== -1 && args[gwIdx + 1]) {
    customGatewayUrl = args[gwIdx + 1].trim();
  }

  const config = loadConfig();
  if (customUiPort) config.uiPort = customUiPort;
  if (customProxyPort) config.proxyPort = customProxyPort;
  if (customBudget) config.sessionBudgetUsd = customBudget;
  if (customGatewayUrl) config.upstreamGatewayUrl = customGatewayUrl;
  if (customDataDir) {
    config.dbPath = path.join(customDataDir, 'daemon.sqlite');
    config.tokenPath = path.join(customDataDir, 'daemon.token');
  }

  const targetUiPort = await findAvailablePort(config.uiPort, config.bindHost);
  const targetProxyPort = await findAvailablePort(config.proxyPort, config.bindHost);

  // Initialize SQLite WAL
  const db = initializeDatabase(config.dbPath);
  const repository = new TraceRepository(db);
  const token = readOrCreateDaemonToken(config.tokenPath);

  const staticDir = path.resolve(__dirname, '../dist/ui');

  const daemon = createDaemonServer({
    config,
    repository,
    token,
    staticDir,
  });

  const { port, proxyPort, url, proxyUrl } = await daemon.listen(targetUiPort, config.bindHost, targetProxyPort);

  const finalProxyUrl = proxyUrl || `http://${config.bindHost}:${proxyPort || port}`;

  console.log(`
  \x1b[36m⚡ OsterdOps Guard Sentinel v2.0 Active\x1b[0m
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ \x1b[1mWeb Dashboard:\x1b[0m   ${url}
  │ \x1b[1mIngress Proxy:\x1b[0m   ${finalProxyUrl}
  │ \x1b[1mAPI Health:\x1b[0m      http://${config.bindHost}:${port}/healthz
  │ \x1b[1mSQLite WAL:\x1b[0m      ${config.dbPath}
  │ \x1b[1mAuth Token:\x1b[0m      ${config.tokenPath}
  │ \x1b[1mBudget Cap:\x1b[0m      $${config.sessionBudgetUsd.toFixed(2)} USD
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ \x1b[1mIntegrate with AI Coding Agents:\x1b[0m                                             │
  │ • \x1b[32mCursor / OpenAI SDK:\x1b[0m                                                     │
  │   OPENAI_BASE_URL=${finalProxyUrl}/v1
  │ • \x1b[33mCline / Claude Dev / Anthropic:\x1b[0m                                          │
  │   ANTHROPIC_BASE_URL=${finalProxyUrl}
  └─────────────────────────────────────────────────────────────────────────────┘
  \x1b[90mPress Ctrl+C to stop the daemon.\x1b[0m
  `);

  if (!noOpen) {
    openBrowser(url);
  }

  const cleanup = async () => {
    console.log('\n[Guard] Shutting down daemon gracefully...');
    try {
      await daemon.close();
      db.close();
      console.log('[Guard] All server sockets and database connections closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('[Guard] Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((err) => {
  console.error('[Guard] Fatal error starting daemon:', err);
  process.exit(1);
});
