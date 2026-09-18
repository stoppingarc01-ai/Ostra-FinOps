import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
export const DEFAULT_CONFIG = {
    proxyPort: 8080,
    uiPort: 4040,
    bindHost: '127.0.0.1',
    sessionBudgetUsd: 5.0,
    dbPath: join(homedir(), '.osterdops', 'daemon.sqlite'),
    tokenPath: join(homedir(), '.osterdops', 'daemon.token'),
    rollingWindowSeconds: 300, // 5 minutes
    ringBufferSize: 1000, // Hardened capacity for heavy autonomous agent loops
    hardCutoff: true,
    warningThresholdPct: 80,
    rateLimitRpm: 60,
};
/**
 * Loads configuration from ~/.osterdops/config.json or environment variables,
 * falling back to production-hardened defaults.
 */
export function loadConfig(customConfigPath) {
    const dirPath = join(homedir(), '.osterdops');
    if (!existsSync(dirPath)) {
        try {
            mkdirSync(dirPath, { recursive: true });
        }
        catch {
            // Ignored if created concurrently or read-only homedir
        }
    }
    const filePath = customConfigPath
        ? resolve(customConfigPath)
        : join(dirPath, 'config.json');
    let fileConfig = {};
    if (existsSync(filePath)) {
        try {
            const raw = readFileSync(filePath, 'utf8');
            fileConfig = JSON.parse(raw);
        }
        catch (err) {
            console.warn(`[Config] Failed to parse ${filePath}, using defaults. Error:`, err);
        }
    }
    const proxyPort = Number(process.env.OSTERDOPS_PROXY_PORT) || fileConfig.proxyPort || DEFAULT_CONFIG.proxyPort;
    const uiPort = Number(process.env.OSTERDOPS_UI_PORT) || fileConfig.uiPort || DEFAULT_CONFIG.uiPort;
    const bindHost = process.env.OSTERDOPS_BIND_HOST || fileConfig.bindHost || DEFAULT_CONFIG.bindHost;
    const sessionBudgetUsd = Number(process.env.OSTERDOPS_SESSION_BUDGET) || fileConfig.sessionBudgetUsd || DEFAULT_CONFIG.sessionBudgetUsd;
    const dbPath = process.env.OSTERDOPS_DB_PATH || fileConfig.dbPath || DEFAULT_CONFIG.dbPath;
    const tokenPath = process.env.OSTERDOPS_TOKEN_PATH || fileConfig.tokenPath || DEFAULT_CONFIG.tokenPath;
    const rollingWindowSeconds = fileConfig.rollingWindowSeconds || DEFAULT_CONFIG.rollingWindowSeconds;
    const ringBufferSize = fileConfig.ringBufferSize || DEFAULT_CONFIG.ringBufferSize;
    const hardCutoff = fileConfig.hardCutoff !== undefined ? Boolean(fileConfig.hardCutoff) : DEFAULT_CONFIG.hardCutoff;
    const warningThresholdPct = Number(fileConfig.warningThresholdPct) || DEFAULT_CONFIG.warningThresholdPct;
    const rateLimitRpm = Number(fileConfig.rateLimitRpm) || DEFAULT_CONFIG.rateLimitRpm;
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
        upstreamGatewayUrl: process.env.OSTERDOPS_GATEWAY_URL || fileConfig.upstreamGatewayUrl,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY || fileConfig.anthropicApiKey,
        openaiApiKey: process.env.OPENAI_API_KEY || fileConfig.openaiApiKey,
    };
}
/**
 * Persists updated daemon configurations to ~/.osterdops/config.json
 */
export function saveConfig(updates, customConfigPath) {
    const dirPath = join(homedir(), '.osterdops');
    if (!existsSync(dirPath)) {
        try {
            mkdirSync(dirPath, { recursive: true });
        }
        catch {
            // Ignored
        }
    }
    const filePath = customConfigPath
        ? resolve(customConfigPath)
        : join(dirPath, 'config.json');
    let fileConfig = {};
    if (existsSync(filePath)) {
        try {
            fileConfig = JSON.parse(readFileSync(filePath, 'utf8'));
        }
        catch {
            // Fallback
        }
    }
    const merged = { ...fileConfig, ...updates };
    try {
        writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
    }
    catch (err) {
        console.warn(`[Config] Failed to write config to ${filePath}:`, err);
    }
    return loadConfig(customConfigPath);
}
