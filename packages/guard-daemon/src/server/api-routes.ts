import type { IncomingMessage, ServerResponse } from 'node:http';
import { type DaemonConfig, saveConfig } from '../config.js';
import type { TraceRepository, TraceFilterOptions } from '../db/repository.js';
import type { TaskRepository, LocalTaskRecord, TaskPriority, TaskStatus } from '../db/tasks-repository.js';
import type { RollingVelocityEngine } from '../engine/velocity.js';
import type { SseBroker } from '../engine/sse-broker.js';
import { authorizeRequest, verifyDaemonToken } from '../security.js';
import {
  getAccountPayload,
  updateAccountPreferences,
  switchActiveVirtualKey,
  unlinkMachineCredentials,
  pairMachineCredentials,
} from '../credentials.js';

export interface RouteContext {
  config: DaemonConfig;
  repository: TraceRepository;
  tasksRepository?: TaskRepository;
  velocity: RollingVelocityEngine;
  sseBroker: SseBroker;
  daemonToken: string;
  listenPort?: number;
}

export function sendJson(
  res: ServerResponse,
  statusCode: number,
  data: unknown,
  origin?: string,
  extraHeaders?: Record<string, string>
): void {
  const payload = JSON.stringify(data);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Content-Length': String(Buffer.byteLength(payload)),
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OsterdOps-Daemon-Token, Last-Event-ID',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    ...extraHeaders,
  };
  res.writeHead(statusCode, headers);
  res.end(payload);
}

export function handleCorsPreflight(req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': (req.headers['origin'] as string) || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OsterdOps-Daemon-Token, Last-Event-ID',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  });
  res.end();
}

