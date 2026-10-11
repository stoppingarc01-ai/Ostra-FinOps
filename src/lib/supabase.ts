import { createClient } from '@supabase/supabase-js';
import type { GatewayLog, VirtualKey } from '../types/database';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

let isCircuitOpen = false;
let nextCircuitProbeTime = 0;
const CIRCUIT_COOLDOWN_MS = 60_000; // 60s cooldown on DNS/network failure

export const isSupabaseConfigured: boolean = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('YOUR-PROJECT') &&
  !rawUrl.includes('placeholder') &&
  !rawKey.includes('your-') &&
  !rawKey.includes('placeholder')
);

export function isSupabaseAvailable(): boolean {
  if (!isSupabaseConfigured) return false;
  if (isCircuitOpen && Date.now() < nextCircuitProbeTime) return false;
  return true;
}

function tripCircuit(err?: any) {
  isCircuitOpen = true;
  nextCircuitProbeTime = Date.now() + CIRCUIT_COOLDOWN_MS;
  const msg = err?.message || String(err || '');
  if (
    msg.includes('Failed to fetch') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('NetworkError') ||
    msg.includes('ERR_NAME_NOT_RESOLVED') ||
    msg.includes('Load failed')
  ) {
    console.warn(`[Supabase] DNS/Network unreachable for ${rawUrl}. Circuit breaker active for 60s to prevent spamming.`);
  }
}

function closeCircuit() {
  isCircuitOpen = false;
  nextCircuitProbeTime = 0;
}

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface GatewayStats {
  totalSpendUsd: number;
  totalTokens: number;
  totalRequests: number;
  /** model -> cost_usd */
  byModel: Record<string, number>;
}

export interface DayStats {
  date: string;   // YYYY-MM-DD
  totalSpendUsd: number;
  totalTokens: number;
  totalRequests: number;
}

/**
 * Aggregate KPIs from gateway_logs over the last N days.
 * Returns null when Supabase is unconfigured or DNS is unreachable.
 */
export async function fetchGatewayStats(days = 7, orgId?: string): Promise<GatewayStats | null> {
  if (!isSupabaseAvailable()) return null;
  try {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    let query = supabase
      .from('gateway_logs')
      .select('cost_usd, input_tokens, output_tokens, routed_model')
      .gte('created_at', since);

    if (orgId) {
      query = query.eq('organization_id', orgId);
    }

    const { data, error } = await query;
    if (error || !data) {
      if (error) tripCircuit(error);
      return null;
    }
    closeCircuit();

    const byModel: Record<string, number> = {};
    let totalSpendUsd = 0;
    let totalTokens = 0;

    for (const row of data) {
      totalSpendUsd += row.cost_usd || 0;
      totalTokens += (row.input_tokens || 0) + (row.output_tokens || 0);
      if (row.routed_model) {
        byModel[row.routed_model] = (byModel[row.routed_model] || 0) + (row.cost_usd || 0);
      }
    }

    return { totalSpendUsd, totalTokens, totalRequests: data.length, byModel };
  } catch (err) {
    tripCircuit(err);
    return null;
  }
}

/**
 * Per-day spend/tokens/requests for chart rendering.
 * Returns empty array when Supabase is unconfigured or unavailable.
 */
export async function fetchGatewayStatsByDay(days = 7, orgId?: string): Promise<DayStats[]> {
  if (!isSupabaseAvailable()) return [];
  try {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    let query = supabase
      .from('gateway_logs')
      .select('cost_usd, input_tokens, output_tokens, created_at')
      .gte('created_at', since);

    if (orgId) {
      query = query.eq('organization_id', orgId);
    }

    const { data, error } = await query;
    if (error || !data) {
      if (error) tripCircuit(error);
      return [];
    }
    closeCircuit();

    const map: Record<string, DayStats> = {};
    for (const row of data) {
      const date = row.created_at.slice(0, 10);
      if (!map[date]) map[date] = { date, totalSpendUsd: 0, totalTokens: 0, totalRequests: 0 };
      map[date].totalSpendUsd += row.cost_usd || 0;
      map[date].totalTokens += (row.input_tokens || 0) + (row.output_tokens || 0);
      map[date].totalRequests += 1;
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  } catch (err) {
    tripCircuit(err);
    return [];
  }
}

/**
 * Fetch live gateway telemetry logs from Supabase scoped to organization
 */
export async function fetchGatewayLogs(limit = 50, orgId?: string): Promise<GatewayLog[]> {
  if (!isSupabaseAvailable()) return [];
  try {
    let query = supabase
      .from('gateway_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (orgId) {
      query = query.eq('organization_id', orgId);
    }

    const { data, error } = await query;
    if (error) {
      tripCircuit(error);
      return [];
    }
    closeCircuit();
    return (data as GatewayLog[]) || [];
  } catch (err) {
    tripCircuit(err);
    return [];
  }
}

/**
 * Fetch registered virtual keys from Supabase
 */
export async function fetchVirtualKeys(orgId?: string): Promise<VirtualKey[]> {
  if (!isSupabaseAvailable()) return [];
  try {
    let query = supabase.from('virtual_keys').select('*').order('created_at', { ascending: false });
    if (orgId) {
      query = query.eq('organization_id', orgId);
    }
    const { data, error } = await query;
    if (error) {
      tripCircuit(error);
      return [];
    }
    closeCircuit();
    return (data as VirtualKey[]) || [];
  } catch (err) {
    tripCircuit(err);
    return [];
  }
}

