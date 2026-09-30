import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Cpu, 
  Zap, 
  Activity, 
  ChevronDown, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Terminal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPlanEntitlements } from '../lib/entitlements';
import { fetchGatewayLogs, isSupabaseConfigured, type DayStats } from '../lib/supabase';
import { fetchUserAlerts } from '../lib/alertsService';
import type { GatewayLog, SystemAlert } from '../types/database';

interface OverviewViewProps {
  onNavigateToUsage?: () => void;
  onNavigateToModels?: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToBudgets?: () => void;
  onNavigateToBilling?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateToUsage,
  onNavigateToModels,
  onNavigateToAlerts,
  onNavigateToBudgets,
  onNavigateToBilling,
}) => {
  const { user, subscription } = useAuth();
  const entitlements = getPlanEntitlements(subscription);

  const [timeframe, setTimeframe] = useState('Last 7 days');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  // Live Telemetry Data
  const [liveLogs, setLiveLogs] = useState<GatewayLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DayStats[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadRealData = async () => {
      let combinedLogs: GatewayLog[] = [];

      // 1. Check local file telemetry (/live-telemetry.json from terminal tests)
      try {
        const res = await fetch('/live-telemetry.json?t=' + Date.now());
        if (res.ok) {
          const fileLogs = await res.json();
          if (Array.isArray(fileLogs)) {
            combinedLogs.push(...fileLogs);
          }
        }
      } catch {}

      // 2. Check localStorage (ostraops_recent_logs from UI playground)
      try {
        const local = localStorage.getItem('ostraops_recent_logs');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            const existingIds = new Set(combinedLogs.map(l => l.request_id || l.id));
            for (const item of parsed) {
              if (!existingIds.has(item.request_id || item.id)) {
                combinedLogs.push(item);
              }
            }
          }
        }
      } catch {}

      // 3. Check Supabase Telemetry Logs
      if (isSupabaseConfigured) {
        try {
          const remoteLogs = await fetchGatewayLogs(100);
          if (remoteLogs && remoteLogs.length > 0) {
            const existingIds = new Set(combinedLogs.map(l => l.request_id || l.id));
            for (const item of remoteLogs) {
              if (!existingIds.has(item.request_id || item.id)) {
                combinedLogs.push(item);
              }
            }
          }
        } catch {}
      }

      if (isMounted) {
        setLiveLogs(combinedLogs);
        if (combinedLogs.length > 0) {
          setIsLiveConnected(true);

          // Group by day for the chart (initialize 7 days)
          const map: Record<string, DayStats> = {};
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            map[key] = { date: key, totalSpendUsd: 0, totalTokens: 0, totalRequests: 0 };
          }

          for (const row of combinedLogs) {
            const date = (row.created_at || new Date().toISOString()).slice(0, 10);
            if (!map[date]) {
              map[date] = { date, totalSpendUsd: 0, totalTokens: 0, totalRequests: 0 };
            }
            map[date].totalSpendUsd += (row.cost_usd || 0);
            map[date].totalTokens += ((row.input_tokens || 0) + (row.output_tokens || 0));
            map[date].totalRequests += 1;
          }
          const sorted = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
          setDailyStats(sorted);
        }
      }

      // 4. Load Real User Alerts
      if (user?.uid) {
        try {
          const userAlerts = await fetchUserAlerts(user.uid);
          if (isMounted) setAlerts(userAlerts);
        } catch {}
      }
    };

    loadRealData();
    const interval = setInterval(loadRealData, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.uid]);

  // Compute live spend / tokens / requests strictly from real logs
  const totalSpend = liveLogs.reduce((acc, l) => acc + (l.cost_usd || 0), 0);
  const totalTokens = liveLogs.reduce((acc, l) => acc + (l.input_tokens || 0) + (l.output_tokens || 0), 0);
  const totalRequests = liveLogs.length;

  // Compute unique models used
  const modelsMap: Record<string, { count: number; spend: number }> = {};
  liveLogs.forEach((l) => {
    const m = l.routed_model || 'Unknown';
    if (!modelsMap[m]) modelsMap[m] = { count: 0, spend: 0 };
    modelsMap[m].count += 1;
    modelsMap[m].spend += (l.cost_usd || 0);
  });
  const modelEntries = Object.entries(modelsMap).sort((a, b) => b[1].spend - a[1].spend);
  const uniqueModelsCount = modelEntries.length;

  const timeOptions = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'All time'];

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-200">
      
      {/* ============================================================ */}
      {/* 1. PLAN ENTITLEMENTS STATUS & UPGRADE BANNER                 */}
      {/* ============================================================ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0B0E14] via-[#11141A] to-[#0B0E14] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D] shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Current Workspace Plan</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#C59E5F]/20 text-[#E5C38D] font-bold border border-[#C59E5F]/30">
                {entitlements.name}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {entitlements.tier === 'free' 
                ? 'Community Free tier active. CLI usage enabled. Upgrade for hosted gateway edge proxy and budget guardrails.'
                : entitlements.tier === 'telemetry_observer'
                ? 'Agent Telemetry active. Up to 3 agent trackers, live token velocity, and webhook alerts unlocked.'
                : entitlements.tier === 'starter_gateway'
                ? 'Starter Gateway active. Edge proxy, budget caps (5 agents), and smart caching unlocked.'
                : 'Pro Gateway active. Unlimited agents, semantic cache, fallback failover, and developer seats unlocked.'
              }
            </p>
          </div>
        </div>

        {entitlements.tier === 'free' && onNavigateToBilling && (
          <button
            onClick={onNavigateToBilling}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#AA824B] hover:from-[#D4AF7C] hover:to-[#C59E5F] text-black font-semibold text-xs transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade to Starter ($35/mo)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. HEADER: TITLE + TIMEFRAME SELECTOR                        */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Real-time live telemetry and operational spend metrics
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* Live Gateway Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#0B0E14] text-xs font-mono shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]' : 'bg-zinc-600'}`} />
            <span className="text-zinc-300 font-medium">
              {isLiveConnected ? 'Hosted Gateway Active' : 'Gateway Ready (0 req)'}
            </span>
          </div>

          {/* Timeframe Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#0B0E14] text-xs font-semibold text-zinc-200 shadow-xs hover:border-white/[0.2] transition-colors cursor-pointer"
            >
              <span>{timeframe}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                {timeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setTimeframe(opt);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      timeframe === opt
                        ? 'bg-white/[0.06] text-white font-bold'
                        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <span>{opt}</span>
                    {timeframe === opt && <Check className="w-3.5 h-3.5 text-zinc-200" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ROW: 4 REAL METRIC CARDS                                  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Spend */}
        <div 
          onClick={onNavigateToUsage}
          className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total Live Spend</span>
            <div className="w-7 h-7 rounded-lg bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight font-sans">
              ${totalSpend.toFixed(2)}
            </span>
            <span className="text-xs text-zinc-500 font-medium">USD</span>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 font-medium">
              <span>{totalRequests > 0 ? `${totalRequests} billed requests` : 'No charges incurred'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tokens Used */}
        <div 
          onClick={onNavigateToUsage}
          className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Tokens Streamed</span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-zinc-300">
              <Cpu className="w-3.5 h-3.5 text-[#C59E5F]" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight font-sans">
              {totalTokens >= 1_000_000 
                ? `${(totalTokens / 1_000_000).toFixed(2)}M` 
                : totalTokens >= 1000 
                ? `${(totalTokens / 1000).toFixed(1)}K` 
                : totalTokens.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-500 font-medium">tokens</span>
          </div>

          <div className="mt-3 text-[11px] text-zinc-500 font-mono">
            <span>Input &amp; Output combined</span>
          </div>
        </div>

        {/* Card 3: Active Models */}
        <div 
          onClick={onNavigateToModels}
          className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Active Models</span>
            <div className="w-7 h-7 rounded-lg bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D]">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-1">
            <span className="text-xl sm:text-[22px] font-extrabold text-white tracking-tight block truncate">
              {uniqueModelsCount > 0 ? `${uniqueModelsCount} Active` : '0 Active'}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-zinc-500 font-mono">
              {uniqueModelsCount > 0 ? modelEntries[0][0] : '40+ supported models'}
            </span>
          </div>
        </div>

        {/* Card 4: Total Requests */}
        <div 
          onClick={onNavigateToUsage}
          className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total Invocations</span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-zinc-300">
              <Activity className="w-3.5 h-3.5 text-[#C59E5F]" />
            </div>
          </div>

          <div className="my-1">
            <span className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight font-sans">
              {totalRequests.toLocaleString()}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-zinc-500 font-mono">
              {totalRequests > 0 ? '100% routed through gateway' : 'Awaiting first request'}
            </span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. ROW 2: SPEND TREND (WIDE) + TOP MODELS (REAL DATA)        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Spend Trend Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white tracking-tight">Spend Velocity &amp; History</h3>
            <span className="text-xs font-mono text-zinc-500 font-medium">USD ($)</span>
          </div>

          {dailyStats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 mb-3">
                <Terminal className="w-6 h-6 text-[#C59E5F]" />
              </div>
              <h4 className="text-sm font-bold text-zinc-200 mb-1">No API Requests Recorded Yet</h4>
              <p className="text-xs text-zinc-500 max-w-sm mb-4">
                Point your OpenAI SDK, LangChain, or Cursor <code className="text-zinc-300 bg-white/[0.06] px-1 py-0.5 rounded">baseURL</code> to the gateway to start seeing real-time spend analytics.
              </p>
              <div className="bg-[#07090C] border border-white/[0.08] rounded-xl p-3 text-left w-full max-w-md font-mono text-xs text-zinc-300">
                <span className="text-zinc-500"># Route your agent through OstraOps</span><br />
                <span className="text-[#C59E5F]">baseURL</span>: 'https://gateway.ostraops.com/v1'
              </div>
            </div>
          ) : (
            <div className="relative h-48 w-full pt-3">
              {/* Dynamic Bars for days with data */}
              <div className="flex items-end justify-between h-36 gap-2 px-2 pt-4">
                {dailyStats.map((d, index) => {
                  const maxSpend = Math.max(...dailyStats.map(s => s.totalSpendUsd), 0.01);
                  const heightPercent = Math.max(12, Math.round((d.totalSpendUsd / maxSpend) * 100));
                  const isSelected = selectedDayIndex === index;

                  return (
                    <div 
                      key={d.date} 
                      onClick={() => setSelectedDayIndex(index)}
                      className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
                    >
                      <div className="w-full bg-white/[0.04] rounded-t-lg h-28 flex items-end overflow-hidden p-0.5">
                        <div 
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            isSelected 
                              ? 'bg-[#E5C38D]' 
                              : 'bg-gradient-to-t from-[#AA824B] to-[#C59E5F] group-hover:from-[#C59E5F] group-hover:to-[#E5C38D]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedDayIndex !== null && dailyStats[selectedDayIndex] && (
                <div className="mt-3 p-2.5 rounded-xl bg-[#07090C] border border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">
                    {dailyStats[selectedDayIndex].date}:
                  </span>
                  <div className="flex items-center gap-4 text-[11px] font-mono">
                    <span>Spend: <strong className="text-[#E5C38D]">${dailyStats[selectedDayIndex].totalSpendUsd.toFixed(2)}</strong></span>
                    <span>Tokens: <strong className="text-white">{dailyStats[selectedDayIndex].totalTokens.toLocaleString()}</strong></span>
                    <span>Requests: <strong className="text-white">{dailyStats[selectedDayIndex].totalRequests}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top Models by Cost */}
        <div 
          onClick={onNavigateToModels}
          className="lg:col-span-5 p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between cursor-pointer group hover:shadow-md transition-all min-h-[300px]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white tracking-tight">Models by Cost Share</h3>
              <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">Catalog →</span>
            </div>

            {modelEntries.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center">
                <Zap className="w-8 h-8 text-zinc-600 mb-2" />
                <span>No model calls recorded yet.</span>
                <span className="text-zinc-400 mt-1">Rates pre-loaded for GPT-4o, Claude 3.7, DeepSeek R1 &amp; Gemini 2.5</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {modelEntries.slice(0, 4).map(([modelName, data]) => {
                  const share = totalSpend > 0 ? Math.round((data.spend / totalSpend) * 100) : 0;
                  return (
                    <div key={modelName}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-zinc-200">{modelName}</span>
                        <span className="text-white font-mono">${data.spend.toFixed(2)} ({share}%)</span>
                      </div>
                      <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#C59E5F] h-full rounded-full" style={{ width: `${Math.max(5, share)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.08] text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Multi-provider routing active</span>
            <span className="font-semibold text-emerald-400">Zero prompt retention</span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 5. ROW 3: RECENT REAL ALERTS                                 */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-white tracking-tight">Active System Alerts</h3>
          <div className="flex items-center gap-3">
            {onNavigateToBudgets && (
              <button 
                onClick={onNavigateToBudgets}
                className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Budgets &amp; Limits →
              </button>
            )}
            <button 
              onClick={onNavigateToAlerts}
              className="text-xs text-[#E5C38D] hover:text-[#D4AF7C] transition-colors cursor-pointer"
            >
              Manage Alert Rules →
            </button>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500 flex flex-col items-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/80 mb-2" />
            <span className="text-zinc-300 font-medium">All systems operating within safe limits.</span>
            <span className="text-zinc-500 mt-0.5">No rate-limit spikes or budget limit triggers active.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.slice(0, 3).map((a) => (
              <div 
                key={a.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#07090C] border border-white/[0.08] hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-snug">{a.title}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {a.service} • {new Date(a.created_at || a.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(`${a.title}: ${a.description}`)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white/[0.06] border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0B0E14] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-white text-sm">Alert Event</h4>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.04] p-3 rounded-xl font-mono">
              {selectedAlert}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-xl bg-[#C59E5F] text-black font-bold text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. ROW 4: RECENT REAL GATEWAY INVOCATIONS & ACTIONS          */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold text-[#C59E5F] tracking-wider">
                Live Gateway Activity
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{liveLogs.length} Actions Tracked</span>
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              Recent API Invocations & Token Actions
            </h3>
          </div>

          {onNavigateToUsage && (
            <button
              onClick={onNavigateToUsage}
              className="text-xs text-[#E5C38D] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>View Full Usage Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {liveLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center">
            <Activity className="w-8 h-8 text-zinc-600 mb-2" />
            <span className="text-zinc-300 font-medium">No API invocations recorded yet.</span>
            <span className="text-zinc-500 mt-0.5">Run a prompt from the Test Playground or Terminal to stream live telemetry here.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Model &amp; Provider</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Tokens (In / Out)</th>
                  <th className="pb-3 font-semibold">Latency</th>
                  <th className="pb-3 font-semibold">Calculated Cost</th>
                  <th className="pb-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {liveLogs.slice(0, 10).map((log) => {
                  const totalTok = (log.input_tokens || 0) + (log.output_tokens || 0);
                  const isOk = (log.status_code || 200) < 400;
                  return (
                    <tr key={log.id || log.request_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C59E5F]" />
                          <div>
                            <span className="font-bold text-white block">{log.routed_model || log.requested_model}</span>
                            <span className="text-[10px] text-zinc-500">{log.provider || 'Gateway Proxy'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOk ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          HTTP {log.status_code || 200}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-300">
                        <span className="font-semibold text-white">{totalTok}</span>
                        <span className="text-[10px] text-zinc-500 block">
                          {log.input_tokens || 0} in • {log.output_tokens || 0} out
                        </span>
                      </td>
                      <td className="py-3 text-zinc-300 font-semibold">
                        {log.latency_ms || 240}ms
                      </td>
                      <td className="py-3 text-[#E5C38D] font-bold">
                        ${(log.cost_usd || 0.00001).toFixed(6)}
                      </td>
                      <td className="py-3 text-right text-zinc-500 text-[11px]">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
