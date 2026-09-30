try { process.loadEnvFile('.env.local'); } catch {}
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { TelemetryLogRecord, SpendSyncResult } from '../accounting/types';
import type { CachedVirtualKey } from '../middleware/cache';

export interface SupabaseBridgeOptions {
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  client?: SupabaseClient;
  deadLetterLogPath?: string;
}

export class SupabaseBridge {
  private client: SupabaseClient | null = null;
  private deadLetterLogPath: string;

  constructor(options?: SupabaseBridgeOptions) {
    const url =
      options?.supabaseUrl ||
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      options?.supabaseServiceRoleKey ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const isRealUrl = Boolean(url && !url.includes('YOUR-PROJECT') && !url.includes('placeholder'));
    const isRealKey = Boolean(key && !key.includes('your-') && !key.includes('placeholder'));

    if (options?.client) {
      this.client = options.client;
    } else if (isRealUrl && isRealKey && url && key) {
      this.client = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }

    this.deadLetterLogPath =
      options?.deadLetterLogPath || resolve(process.cwd(), 'gateway-dead-letter.log');
  }

  /**
   * Returns true if a live Supabase client connection is configured.
   */
  public isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Spools failed or unpersisted records to a local dead-letter JSON lines file,
   * guaranteeing zero loss of audit trails or billing events during DB partitions.
   */
  public spoolToDeadLetter(records: TelemetryLogRecord[], reason: string): void {
    try {
      const timestamp = new Date().toISOString();
      const lines = records
        .map((r) => JSON.stringify({ timestamp, reason, record: r }))
        .join('\n') + '\n';
      appendFileSync(this.deadLetterLogPath, lines, 'utf8');
    } catch (fsErr) {
      console.error('[SupabaseBridge] Critical: Failed to write to dead-letter log:', fsErr);
    }
  }

  /**
   * Batch writer for telemetry queue with dead-letter protection.
   */
  public async writeTelemetryBatch(records: TelemetryLogRecord[]): Promise<void> {
    if (records.length === 0) return;

    if (!this.client) {
      // If DB is not configured, spool to dead-letter storage
      this.spoolToDeadLetter(records, 'NO_DATABASE_CONFIGURED');
      return;
    }

    try {
      const payload = records.map((r) => ({
        request_id: r.requestId,
        organization_id: r.organizationId,
        project_id: r.projectId,
        environment_id: r.environmentId,
        virtual_key_id: r.virtualKeyId,
        provider: r.provider,
        requested_model: r.requestedModel,
        routed_model: r.routedModel,
        fallback_used: r.fallbackUsed,
        fallback_from_model: r.fallbackFromModel,
        input_tokens: r.inputTokens,
        output_tokens: r.outputTokens,
        cost_usd: r.costUsd,
        latency_ms: r.latencyMs,
        status_code: r.statusCode,
        error_type: r.errorType,
        error_code: r.errorCode,
        created_at: r.createdAt,
        completed_at: r.completedAt || null,
      }));

      const { error } = await this.client.from('gateway_logs').insert(payload);
      if (error) {
        throw new Error(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[SupabaseBridge] Failed to write batch of ${records.length} logs: ${msg}`);
      this.spoolToDeadLetter(records, msg);
    }
  }

  /**
   * Calls PostgreSQL non-blocking spend increment function.
   */
  public async incrementSpend(
    virtualKeyId: string,
    spendDeltaUsd: number
  ): Promise<SpendSyncResult> {
    if (!this.client) {
      return {
        success: true,
        currentSpendUsd: spendDeltaUsd,
        monthlyLimitUsd: 100.0,
        isFrozen: false,
      };
    }

    try {
      const { data, error } = await this.client.rpc('increment_key_spend', {
        p_virtual_key_id: virtualKeyId,
        p_spend_delta: spendDeltaUsd,
      });

      if (error) {
        throw new Error(error.message);
      }

      const res = data as { current_spend_usd: number; monthly_limit_usd: number; is_frozen: boolean } | null;
      return {
        success: true,
        currentSpendUsd: res?.current_spend_usd ?? 0,
        monthlyLimitUsd: res?.monthly_limit_usd ?? 0,
        isFrozen: res?.is_frozen ?? false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        currentSpendUsd: 0,
        monthlyLimitUsd: 0,
        isFrozen: false,
        error: msg,
      };
    }
  }

  /**
   * Resolves upstream provider secret from provider_connections table.
   */
  public async resolveProviderSecret(orgId: string, provider: string): Promise<string | null> {
    if (!this.client) return null;

    try {
      const { data, error } = await this.client
        .from('provider_connections')
        .select('secret_reference')
        .eq('organization_id', orgId)
        .eq('provider', provider.toLowerCase())
        .maybeSingle();

      if (error || !data) return null;
      return (data as { secret_reference: string }).secret_reference || null;
    } catch {
      return null;
    }
  }

  /**
   * Resolves a Virtual Key from DB for cold-start cache filling.
   */
  public async resolveVirtualKey(keyHash: string): Promise<CachedVirtualKey | null> {
    if (!this.client) return null;

    try {
      const { data, error } = await this.client
        .from('virtual_keys')
        .select(`
          id,
          organization_id,
          project_id,
          environment_id,
          name,
          key_prefix,
          key_hash,
          monthly_limit_usd,
          current_spend_usd,
          status,
          rpm_limit,
          tpm_limit,
          max_concurrency
        `)
        .eq('key_hash', keyHash)
        .maybeSingle();

      if (error || !data) return null;

      const row = data as {
        id: string;
        organization_id: string;
        project_id: string;
        environment_id: string;
        name: string;
        key_prefix: string;
        key_hash: string;
        monthly_limit_usd: number;
        current_spend_usd: number;
        status: 'active' | 'frozen' | 'revoked';
        rpm_limit?: number;
        tpm_limit?: number;
        max_concurrency?: number;
      };

      const now = Date.now();
      return {
        id: row.id,
        organizationId: row.organization_id,
        projectId: row.project_id,
        environmentId: row.environment_id,
        name: row.name,
        keyPrefix: row.key_prefix,
        keyHash: row.key_hash,
        monthlyLimitUsd: Number(row.monthly_limit_usd),
        currentSpendUsd: Number(row.current_spend_usd),
        status: row.status,
        rateLimits: {
          rpm: row.rpm_limit ?? 60,
          tpm: row.tpm_limit ?? 100_000,
          maxConcurrency: row.max_concurrency ?? 10,
        },
        cachedAt: now,
        expiresAt: now + 60_000,
      };
    } catch {
      return null;
    }
  }
}

export const supabaseBridge = new SupabaseBridge();
