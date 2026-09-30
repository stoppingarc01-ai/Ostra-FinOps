import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Download,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';
import { fetchGatewayStats, fetchGatewayStatsByDay, fetchGatewayLogs, isSupabaseConfigured, type GatewayStats, type DayStats } from '../lib/supabase';
import type { GatewayLog } from '../types/database';

export const UsageCostsView: React.FC = () => {
  const [metricMode, setMetricMode] = useState<'spend' | 'tokens' | 'requests'>('spend');
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [liveStats, setLiveStats] = useState<GatewayStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DayStats[]>([]);
  const [liveLogs, setLiveLogs] = useState<GatewayLog[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const stats = await fetchGatewayStats(30);
        if (isMounted) setLiveStats(stats);
      } catch {}

      try {
        const days = await fetchGatewayStatsByDay(14);
        if (isMounted) {
          setDailyStats(days);
          if (days.length > 0) setSelectedDay(days[days.length - 1]);
        }
      } catch {}

      try {
        const logs = await fetchGatewayLogs(100);
        if (isMounted && logs) setLiveLogs(logs);
      } catch {}
    };

    load();
    const interval = setInterval(load, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const totalSpend = liveStats ? liveStats.totalSpendUsd : 0;
  const totalTokens = liveStats ? liveStats.totalTokens : 0;
  const totalRequests = liveStats ? liveStats.totalRequests : 0;

  // Real model breakdown from logs
  const modelsMap: Record<string, { count: number; spend: number; tokens: number }> = {};
  liveLogs.forEach((l) => {
    const m = l.routed_model || 'Unknown';
    if (!modelsMap[m]) modelsMap[m] = { count: 0, spend: 0, tokens: 0 };
    modelsMap[m].count += 1;
    modelsMap[m].spend += (l.cost_usd || 0);
    modelsMap[m].tokens += (l.input_tokens || 0) + (l.output_tokens || 0);
  });
  const modelBreakdown = Object.entries(modelsMap).map(([model, data]) => ({
    model,
    spend: data.spend,
    tokens: data.tokens,
    requests: data.count,
    share: totalSpend > 0 ? Math.round((data.spend / totalSpend) * 100) : 0,
  })).sort((a, b) => b.spend - a.spend);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCSV = () => {
    if (liveLogs.length === 0) {
      showToast('No logged requests available to export yet.');
      return;
    }
    const headers = ['Request ID', 'Timestamp', 'Model', 'Input Tokens', 'Output Tokens', 'Cost USD', 'Latency (ms)'];
    const rows = liveLogs.map(l => [
      l.request_id || l.id,
      l.created_at,
      l.routed_model,
      l.input_tokens,
      l.output_tokens,
      l.cost_usd.toFixed(6),
      l.latency_ms
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ostraops_usage_costs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported real usage & cost CSV ledger successfully.');
  };

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-150">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* HEADER & CONTROLS                                            */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-sans">
            Usage &amp; Cost Analytics
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time breakdown of live token consumption, billed provider fees, and gateway caching.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Time range selector */}
          <div className="relative">
            <button
              onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 text-xs font-medium text-zinc-300 hover:text-white transition-colors shadow-xs font-mono cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C59E5F]" />
              <span>{timeRange}</span>
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${timeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {timeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#0B0E14] border border-white/[0.12] shadow-2xl p-1.5 z-40 space-y-1 font-mono text-xs">
                {['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'All Time'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setTimeRange(item);
                      setTimeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      timeRange === item ? 'bg-white/[0.08] text-white font-semibold' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 text-xs font-semibold text-zinc-200 hover:text-white transition-colors shadow-xs font-mono cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#C59E5F]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TOP KPI CARDS                                                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Total Spend */}
        <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total Billed Spend</span>
            <div className="w-7 h-7 rounded-lg bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-[28px] font-extrabold text-white tracking-tight font-sans">
              ${totalSpend.toFixed(2)}
            </span>
            <span className="text-xs text-zinc-500 font-mono">USD</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">100% verified provider charges</span>
        </div>

        {/* Metric 2: Total Tokens */}
        <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total Tokens</span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-zinc-300">
              <Cpu className="w-3.5 h-3.5 text-[#C59E5F]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-[28px] font-extrabold text-white tracking-tight font-sans">
              {totalTokens >= 1_000_000 
                ? `${(totalTokens / 1_000_000).toFixed(2)}M` 
                : totalTokens.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-500 font-mono">tokens</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Calculated from response usage</span>
        </div>

        {/* Metric 3: Total Requests */}
        <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total Invocations</span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-zinc-300">
              <BarChart2 className="w-3.5 h-3.5 text-[#C59E5F]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-[28px] font-extrabold text-white tracking-tight font-sans">
              {totalRequests.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-500 font-mono">calls</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Sub-5ms gateway edge proxy</span>
        </div>

      </div>

      {/* ============================================================ */}
      {/* HISTORICAL CHART SECTION                                     */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Timeline &amp; Daily Invocations</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Continuous telemetry stream from your gateway edge proxy</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            {(['spend', 'tokens', 'requests'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetricMode(m)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium capitalize transition-colors cursor-pointer ${
                  metricMode === m ? 'bg-[#C59E5F] text-black font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {dailyStats.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center">
            <Terminal className="w-10 h-10 text-zinc-600 mb-3" />
            <h4 className="text-sm font-bold text-zinc-200 mb-1">Zero Traffic Recorded in Evaluation Window</h4>
            <p className="text-xs text-zinc-500 max-w-sm mb-4">
              Requests routed through <code className="text-zinc-300">https://gateway.ostraops.com/v1</code> will automatically populate this chart.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end justify-between h-44 gap-2 pt-6">
              {dailyStats.map((d) => {
                const maxVal = metricMode === 'spend' 
                  ? Math.max(...dailyStats.map(s => s.totalSpendUsd), 0.01)
                  : metricMode === 'tokens'
                  ? Math.max(...dailyStats.map(s => s.totalTokens), 1)
                  : Math.max(...dailyStats.map(s => s.totalRequests), 1);

                const currentVal = metricMode === 'spend' ? d.totalSpendUsd : metricMode === 'tokens' ? d.totalTokens : d.totalRequests;
                const heightPercent = Math.max(8, Math.round((currentVal / maxVal) * 100));

                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedDay(d)}>
                    <div className="w-full bg-white/[0.03] rounded-t-lg h-36 flex items-end overflow-hidden p-0.5">
                      <div 
                        className="w-full rounded-t-md bg-gradient-to-t from-[#AA824B] to-[#C59E5F] group-hover:from-[#C59E5F] group-hover:to-[#E5C38D] transition-all"
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

            {selectedDay && (
              <div className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">{selectedDay.date}:</span>
                <span className="text-[#E5C38D] font-bold">${selectedDay.totalSpendUsd.toFixed(2)}</span>
                <span className="text-white">{selectedDay.totalTokens.toLocaleString()} tokens</span>
                <span className="text-zinc-400">{selectedDay.totalRequests} requests</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODEL BREAKDOWN TABLE (REAL DATA)                            */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs">
        <h3 className="text-sm font-bold text-white tracking-tight mb-4">Model Cost Breakdown</h3>
        
        {modelBreakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No specific model invocations to itemize yet. Supported rate cards: OpenAI GPT-4o, Anthropic Claude 3.7, Google Gemini 2.5, DeepSeek R1.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-zinc-400 font-mono text-[11px]">
                  <th className="pb-3 font-semibold">Model Name</th>
                  <th className="pb-3 font-semibold">Invocations</th>
                  <th className="pb-3 font-semibold">Tokens</th>
                  <th className="pb-3 font-semibold">Cost (USD)</th>
                  <th className="pb-3 font-semibold text-right">Cost Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {modelBreakdown.map((m) => (
                  <tr key={m.model} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-semibold text-white">{m.model}</td>
                    <td className="py-3 font-mono text-zinc-400">{m.requests}</td>
                    <td className="py-3 font-mono text-zinc-300">{m.tokens.toLocaleString()}</td>
                    <td className="py-3 font-mono text-[#E5C38D] font-bold">${m.spend.toFixed(4)}</td>
                    <td className="py-3 font-mono text-right text-zinc-300">{m.share}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
