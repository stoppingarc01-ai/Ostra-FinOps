#!/usr/bin/env node
import { exec } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import fs from 'node:fs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../dist/src/config.js';
import { initializeDatabase } from '../dist/src/db/connection.js';
import { TraceRepository } from '../dist/src/db/repository.js';
import { createDaemonServer } from '../dist/src/server/http-server.js';
import { saveDaemonToken, readOrCreateDaemonToken } from '../dist/src/security.js';

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
  const resetAuth = args.includes('--reset') || args.includes('--reauth');

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
  🛡️  OsterdOps Sentinel Local Daemon CLI

  Usage:
    node packages/guard-daemon/bin/cli.js [options]

  Options:
    --id <client_id>        Solo Client ID from Console
    --secret <passkey>      Secret passkey from Console
    --port <number>         Ingress proxy port (default: 8080)
    --telemetry <number>    Telemetry UI port (default: 4040)
    --no-browser            Do not automatically open browser
    --reset                 Reset cached authentication credentials
    -h, --help              Show this help message
`);
    process.exit(0);
  }

  // 1. Check for CLI arguments for authentication & custom port
  let clientId = undefined;
  const idIdx = args.findIndex((a) => a === '--id' || a === '--client-id');
  if (idIdx !== -1 && args[idIdx + 1]) {
    clientId = args[idIdx + 1].trim();
  }

  let secretPasskey = undefined;
  const secIdx = args.findIndex((a) => a === '--secret' || a === '--pass' || a === '--password');
  if (secIdx !== -1 && args[secIdx + 1]) {
    secretPasskey = args[secIdx + 1].trim();
  }

  let customProxyPort;
  const proxyPortIdx = args.findIndex((a) => a === '--proxy-port' || a === '--port' || a === '-p');
  if (proxyPortIdx !== -1 && args[proxyPortIdx + 1]) {
    customProxyPort = parseInt(args[proxyPortIdx + 1], 10);
  }

  // 2. Auth cache file in user's home directory (~/.osterdops/daemon.auth)
  const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
  const authStoreDir = path.join(homeDir, '.osterdops');
  const authStoreFile = path.join(authStoreDir, 'daemon.auth');

  if (!resetAuth && (!clientId || !secretPasskey)) {
    if (fs.existsSync(authStoreFile)) {
      try {
        const saved = JSON.parse(fs.readFileSync(authStoreFile, 'utf-8'));
        if (saved.clientId && saved.secret) {
          clientId = clientId || saved.clientId;
          secretPasskey = secretPasskey || saved.secret;
          if (!customProxyPort && saved.port) {
            customProxyPort = saved.port;
          }
        }
      } catch {}
    }
  }

  // 3. Prompt interactively if ID or Secret are still missing
  if (!clientId || !secretPasskey) {
    console.log(`
  \x1b[33m🔒 OsterdOps Sentinel — Security Pairing Required\x1b[0m
  ─────────────────────────────────────────────────────────────────────────────
  To ensure end-to-end local safety, please enter the pairing credentials
  from your Solo Developer Console (\x1b[36mhttp://localhost:5173/#solo-guard\x1b[0m):
  ─────────────────────────────────────────────────────────────────────────────
    `);

    const rl = readline.createInterface({ input, output });
    try {
      if (!clientId) {
        const ans = await rl.question('  🔑 Enter Client ID (e.g. ost_client_solo_...): ');
        clientId = ans.trim();
      }
      if (!secretPasskey) {
        const ans = await rl.question('  🛡️  Enter Secret Passkey (e.g. ost_sec_...): ');
        secretPasskey = ans.trim();
      }
      if (!customProxyPort) {
        const ans = await rl.question('  🌐 Enter Unique Ingress Port [Default: 8080]: ');
        const p = parseInt(ans.trim(), 10);
        if (p && !isNaN(p)) {
          customProxyPort = p;
        }
      }
    } finally {
      rl.close();
    }
  }

  if (!clientId || clientId.length < 4) {
    console.error('\x1b[31m❌ Error: Client ID is required. Obtain it from your Solo Developer Console.\x1b[0m');
    process.exit(1);
  }

  if (!secretPasskey || secretPasskey.length < 6) {
    console.error('\x1b[31m❌ Error: Secret Passkey is required (min 6 chars). Obtain it from your Solo Developer Console.\x1b[0m');
    process.exit(1);
  }

  customProxyPort = customProxyPort || 8080;

  // Persist secure pairing locally with strict permissions
  try {
    if (!fs.existsSync(authStoreDir)) {
      fs.mkdirSync(authStoreDir, { recursive: true, mode: 0o700 });
    }
    fs.writeFileSync(
      authStoreFile,
      JSON.stringify({ clientId, secret: secretPasskey, port: customProxyPort, pairedAt: new Date().toISOString() }, null, 2),
      { mode: 0o600 }
    );
  } catch {}

  let customUiPort;
  const uiPortIdx = args.findIndex((a) => a === '--ui-port');
  if (uiPortIdx !== -1 && args[uiPortIdx + 1]) {
    customUiPort = parseInt(args[uiPortIdx + 1], 10);
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

  // Save the secret passkey as the authorized daemon token
  saveDaemonToken(config.tokenPath, secretPasskey);

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
  │ \x1b[1mClient Paired:\x1b[0m   \x1b[32m${clientId}\x1b[0m
  │ \x1b[1mSecret Lock:\x1b[0m     \x1b[33mVerified (Constant-Time Match)\x1b[0m
  │ \x1b[1mWeb Dashboard:\x1b[0m   ${url}
  │ \x1b[1mIngress Proxy:\x1b[0m   ${finalProxyUrl} (\x1b[35mUnique Port: ${customProxyPort}\x1b[0m)
  │ \x1b[1mAPI Health:\x1b[0m      http://${config.bindHost}:${port}/healthz
  │ \x1b[1mSQLite WAL:\x1b[0m      ${config.dbPath}
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
