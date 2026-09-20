import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

export interface DaemonConfig {
  proxyPort: number;
  uiPort: number;
  bindHost: string;
  sessionBudgetUsd: number;
  dbPath: string;
  tokenPath: string;
  rollingWindowSeconds: number;
  ringBufferSize: number;
  hardCutoff: boolean;
  warningThresholdPct: number;
  rateLimitRpm: number;
  maxVelocityUsdPerMin: number;
  maxTpm: number;
  intraFamilyFailover: boolean;
  upstreamGatewayUrl?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
}

export const DEFAULT_CONFIG: DaemonConfig = {
  proxyPort: 8080,
  uiPort: 4040,
  bindHost: '127.0.0.1',
  sessionBudgetUsd: 5.0,
  dbPath: join(homedir(), '.ostraops', 'daemon.sqlite'),
  tokenPath: join(homedir(), '.ostraops', 'daemon.token'),
  rollingWindowSeconds: 300, // 5 minutes
  ringBufferSize: 1000, // Hardened capacity for heavy autonomous agent loops
  hardCutoff: true,
  warningThresholdPct: 80,
  rateLimitRpm: 60,
  maxVelocityUsdPerMin: 2.0, // Hard limit of $2.00/min burn rate
  maxTpm: 200_000, // Hard limit of 200k tokens/min
  intraFamilyFailover: true, // Auto-cascade (e.g. Sonnet -> Haiku) on upstream outage
};

/**
 * Loads configuration from ~/.ostraops/config.json or environment variables,
 * falling back to production-hardened defaults.
 */
export function loadConfig(customConfigPath?: string): DaemonConfig {
  const dirPath = join(homedir(), '.ostraops');
  if (!existsSync(dirPath)) {
    try {
      mkdirSync(dirPath, { recursive: true });
    } catch {
      // Ignored if created concurrently or read-only homedir
    }
  }

  const filePath = customConfigPath
    ? resolve(customConfigPath)
    : join(dirPath, 'config.json');

  let fileConfig: Partial<DaemonConfig> = {};
  if (existsSync(filePath)) {
    try {
      const raw = readFileSync(filePath, 'utf8');
      fileConfig = JSON.parse(raw);
    } catch (err) {
      console.warn(`[Config] Failed to parse ${filePath}, using defaults. Error:`, err);
    }
  }

  const proxyPort = Number(process.env.OSTRAOPS_PROXY_PORT) || fileConfig.proxyPort || DEFAULT_CONFIG.proxyPort;
  const uiPort = Number(process.env.OSTRAOPS_UI_PORT) || fileConfig.uiPort || DEFAULT_CONFIG.uiPort;
  const bindHost = process.env.OSTRAOPS_BIND_HOST || fileConfig.bindHost || DEFAULT_CONFIG.bindHost;
  const sessionBudgetUsd = Number(process.env.OSTRAOPS_SESSION_BUDGET) || fileConfig.sessionBudgetUsd || DEFAULT_CONFIG.sessionBudgetUsd;
  const dbPath = process.env.OSTRAOPS_DB_PATH || fileConfig.dbPath || DEFAULT_CONFIG.dbPath;
  const tokenPath = process.env.OSTRAOPS_TOKEN_PATH || fileConfig.tokenPath || DEFAULT_CONFIG.tokenPath;
  const rollingWindowSeconds = fileConfig.rollingWindowSeconds || DEFAULT_CONFIG.rollingWindowSeconds;
  const ringBufferSize = fileConfig.ringBufferSize || DEFAULT_CONFIG.ringBufferSize;
  const hardCutoff = fileConfig.hardCutoff !== undefined ? Boolean(fileConfig.hardCutoff) : DEFAULT_CONFIG.hardCutoff;
  const warningThresholdPct = Number(fileConfig.warningThresholdPct) || DEFAULT_CONFIG.warningThresholdPct;
  const rateLimitRpm = Number(fileConfig.rateLimitRpm) || DEFAULT_CONFIG.rateLimitRpm;
  const maxVelocityUsdPerMin = Number(process.env.OSTRAOPS_MAX_VELOCITY_USD_PER_MIN) || fileConfig.maxVelocityUsdPerMin || DEFAULT_CONFIG.maxVelocityUsdPerMin;
  const maxTpm = Number(process.env.OSTRAOPS_MAX_TPM) || fileConfig.maxTpm || DEFAULT_CONFIG.maxTpm;
  const intraFamilyFailover = fileConfig.intraFamilyFailover !== undefined
    ? Boolean(fileConfig.intraFamilyFailover)
    : (process.env.OSTRAOPS_INTRA_FAMILY_FAILOVER !== 'false' ? DEFAULT_CONFIG.intraFamilyFailover : false);

  return {
    proxyPort,
    uiPort,
    bindHost,
    sessionBudgetUsd,
    dbPath,
    tokenPath,
    rollingWindowSeconds,
    ringBufferSize,
    hardCutoff,
    warningThresholdPct,
    rateLimitRpm,
    maxVelocityUsdPerMin,
    maxTpm,
    intraFamilyFailover,
    upstreamGatewayUrl: process.env.OSTRAOPS_GATEWAY_URL || fileConfig.upstreamGatewayUrl,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || fileConfig.anthropicApiKey,
    openaiApiKey: process.env.OPENAI_API_KEY || fileConfig.openaiApiKey,
  };
}

/**
 * Persists updated daemon configurations to ~/.ostraops/config.json
 */
export function saveConfig(updates: Partial<DaemonConfig>, customConfigPath?: string): DaemonConfig {
  const dirPath = join(homedir(), '.ostraops');
  if (!existsSync(dirPath)) {
    try {
      mkdirSync(dirPath, { recursive: true });
    } catch {
      // Ignored
    }
  }

  const filePath = customConfigPath
    ? resolve(customConfigPath)
    : join(dirPath, 'config.json');

  let fileConfig: Record<string, unknown> = {};
  if (existsSync(filePath)) {
    try {
      fileConfig = JSON.parse(readFileSync(filePath, 'utf8'));
    } catch {
      // Fallback
    }
  }

  const merged = { ...fileConfig, ...updates };
  try {
    writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
  } catch (err) {
    console.warn(`[Config] Failed to write config to ${filePath}:`, err);
  }

  return loadConfig(customConfigPath);
}

