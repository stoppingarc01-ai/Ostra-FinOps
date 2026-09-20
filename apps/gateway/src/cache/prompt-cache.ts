import { createHash } from 'node:crypto';
import type { ExtractedTokenUsage } from '../accounting/types';

export interface CachedPromptResponse {
  cacheKey: string;
  statusCode: number;
  headers: Record<string, string>;
  rawResponse: string;
  parsedResponse?: Record<string, unknown>;
  usage: ExtractedTokenUsage;
  createdAt: number;
  expiresAt: number;
}

export interface IPromptCache {
  isEligible(payload: Record<string, unknown>, explicitOptInHeader?: string | null): boolean;
  computeKey(orgId: string, envId: string, modelId: string, payload: Record<string, unknown>): string;
  get(key: string): Promise<CachedPromptResponse | null>;
  set(record: CachedPromptResponse): Promise<void>;
  invalidate(key: string): Promise<void>;
}

export class InMemoryPromptCache implements IPromptCache {
  private cache = new Map<string, CachedPromptResponse>();
  private sweepInterval: NodeJS.Timeout | null = null;

  constructor(sweepIntervalMs = 60_000) {
    this.sweepInterval = setInterval(() => this.sweep(), sweepIntervalMs);
    if (this.sweepInterval.unref) {
      this.sweepInterval.unref();
    }
  }

  /**
   * Safe qualification check: Only cache if temperature === 0 / top_p === 0,
   * or client explicitly passed `X-OstraOps-Cache: true`.
   */
  isEligible(payload: Record<string, unknown>, explicitOptInHeader?: string | null): boolean {
    if (explicitOptInHeader === 'true' || explicitOptInHeader === '1') {
      return true;
    }

    const temp = payload.temperature;
    if (typeof temp === 'number' && temp === 0) {
      return true;
    }

    const topP = payload.top_p;
    if (typeof topP === 'number' && topP === 0) {
      return true;
    }

    return false;
  }

  /**
   * Deterministic SHA-256 hash isolated across tenant, environment, model, and message bodies.
   */
  computeKey(orgId: string, envId: string, modelId: string, payload: Record<string, unknown>): string {
    const normalized = {
      messages: payload.messages,
      tools: payload.tools,
      tool_choice: payload.tool_choice,
      response_format: payload.response_format,
    };

    const serialized = JSON.stringify(normalized);
    const raw = `${orgId}:${envId}:${modelId}:${serialized}`;
    return createHash('sha256').update(raw, 'utf8').digest('hex');
  }

  async get(key: string): Promise<CachedPromptResponse | null> {
    const now = Date.now();
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt <= now) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  async set(record: CachedPromptResponse): Promise<void> {
    this.cache.set(record.cacheKey, record);
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
  }

  private sweep(): void {
    const now = Date.now();
    for (const [k, v] of this.cache.entries()) {
      if (v.expiresAt <= now) {
        this.cache.delete(k);
      }
    }
  }

  destroy(): void {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
    this.cache.clear();
  }
}

export const promptCache = new InMemoryPromptCache();
