import type { CachedSecret, DatabaseSecretFetcher, ISecretResolver } from './types';

/**
 * Scoped Secret Resolver with Sub-Millisecond Ephemeral Caching.
 * Resolves upstream provider API keys (OpenAI, Anthropic, Gemini, etc.) using
 * organization credentials, caching resolved secrets in-memory for 60 seconds.
 */
export class ScopedSecretResolver implements ISecretResolver {
  private cache = new Map<string, CachedSecret>();
  private defaultTtlMs: number;
  private dbFetcher?: DatabaseSecretFetcher;

  constructor(options?: { ttlSeconds?: number; dbFetcher?: DatabaseSecretFetcher }) {
    this.defaultTtlMs = (options?.ttlSeconds ?? 60) * 1000;
    this.dbFetcher = options?.dbFetcher;
  }

  private buildCacheKey(orgId: string, provider: string): string {
    return `${orgId}:${provider.toLowerCase().trim()}`;
  }

  /**
   * Resolves an upstream API key for a given organization and provider.
   * Hits the ephemeral cache first (<1ms). If missing or expired, delegates to
   * the server-role database fetcher and populates the cache.
   */
  public async resolveProviderKey(orgId: string, provider: string): Promise<string | null> {
    const cacheKey = this.buildCacheKey(orgId, provider);
    const now = Date.now();

    // 1. Hot-path Ephemeral Cache Lookup (<1ms)
    const cached = this.cache.get(cacheKey);
    if (cached && now < cached.expiresAt) {
      return cached.apiKey;
    }

    // 2. Fetch from Decoupled Vault / Database Layer if fetcher registered
    if (!this.dbFetcher) {
      return null;
    }

    const resolvedApiKey = await this.dbFetcher(orgId, provider);
    if (!resolvedApiKey) {
      return null;
    }

    // 3. Cache the resolved key with short 60s TTL
    this.setCachedKey(orgId, provider, resolvedApiKey);
    return resolvedApiKey;
  }

  /**
   * Directly sets a cached API key (useful for tests or pre-warming).
   */
  public setCachedKey(orgId: string, provider: string, apiKey: string, ttlMs?: number): void {
    const cacheKey = this.buildCacheKey(orgId, provider);
    const now = Date.now();
    const ttl = ttlMs ?? this.defaultTtlMs;

    this.cache.set(cacheKey, {
      apiKey,
      expiresAt: now + ttl,
      orgId,
      provider,
    });
  }

  /**
   * Instant Invalidation Hook.
   * Purges cached secrets immediately when keys are rotated, revoked, or frozen in UI.
   */
  public invalidateSecret(orgId: string, provider?: string): void {
    if (provider) {
      const cacheKey = this.buildCacheKey(orgId, provider);
      this.cache.delete(cacheKey);
    } else {
      // Invalidate all providers for this organization
      const prefix = `${orgId}:`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }

  public setDbFetcher(fetcher: DatabaseSecretFetcher): void {
    this.dbFetcher = fetcher;
  }
}

// Global singleton resolver
export const secretResolver = new ScopedSecretResolver({ ttlSeconds: 60 });