function parseJsonBody(req: IncomingMessage, maxBytes = 65536): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk.toString();
      if (data.length > maxBytes) {
        req.destroy();
        reject(new Error('PAYLOAD_TOO_LARGE'));
      }
    });
    req.on('end', () => {
      if (!data.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

let exchangeFailures = 0;
let lastFailureWindow = Date.now();

/**
 * Handles incoming HTTP API requests for the OsterdOps daemon.
 */
export function handleApiRoute(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RouteContext
): boolean {
  const origin = req.headers['origin'] as string | undefined;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    handleCorsPreflight(req, res);
    return true;
  }

  const host = req.headers['host'] || '127.0.0.1';
  let urlObj: URL;
  try {
    urlObj = new URL(req.url || '/', `http://${host}`);
  } catch {
    sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'Invalid URL format' } }, origin);
    return true;
  }

  const pathname = urlObj.pathname;

  // 1. Unauthenticated Health Check
  if (pathname === '/healthz' && req.method === 'GET') {
    sendJson(res, 200, {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
    }, origin);
    return true;
  }

  // Check if this is an /api/ route
  if (!pathname.startsWith('/api/')) {
    return false;
  }

  // 2. Auth Exchange Endpoint (POST /api/auth/exchange)
  // Allows browser UI to exchange token for an HttpOnly session cookie, cleansing URL query params
  if (pathname === '/api/auth/exchange' && req.method === 'POST') {
    const now = Date.now();
    if (now - lastFailureWindow > 60000) {
      exchangeFailures = 0;
      lastFailureWindow = now;
    }
    if (exchangeFailures >= 10) {
      sendJson(res, 429, { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded on auth exchange. Try again in 1 minute.' } }, origin);
      return true;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 4096) {
        req.destroy();
      }
    });
    req.on('end', () => {
      let tokenToVerify = req.headers['x-osterdops-daemon-token'] as string | undefined;
      if (!tokenToVerify && body) {
        try {
          const parsed = JSON.parse(body);
          tokenToVerify = parsed.token;
        } catch {
          // Ignore parse error
        }
      }

      if (!verifyDaemonToken(tokenToVerify, ctx.daemonToken)) {
        exchangeFailures++;
        sendJson(res, 401, { error: { code: 'UNAUTHORIZED', message: 'Invalid daemon authentication token' } }, origin);
        return;
      }

      // Reset failure counter on success
      exchangeFailures = 0;
      sendJson(
        res,
        200,
        { ok: true, message: 'Authenticated successfully' },
        origin,
        {
          'Set-Cookie': `osterdops_token=${ctx.daemonToken}; Path=/; HttpOnly; SameSite=Strict`,
        }
      );
    });
    return true;
  }

  // 3. Authenticate all other /api/* requests
  const auth = authorizeRequest(req, ctx.daemonToken, ctx.listenPort);
  if (!auth.authorized) {
    sendJson(res, auth.statusCode || 401, {
      error: { code: auth.statusCode === 403 ? 'FORBIDDEN' : 'UNAUTHORIZED', message: auth.reason || 'Unauthorized' }
    }, origin);
    return true;
  }

  // 4. Daemon Operational Metrics (GET /api/metrics)
  if (pathname === '/api/metrics' && req.method === 'GET') {
    const mem = process.memoryUsage();
    sendJson(res, 200, {
      uptimeSeconds: Math.floor(process.uptime()),
      sse: {
        activeClients: ctx.sseBroker.getClientCount(),
        ringBufferCapacity: ctx.sseBroker.getRingBuffer().capacity(),
        ringBufferSize: ctx.sseBroker.getRingBuffer().size(),
      },
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      },
      velocity: ctx.velocity.getMetrics(),
    }, origin);
    return true;
  }

  // 4. SSE Stream
  if (pathname === '/api/stream' && req.method === 'GET') {
    ctx.sseBroker.handleConnection(req, res);
    return true;
  }

  // 5. Session Snapshot & Velocity metrics
  if (pathname === '/api/session' && req.method === 'GET') {
    const sessionId = urlObj.searchParams.get('sessionId') || undefined;
    const summary = ctx.repository.getSessionSummary(sessionId);
    const velocityMetrics = ctx.velocity.getMetrics();
    const budgetCeiling = ctx.config.sessionBudgetUsd;
    const spent = summary.totalCostUsd;

    sendJson(res, 200, {
      summary,
      velocity: velocityMetrics,
      budget: {
        ceiling: budgetCeiling,
        spent,
        spentPercent: budgetCeiling > 0 ? (spent / budgetCeiling) * 100 : 0,
        isOverBudget: spent >= budgetCeiling,
      },
      timestamp: Date.now(),
    }, origin);
    return true;
  }

  // 6. Traces Query with Cursor Pagination & Filters
  if (pathname === '/api/traces' && req.method === 'GET') {
    const limit = Math.min(Math.max(parseInt(urlObj.searchParams.get('limit') || '50', 10), 1), 200);
    const cursor = urlObj.searchParams.get('cursor') ? parseInt(urlObj.searchParams.get('cursor')!, 10) : undefined;
    const sessionId = urlObj.searchParams.get('sessionId') || undefined;
    const provider = urlObj.searchParams.get('provider') || undefined;
    const model = urlObj.searchParams.get('model') || undefined;
    const statusParam = urlObj.searchParams.get('status');
    const status = statusParam === 'error' || statusParam === 'success' ? statusParam : undefined;
    const search = urlObj.searchParams.get('search') || undefined;

    const filterOpts: TraceFilterOptions = {
      limit,
      cursor,
      sessionId,
      provider,
      model,
      status,
      search,
    };

    const result = ctx.repository.queryTraces(filterOpts);
    sendJson(res, 200, {
      traces: result.traces,
      count: result.traces.length,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      limit,
    }, origin);
    return true;
  }

  // 7. Bulk Export (GET /api/traces/export)
  if (pathname === '/api/traces/export' && req.method === 'GET') {
    const sessionId = urlObj.searchParams.get('sessionId') || undefined;
    const all = ctx.repository.queryTraces({ limit: 200, sessionId });
    sendJson(res, 200, {
      exportedAt: new Date().toISOString(),
      traces: all.traces,
      totalExported: all.traces.length,
    }, origin);
    return true;
  }

  // 8. Trace Detail (GET /api/traces/:id)
  if (pathname.startsWith('/api/traces/') && req.method === 'GET') {
    const id = pathname.substring('/api/traces/'.length);
    if (!id) {
      sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'Missing trace ID' } }, origin);
      return true;
    }
    const trace = ctx.repository.getTraceById(id);
    if (!trace) {
      sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Trace not found' } }, origin);
      return true;
    }
    sendJson(res, 200, { trace }, origin);
    return true;
  }

  // 9. Tasks API: List Tasks (GET /api/tasks)
  if (pathname === '/api/tasks' && req.method === 'GET') {
    if (!ctx.tasksRepository) {
      sendJson(res, 501, { error: { code: 'NOT_IMPLEMENTED', message: 'Tasks repository not configured' } }, origin);
      return true;
    }
    const month = urlObj.searchParams.get('month') || undefined;
    const date = urlObj.searchParams.get('date') || undefined;
    const statusParam = urlObj.searchParams.get('status') as TaskStatus | null;
    const status = statusParam && ['todo', 'in_progress', 'completed'].includes(statusParam) ? statusParam : undefined;
    const priorityParam = urlObj.searchParams.get('priority') as TaskPriority | null;
    const priority = priorityParam && ['low', 'medium', 'high'].includes(priorityParam) ? priorityParam : undefined;

    const tasks = ctx.tasksRepository.listTasks({ month, date, status, priority });
    sendJson(res, 200, { tasks, count: tasks.length }, origin);
    return true;
  }

  // 10. Tasks API: Create Task (POST /api/tasks)
  if (pathname === '/api/tasks' && req.method === 'POST') {
    if (!ctx.tasksRepository) {
      sendJson(res, 501, { error: { code: 'NOT_IMPLEMENTED', message: 'Tasks repository not configured' } }, origin);
      return true;
    }
    parseJsonBody(req)
      .then((body) => {
        const title = typeof body.title === 'string' ? body.title.trim() : '';
        const targetDate = typeof body.targetDate === 'string' ? body.targetDate.trim() : '';
        if (!title || !targetDate) {
          sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'Title and targetDate (YYYY-MM-DD) are required' } }, origin);
          return;
        }
        const description = typeof body.description === 'string' ? body.description.trim() : null;
        const targetTime = typeof body.targetTime === 'string' ? body.targetTime.trim() : null;
        const tokenBudgetUsd = typeof body.tokenBudgetUsd === 'number' && !isNaN(body.tokenBudgetUsd) ? body.tokenBudgetUsd : 0;
        const priority = ['low', 'medium', 'high'].includes(body.priority as string) ? (body.priority as TaskPriority) : 'medium';
        const status = ['todo', 'in_progress', 'completed'].includes(body.status as string) ? (body.status as TaskStatus) : 'todo';

        const id = typeof body.id === 'string' && body.id ? body.id : `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = Date.now();
        const newTask: LocalTaskRecord = {
          id,
          title,
          description,
          targetDate,
          targetTime,
          tokenBudgetUsd,
          priority,
          status,
          createdAt: now,
          updatedAt: now,
        };

        const created = ctx.tasksRepository!.createTask(newTask);
        sendJson(res, 201, { task: created }, origin);
      })
      .catch((err) => {
        sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: err.message || 'Invalid payload' } }, origin);
      });
    return true;
  }

  // 11. Tasks API: Update Task (PATCH /api/tasks/:id)
  if (pathname.startsWith('/api/tasks/') && req.method === 'PATCH') {
    if (!ctx.tasksRepository) {
      sendJson(res, 501, { error: { code: 'NOT_IMPLEMENTED', message: 'Tasks repository not configured' } }, origin);
      return true;
    }
    const id = pathname.substring('/api/tasks/'.length);
    if (!id) {
      sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'Missing task ID' } }, origin);
      return true;
    }
    parseJsonBody(req)
      .then((body) => {
        const updates: Partial<Omit<LocalTaskRecord, 'id' | 'createdAt'>> = {};
        if (typeof body.title === 'string') updates.title = body.title.trim();
        if (typeof body.description !== 'undefined') updates.description = body.description ? String(body.description).trim() : null;
        if (typeof body.targetDate === 'string') updates.targetDate = body.targetDate.trim();
        if (typeof body.targetTime !== 'undefined') updates.targetTime = body.targetTime ? String(body.targetTime).trim() : null;
        if (typeof body.tokenBudgetUsd === 'number') updates.tokenBudgetUsd = body.tokenBudgetUsd;
        if (['low', 'medium', 'high'].includes(body.priority as string)) updates.priority = body.priority as TaskPriority;
        if (['todo', 'in_progress', 'completed'].includes(body.status as string)) updates.status = body.status as TaskStatus;

        const updated = ctx.tasksRepository!.updateTask(id, updates);
        if (!updated) {
          sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Task not found' } }, origin);
          return;
        }
        sendJson(res, 200, { task: updated }, origin);
      })
      .catch((err) => {
        sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: err.message || 'Invalid payload' } }, origin);
      });
    return true;
  }

  // 12. Tasks API: Delete Task (DELETE /api/tasks/:id)
  if (pathname.startsWith('/api/tasks/') && req.method === 'DELETE') {
    if (!ctx.tasksRepository) {
      sendJson(res, 501, { error: { code: 'NOT_IMPLEMENTED', message: 'Tasks repository not configured' } }, origin);
      return true;
    }
    const id = pathname.substring('/api/tasks/'.length);
    if (!id) {
      sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'Missing task ID' } }, origin);
      return true;
    }
    const deleted = ctx.tasksRepository.deleteTask(id);
    if (!deleted) {
      sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Task not found' } }, origin);
      return true;
    }
    sendJson(res, 200, { ok: true, id }, origin);
    return true;
  }

  // 13. Tasks API: Get Single Task (GET /api/tasks/:id)
  if (pathname.startsWith('/api/tasks/') && req.method === 'GET') {
    if (!ctx.tasksRepository) {
      sendJson(res, 501, { error: { code: 'NOT_IMPLEMENTED', message: 'Tasks repository not configured' } }, origin);
      return true;
    }
    const id = pathname.substring('/api/tasks/'.length);
    if (!id) {
      sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'Missing task ID' } }, origin);
      return true;
    }
    const task = ctx.tasksRepository.getTaskById(id);
    if (!task) {
      sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Task not found' } }, origin);
      return true;
    }
    sendJson(res, 200, { task }, origin);
    return true;
  }

  // 14. Account API: Get Machine & Cloud Account Info (GET /api/account)
  if (pathname === '/api/account' && req.method === 'GET') {
    const accountInfo = getAccountPayload(ctx.config.bindHost);
    sendJson(res, 200, { account: accountInfo }, origin);
    return true;
  }

  // 15. Account API: Update Telemetry Preferences (PATCH /api/account/preferences)
  if (pathname === '/api/account/preferences' && req.method === 'PATCH') {
    parseJsonBody(req)
      .then((body) => {
        const updates: Record<string, boolean> = {};
        if (typeof body.syncAggregatedMetrics === 'boolean') {
          updates.syncAggregatedMetrics = body.syncAggregatedMetrics;
        }
        if (typeof body.allowPromptCaching === 'boolean') {
          updates.allowPromptCaching = body.allowPromptCaching;
        }
        if (typeof body.offlineSpooling === 'boolean') {
          updates.offlineSpooling = body.offlineSpooling;
        }
        const updated = updateAccountPreferences(updates);
        sendJson(res, 200, { ok: true, preferences: updated }, origin);
      })
      .catch((err) => {
        sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: err.message || 'Invalid body' } }, origin);
      });
    return true;
  }

  // 16. Account API: Switch Active Virtual Key (POST /api/account/key)
  if (pathname === '/api/account/key' && req.method === 'POST') {
    parseJsonBody(req)
      .then((body) => {
        const keyId = typeof body.keyId === 'string' ? body.keyId : '';
        if (!keyId) {
          sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'keyId is required' } }, origin);
          return;
        }
        const switched = switchActiveVirtualKey(keyId);
        if (!switched) {
          sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Key profile not found' } }, origin);
          return;
        }
        sendJson(res, 200, { ok: true, activeKey: switched }, origin);
      })
      .catch((err) => {
        sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: err.message || 'Invalid body' } }, origin);
      });
    return true;
  }

  // 17. Account API: Unlink Machine from Cloud (POST /api/account/unlink)
  if (pathname === '/api/account/unlink' && req.method === 'POST') {
    unlinkMachineCredentials();
    const accountInfo = getAccountPayload(ctx.config.bindHost);
    sendJson(res, 200, { ok: true, message: 'Machine unlinked successfully', account: accountInfo }, origin);
    return true;
  }

  // 17b. Account API: Pair Machine with Cloud Gateway (POST /api/account/pair)
  if (pathname === '/api/account/pair' && req.method === 'POST') {
    parseJsonBody(req)
      .then((body) => {
        const virtualKey = typeof body.virtualKey === 'string' ? body.virtualKey.trim() : '';
        if (!virtualKey) {
          sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'virtualKey is required' } }, origin);
          return;
        }
        try {
          const account = pairMachineCredentials({
            virtualKey,
            gatewayUrl: typeof body.gatewayUrl === 'string' ? body.gatewayUrl : undefined,
            keyName: typeof body.keyName === 'string' ? body.keyName : undefined,
            orgName: typeof body.orgName === 'string' ? body.orgName : undefined,
            projectName: typeof body.projectName === 'string' ? body.projectName : undefined,
          });
          sendJson(res, 200, { ok: true, message: 'Machine paired successfully', account }, origin);
        } catch (err: any) {
          sendJson(res, 400, { error: { code: 'PAIR_FAILED', message: err.message || 'Failed to pair machine' } }, origin);
        }
      })
      .catch((err) => {
        sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: err.message || 'Invalid body' } }, origin);
      });
    return true;
  }

  // 18. Config API: Get Current Config (GET /api/config)
  if (pathname === '/api/config' && req.method === 'GET') {
    const safeConfig = {
      proxyPort: ctx.config.proxyPort,
      uiPort: ctx.config.uiPort,
      bindHost: ctx.config.bindHost,
      sessionBudgetUsd: ctx.config.sessionBudgetUsd,
      rollingWindowSeconds: ctx.config.rollingWindowSeconds,
      ringBufferSize: ctx.config.ringBufferSize,
      hardCutoff: ctx.config.hardCutoff,
      warningThresholdPct: ctx.config.warningThresholdPct,
      rateLimitRpm: ctx.config.rateLimitRpm,
      dbPath: ctx.config.dbPath,
      upstreamGatewayUrl: ctx.config.upstreamGatewayUrl || 'https://gateway.osterdops.com/v1',
      hasAnthropicKey: Boolean(ctx.config.anthropicApiKey),
      maskedAnthropicKey: ctx.config.anthropicApiKey
        ? `${ctx.config.anthropicApiKey.substring(0, 7)}••••••••${ctx.config.anthropicApiKey.slice(-4)}`
        : '',
      hasOpenaiKey: Boolean(ctx.config.openaiApiKey),
      maskedOpenaiKey: ctx.config.openaiApiKey
        ? `${ctx.config.openaiApiKey.substring(0, 7)}••••••••${ctx.config.openaiApiKey.slice(-4)}`
        : '',
    };
    sendJson(res, 200, { config: safeConfig }, origin);
    return true;
  }

  // 19. Config API: Update Config (PATCH /api/config)
  if (pathname === '/api/config' && req.method === 'PATCH') {
    parseJsonBody(req)
      .then((body) => {
        const updates: Partial<DaemonConfig> = {};
        if (typeof body.sessionBudgetUsd === 'number' && !isNaN(body.sessionBudgetUsd) && body.sessionBudgetUsd >= 0) {
          updates.sessionBudgetUsd = body.sessionBudgetUsd;
          ctx.config.sessionBudgetUsd = body.sessionBudgetUsd;
        }
        if (typeof body.rollingWindowSeconds === 'number' && body.rollingWindowSeconds > 0) {
          updates.rollingWindowSeconds = body.rollingWindowSeconds;
          ctx.config.rollingWindowSeconds = body.rollingWindowSeconds;
        }
        if (typeof body.ringBufferSize === 'number' && body.ringBufferSize > 0) {
          updates.ringBufferSize = body.ringBufferSize;
          ctx.config.ringBufferSize = body.ringBufferSize;
        }
        if (typeof body.upstreamGatewayUrl === 'string') {
          updates.upstreamGatewayUrl = body.upstreamGatewayUrl.trim();
          ctx.config.upstreamGatewayUrl = updates.upstreamGatewayUrl;
        }
        if (typeof body.hardCutoff === 'boolean') {
          updates.hardCutoff = body.hardCutoff;
          ctx.config.hardCutoff = body.hardCutoff;
        }
        if (typeof body.warningThresholdPct === 'number' && body.warningThresholdPct >= 1 && body.warningThresholdPct <= 100) {
          updates.warningThresholdPct = body.warningThresholdPct;
          ctx.config.warningThresholdPct = body.warningThresholdPct;
        }
        if (typeof body.rateLimitRpm === 'number' && body.rateLimitRpm >= 1) {
          updates.rateLimitRpm = body.rateLimitRpm;
          ctx.config.rateLimitRpm = body.rateLimitRpm;
        }
        if (typeof body.anthropicApiKey === 'string' && body.anthropicApiKey.trim()) {
          updates.anthropicApiKey = body.anthropicApiKey.trim();
          ctx.config.anthropicApiKey = updates.anthropicApiKey;
        }
        if (typeof body.openaiApiKey === 'string' && body.openaiApiKey.trim()) {
          updates.openaiApiKey = body.openaiApiKey.trim();
          ctx.config.openaiApiKey = updates.openaiApiKey;
        }

        saveConfig(updates);
        sendJson(res, 200, { ok: true, message: 'Configuration saved' }, origin);
      })
      .catch((err) => {
        sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: err.message || 'Invalid config payload' } }, origin);
      });
    return true;
  }

  // Unknown API route
  sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Endpoint not found' } }, origin);
  return true;
}
