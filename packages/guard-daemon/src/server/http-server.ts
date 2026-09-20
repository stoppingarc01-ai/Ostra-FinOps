import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Socket } from 'node:net';
import type { AddressInfo } from 'node:net';
import type { DaemonConfig } from '../config.js';
import { TraceRepository, type LocalTraceRecord } from '../db/repository.js';
import { TaskRepository } from '../db/tasks-repository.js';
import { RollingVelocityEngine } from '../engine/velocity.js';
import { SseBroker } from '../engine/sse-broker.js';
import { readOrCreateDaemonToken, isLoopbackHost } from '../security.js';
import { handleApiRoute, type RouteContext } from './api-routes.js';
import { handleLocalIngress, type IngressContext } from '../proxy/local-ingress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DaemonServerOptions {
  config: DaemonConfig;
  repository: TraceRepository;
  tasksRepository?: TaskRepository;
  token?: string;
  staticDir?: string;
}

export interface DaemonServerInstance {
  server: http.Server;
  proxyServer?: http.Server;
  token: string;
  sseBroker: SseBroker;
  velocity: RollingVelocityEngine;
  repository: TraceRepository;
  tasksRepository: TaskRepository;
  config: DaemonConfig;
  listen(
    port?: number,
    host?: string,
    proxyPort?: number
  ): Promise<{ port: number; proxyPort?: number; host: string; url: string; proxyUrl?: string }>;
  close(): Promise<void>;
  recordAndBroadcast(trace: LocalTraceRecord): void;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/**
 * Production-hardened static file server with realpath verification and path traversal defenses.
 */
function serveStaticFile(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  staticDir: string,
  token?: string
): boolean {
  if (!fs.existsSync(staticDir)) {
    return false;
  }

  const rawUrl = req.url || '/';
  // Immediate traversal check on raw URL string
  if (rawUrl.includes('..') || rawUrl.toLowerCase().includes('%2e%2e')) {
    res.writeHead(403);
    res.end('Forbidden: Directory traversal denied');
    return true;
  }

  const cleanUrl = rawUrl.split('?')[0];
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(cleanUrl);
  } catch {
    res.writeHead(400);
    res.end('Bad Request: Invalid URL encoding');
    return true;
  }

  // Reject null bytes
  if (decodedPath.includes('\0')) {
    res.writeHead(400);
    res.end('Bad Request: Null bytes forbidden');
    return true;
  }

  const resolvedBase = path.resolve(staticDir);
  let safeRelative = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  let targetPath = path.resolve(resolvedBase, safeRelative);

  // Path boundary check
  if (!targetPath.startsWith(resolvedBase)) {
    res.writeHead(403);
    res.end('Forbidden: Directory traversal denied');
    return true;
  }

  // Canonical symlink resolution
  if (fs.existsSync(targetPath)) {
    try {
      const realTarget = fs.realpathSync(targetPath);
      const realBase = fs.realpathSync(resolvedBase);
      if (!realTarget.startsWith(realBase)) {
        res.writeHead(403);
        res.end('Forbidden: Symlink escape denied');
        return true;
      }
      targetPath = realTarget;
    } catch {
      return false;
    }
  }

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(targetPath).pipe(res);
    return true;
  }

  // SPA fallback only for HTML navigation / routes (no file extension)
  const fileExt = path.extname(decodedPath);
  if (!fileExt || fileExt === '.html') {
    const indexPath = path.join(resolvedBase, 'index.html');
    if (fs.existsSync(indexPath)) {
      const headers: Record<string, string> = { 'Content-Type': 'text/html; charset=utf-8' };
      if (token) {
        headers['Set-Cookie'] = `ostraops_token=${token}; Path=/; HttpOnly; SameSite=Lax`;
      }
      res.writeHead(200, headers);
      fs.createReadStream(indexPath).pipe(res);
      return true;
    }
  }

  // Known file extension that does not exist returns 404
  res.writeHead(404);
  res.end('Not Found');
  return true;
}

