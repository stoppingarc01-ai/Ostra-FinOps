export interface CachedSecret {
  apiKey: string;
  expiresAt: number;
  orgId: string;
  provider: string;
}

export type DatabaseSecretFetcher = (
  orgId: string,
  provider: string
) => Promise<string | null>;

export interface ISecretResolver {
  resolveProviderKey(orgId: string, provider: string): Promise<string | null>;
  invalidateSecret(orgId: string, provider?: string): void;
  clear(): void;
  size(): number;
}
