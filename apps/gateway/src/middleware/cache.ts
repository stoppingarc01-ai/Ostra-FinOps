import { createHash } from 'node:crypto';
import type { IncomingHttpHeaders } from 'node:http';

export interface RateLimits {
  rpm: number;
  tpm: number;
  maxConcurrency: number;
}

export interface CachedVirtualKey {
  id: string;
  organizationId: string;
  projectId: string;
  environmentId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  monthlyLimitUsd: number;
  currentSpendUsd: number;
  status: 'active' | 'frozen' | 'revoked';
  rateLimits: RateLimits;
  cachedAt: number;
  expiresAt: number;
}

/**
 * Computes SHA-256 hex digest of a raw API key token.
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey.trim()).digest('hex');
}

/**
 * Extracts raw API token from Authorization Bearer or x-api-key headers.
 */
export function extractApiKey(headers: IncomingHttpHeaders): string | null {
  const authHeader = headers['authorization'];
  if (authHeader) {
    const raw = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (raw && raw.startsWith('Bearer ')) {
      return raw.slice(7).trim();
    }
  }

  const apiKeyHeader = headers['x-api-key'];
  if (apiKeyHeader) {
    const raw = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
    if (raw && raw.trim().length > 0) {
      return raw.trim();
    }
  }

  return null;
}

/**
 * Abstract store interface for Virtual Key metadata.
 * Enables zero-refactor swapping between in-memory driver (single instance)
 * and Redis cluster driver (multi-region / multi-instance edge).
 */
export interface IVirtualKeyCache {
  get(keyHash: string): Promise<CachedVirtualKey | null> | CachedVirtualKey | null;
  set(key: Omit<CachedVirtualKey, 'cachedAt' | 'expiresAt'>, ttlMs?: number): Promise<CachedVirtualKey> | CachedVirtualKey;
  recordSpendDelta(keyHash: string, deltaUsd: number): Promise<void> | void;
  invalidate(keyHash: string): Promise<void> | void;
  clear(): Promise<void> | void;
  size(): Promise<number> | number;
}

/**
 * In-Memory Driver for IVirtualKeyCache with automatic TTL eviction.
 */
export class InMemoryVirtualKeyCache implements IVirtualKeyCache {
  private cache = new Map<string, CachedVirtualKey>();
  private defaultTtlMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(ttlSeconds = 60) {
    this.defaultTtlMs = ttlSeconds * 1000;
    // Periodic sweep every 30 seconds to clean expired keys and prevent memory leaks
    this.cleanupInterval = setInterval(() => this.sweepExpired(), 30_000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  public get(keyHash: string): CachedVirtualKey | null {
    const entry = this.cache.get(keyHash);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(keyHash);
      return null;
    }

    return entry;
  }

  public set(key: Omit<CachedVirtualKey, 'cachedAt' | 'expiresAt'>, ttlMs?: number): CachedVirtualKey {
    const now = Date.now();
    const ttl = ttlMs ?? this.defaultTtlMs;
    const cachedEntry: CachedVirtualKey = {
      ...key,
      cachedAt: now,
      expiresAt: now + ttl,
    };
    this.cache.set(key.keyHash, cachedEntry);
    return cachedEntry;
  }

  public recordSpendDelta(keyHash: string, deltaUsd: number): void {
    const entry = this.get(keyHash);
    if (entry) {
      entry.currentSpendUsd += deltaUsd;
      if (entry.currentSpendUsd >= entry.monthlyLimitUsd) {
        entry.status = 'frozen';
      }
    }
  }

  public invalidate(keyHash: string): void {
    this.cache.delete(keyHash);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }

  private sweepExpired(): void {
    const now = Date.now();
    for (const [keyHash, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(keyHash);
      }
    }
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Default singleton in-memory instance
export const virtualKeyCache: IVirtualKeyCache = new InMemoryVirtualKeyCache(60);