export function createDaemonServer(options: DaemonServerOptions): DaemonServerInstance {
  const token = options.token || readOrCreateDaemonToken(options.config.tokenPath);
  const velocity = new RollingVelocityEngine(options.config.rollingWindowSeconds);
  const sseBroker = new SseBroker(options.config.ringBufferSize);
  const tasksRepository =
    options.tasksRepository ||
    new TaskRepository(options.repository.getConnections());
  let activePort: number | undefined;
  const activeSockets = new Set<Socket>();

  const candidateStaticDirs = [
    options.staticDir,
    path.resolve(__dirname, '../../dist/ui'),
    path.resolve(__dirname, '../ui'),
    path.resolve(process.cwd(), 'packages/guard-daemon/dist/ui'),
  ].filter((d): d is string => typeof d === 'string' && fs.existsSync(d));
  const resolvedStaticDir = candidateStaticDirs[0];

  const routeContext: RouteContext = {
    config: options.config,
    repository: options.repository,
    tasksRepository,
    velocity,
    sseBroker,
    daemonToken: token,
    get listenPort() {
      return activePort;
    },
  };

  const ingressContext: IngressContext = {
    config: options.config,
    repository: options.repository,
    velocity,
    sseBroker,
  };

  let activeProxyPort: number | undefined;

  const server = http.createServer(async (req, res) => {
    // 1. Handle local ingress proxy routes (/v1/chat/completions, /v1/messages)
    const cleanUrl = (req.url || '/').split('?')[0];
    if (
      cleanUrl === '/v1/chat/completions' ||
      cleanUrl === '/chat/completions' ||
      cleanUrl === '/v1/messages' ||
      cleanUrl === '/messages'
    ) {
      try {
        const handled = await handleLocalIngress(req, res, ingressContext);
        if (handled) return;
      } catch (err: any) {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: err.message || 'Internal proxy error', type: 'internal_error' } }));
        }
        return;
      }
    }

    // 2. Handle API routes
    const handledApi = handleApiRoute(req, res, routeContext);
    if (handledApi) return;

    // 3. Handle static files
    if (resolvedStaticDir && serveStaticFile(req, res, resolvedStaticDir, token)) {
      return;
    }

    // 4. Fallback placeholder
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>OstraOps Guard Daemon</title></head>
        <body style="font-family: monospace; padding: 2rem; background: #0f172a; color: #f8fafc;">
          <h2>OstraOps Guard Daemon</h2>
          <p>Status: Healthy</p>
          <p>Session Token: <code>${token}</code></p>
          <p>Health Check: <a href="/healthz" style="color: #38bdf8;">/healthz</a></p>
        </body>
      </html>
    `);
  });

  // Dedicated proxy server for listening on options.config.proxyPort
  const proxyServer = http.createServer(async (req, res) => {
    try {
      const handled = await handleLocalIngress(req, res, ingressContext);
      if (handled) return;
    } catch (err: any) {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: err.message || 'Internal proxy error', type: 'internal_error' } }));
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: {
        message: 'Endpoint not found on Ingress Proxy. Use /v1/chat/completions or /v1/messages',
        type: 'invalid_request_error',
      },
    }));
  });

  server.on('connection', (socket) => {
    activeSockets.add(socket);
    socket.on('close', () => activeSockets.delete(socket));
  });

  proxyServer.on('connection', (socket) => {
    activeSockets.add(socket);
    socket.on('close', () => activeSockets.delete(socket));
  });

  return {
    server,
    proxyServer,
    token,
    sseBroker,
    velocity,
    repository: options.repository,
    tasksRepository,
    config: options.config,

    listen(
      port = options.config.uiPort,
      host = options.config.bindHost,
      proxyPort = options.config.proxyPort
    ): Promise<{ port: number; proxyPort?: number; host: string; url: string; proxyUrl?: string }> {
      return new Promise((resolve, reject) => {
        // Enforce loopback binding strictly: reject 0.0.0.0, LAN IPs, or WAN interfaces
        if (!isLoopbackHost(host)) {
          return reject(new Error(`Security Guard Violation: Daemon cannot bind to non-loopback host '${host}'. Bind must be 127.0.0.1 or ::1.`));
        }

        server.listen(port, host, () => {
          const addr = server.address() as AddressInfo;
          const currentPort = addr.port;
          activePort = currentPort;
          const url = `http://127.0.0.1:${currentPort}/?token=${token}`;

          if (proxyPort && proxyPort !== currentPort) {
            proxyServer.listen(proxyPort, host, () => {
              const proxyAddr = proxyServer.address() as AddressInfo;
              activeProxyPort = proxyAddr.port;
              const proxyUrl = `http://127.0.0.1:${activeProxyPort}`;
              resolve({ port: currentPort, proxyPort: activeProxyPort, host, url, proxyUrl });
            });
            proxyServer.once('error', (proxyErr) => {
              console.warn(`[Proxy] Could not bind dedicated proxyPort ${proxyPort}:`, proxyErr.message);
              // Fallback: proxy is still served on UI port!
              resolve({ port: currentPort, proxyPort: currentPort, host, url, proxyUrl: `http://127.0.0.1:${currentPort}` });
            });
          } else {
            resolve({ port: currentPort, proxyPort: currentPort, host, url, proxyUrl: `http://127.0.0.1:${currentPort}` });
          }
        });

        server.once('error', reject);
      });
    },

    recordAndBroadcast(trace: LocalTraceRecord): void {
      options.repository.insert(trace);
      velocity.record(trace.inputTokens, trace.outputTokens, trace.timestamp);
      sseBroker.broadcast('trace', trace);
      sseBroker.broadcast('metrics', {
        velocity: velocity.getMetrics(),
        totalCostUsd: options.repository.getSessionSummary(trace.sessionId).totalCostUsd,
      });
    },

    close(): Promise<void> {
      return new Promise((resolve, reject) => {
        sseBroker.close();
        velocity.reset();

        // Gracefully destroy open sockets
        for (const socket of activeSockets) {
          socket.destroy();
        }
        activeSockets.clear();

        let pending = 1;
        if (proxyServer.listening) {
          pending++;
          proxyServer.close(() => {
            pending--;
            if (pending === 0) resolve();
          });
        }

        server.close((err) => {
          if (err) reject(err);
          else {
            pending--;
            if (pending === 0) resolve();
          }
        });
      });
    },
  };
}
