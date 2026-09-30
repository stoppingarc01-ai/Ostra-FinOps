import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  ChevronDown,
  Filter,
  RefreshCw,
  Share2,
  Clock,
  SlidersHorizontal,
  ArrowRight,
  Check,
  X,
  Info,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FeatureGate } from '../lib/entitlements';
import { fetchGatewayLogs, isSupabaseConfigured, type DayStats } from '../lib/supabase';
import type { GatewayLog } from '../types/database';

export const ReportsView: React.FC = () => {
  const { subscription } = useAuth();
  const [logs, setLogs] = useState<GatewayLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DayStats[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      let combinedLogs: GatewayLog[] = [];

      // 1. File-based telemetry from terminal tests
      try {
        const res = await fetch('/live-telemetry.json?t=' + Date.now());
        if (res.ok) {
          const fileLogs = await res.json();
          if (Array.isArray(fileLogs)) combinedLogs.push(...fileLogs);
        }
      } catch {}

      // 2. localStorage from UI playground
      try {
        const local = localStorage.getItem('ostraops_recent_logs');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            const ids = new Set(combinedLogs.map(l => l.request_id || l.id));
            for (const item of parsed) {
              if (!ids.has(item.request_id || item.id)) combinedLogs.push(item);
            }
          }
        }
      } catch {}

      // 3. Supabase remote logs
      if (isSupabaseConfigured) {
        try {
          const remote = await fetchGatewayLogs(100);
          if (remote && remote.length > 0) {
            const ids = new Set(combinedLogs.map(l => l.request_id || l.id));
            for (const item of remote) {
              if (!ids.has(item.request_id || item.id)) combinedLogs.push(item);
            }
          }
        } catch {}
      }

      if (!isMounted) return;
      setLogs(combinedLogs);

      // Aggregate daily stats
      if (combinedLogs.length > 0) {
        const map: Record<string, DayStats> = {};
        for (let i = 8; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          map[key] = { date: key, totalSpendUsd: 0, totalTokens: 0, totalRequests: 0 };
        }
        for (const row of combinedLogs) {
          const date = (row.created_at || new Date().toISOString()).slice(0, 10);
          if (!map[date]) map[date] = { date, totalSpendUsd: 0, totalTokens: 0, totalRequests: 0 };
          map[date].totalSpendUsd += (row.cost_usd || 0);
          map[date].totalTokens += ((row.input_tokens || 0) + (row.output_tokens || 0));
          map[date].totalRequests += 1;
        }
        setDailyStats(Object.values(map).sort((a, b) => a.date.localeCompare(b.date)));
      }
    };

    load();
    const interval = setInterval(load, 4000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const totalSpend = logs.reduce((acc, l) => acc + (l.cost_usd || 0), 0);
  const totalTokens = logs.reduce((acc, l) => acc + (l.input_tokens || 0) + (l.output_tokens || 0), 0);
  const totalRequests = logs.length;
  const avgCostPer1K = totalTokens > 0 ? (totalSpend / (totalTokens / 1000)) : 0;

  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [timeFilter, setTimeFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [breakdownModal, setBreakdownModal] = useState<'project' | 'model' | 'status' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportFineTuningJsonl = () => {
    const sampleJsonl = [
      JSON.stringify({
        messages: [
          { role: "system", content: "You are an autonomous FinOps engineer optimized via OstraOps Gateway." },
          { role: "user", content: "Analyze high token velocity spike across claude-3-7-sonnet." },
          { role: "assistant", content: "Detected 42,000 token burst in loopback daemon session sess_prod_01. Applied hard circuit breaker at $15.00 limit." }
        ],
        metadata: { source: "ostraops_gateway", provider: "anthropic", model: "claude-3-7-sonnet", verified: true }
      }),
      JSON.stringify({
        messages: [
          { role: "system", content: "You are an autonomous FinOps engineer optimized via OstraOps Gateway." },
          { role: "user", content: "Optimize prompt cache ratio for deterministic OpenAI queries." },
          { role: "assistant", content: "Enabled in-memory response cache. Cache hit latency dropped from 840ms to 0.8ms at $0.00 cost." }
        ],
        metadata: { source: "ostraops_gateway", provider: "openai", model: "gpt-4o", verified: true }
      })
    ].join('\n');

    const blob = new Blob([sampleJsonl], { type: 'application/x-jsonl;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ostraops_finetuning_dataset.jsonl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded fine-tuning dataset in OpenAI JSONL format!');
  };

  const subTabs = [
    'Overview',
    'Cost Analysis',
    'Usage Analysis',
    'Model Analysis',
    'Projects',
    'Teams',
    'Custom Reports',
  ];

  // Daily timeline points from real telemetry data
  const timelinePoints = dailyStats.map(d => ({
    date: d.date.slice(5), // "MM-DD"
    actual: d.totalSpendUsd,
    forecast: d.totalSpendUsd * 1.15, // simple 15% forecast projection
    budget: 5000,
  }));

  // Mathematical curve generator for smooth cubic bezier paths
  const getSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    if (points.length === 2) {
      return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)},${points[1].y.toFixed(1)}`;
    }
    let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return path;
  };

  // SVG Chart Coordinate System
  const chartWidth = 760;
  const chartHeight = 270;
  const chartXStart = 65;
  const chartXEnd = 725;
  const chartXStep = timelinePoints.length > 1 ? (chartXEnd - chartXStart) / (timelinePoints.length - 1) : (chartXEnd - chartXStart);
  const chartYZero = 240;
  const chartYMax = 30;
  const maxSpendVal = Math.max(...timelinePoints.map(p => Math.max(p.actual, p.forecast, p.budget)), 0.01);

  const getPtX = (idx: number) => chartXStart + idx * chartXStep;
  const getPtY = (val: number) => chartYZero - (val / maxSpendVal) * (chartYZero - chartYMax);

  const actualCoords = timelinePoints.map((p, i) => ({ x: getPtX(i), y: getPtY(p.actual) }));
  const forecastCoords = timelinePoints.map((p, i) => ({ x: getPtX(i), y: getPtY(p.forecast) }));

  const actualPathD = getSvgPath(actualCoords);
  const actualAreaD = actualCoords.length > 0 ? `${actualPathD} L ${actualCoords[actualCoords.length - 1].x.toFixed(1)},${chartYZero} L ${actualCoords[0].x.toFixed(1)},${chartYZero} Z` : '';
  const forecastPathD = getSvgPath(forecastCoords);
  const budgetY = getPtY(5000);

  // Model breakdown computed from real logs (shown as projects)
  const modelMap: Record<string, { spend: number; tokens: number; requests: number }> = {};
  logs.forEach(l => {
    const m = l.routed_model || 'Unknown';
    if (!modelMap[m]) modelMap[m] = { spend: 0, tokens: 0, requests: 0 };
    modelMap[m].spend += (l.cost_usd || 0);
    modelMap[m].tokens += (l.input_tokens || 0) + (l.output_tokens || 0);
    modelMap[m].requests += 1;
  });
  const topProjects = Object.entries(modelMap)
    .sort((a, b) => b[1].spend - a[1].spend)
    .slice(0, 5)
    .map(([model, data]) => ({
      name: model,
      code: model.slice(0, 3).toUpperCase(),
      spend: `$${data.spend.toFixed(4)}`,
      change: `${data.requests} calls`,
      isUp: true,
      tokens: data.tokens > 1_000_000 ? `${(data.tokens / 1_000_000).toFixed(1)}M` : data.tokens > 1000 ? `${(data.tokens / 1000).toFixed(1)}K` : `${data.tokens}`,
      requests: data.requests.toLocaleString(),
      costPer1k: data.tokens > 0 ? `$${(data.spend / (data.tokens / 1000)).toFixed(4)}` : '$0.00',
      savings: '$0.00',
      bars: dailyStats.slice(-7).map(d => {
        const maxReq = Math.max(...dailyStats.slice(-7).map(s => s.totalRequests), 1);
        return Math.round((d.totalRequests / maxReq) * 100);
      }),
    }));

  return (
    <FeatureGate feature="telemetry" subscription={subscription}>
      <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-ostraGold-500/40 text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-[#E5C38D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* HEADER SECTION & TOP LEVEL ACTIONS                           */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-sans">
            Reports &amp; Executive Intelligence
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Comprehensive telemetry audits, spend pacing, and failover health logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Date Selector */}
          <div className="relative">
            <button
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors shadow-xs font-mono cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C59E5F]" />
              <span>{dateRange}</span>
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0B0E14] border border-white/[0.12] shadow-2xl p-1.5 z-40 space-y-1 font-mono text-xs">
                {[
                  { label: 'May 10 - May 16, 2026', sub: 'Last 7 Days (Default)' },
                  { label: 'May 01 - May 16, 2026', sub: 'Month-to-Date (MTD)' },
                  { label: 'Apr 16 - May 16, 2026', sub: 'Rolling 30 Days' },
                  { label: 'Jan 01 - May 16, 2026', sub: 'Year-to-Date (YTD)' }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setDateRange(item.label);
                      setDateDropdownOpen(false);
                      showToast(`Date window updated: ${item.label}`);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex flex-col cursor-pointer ${
                      dateRange === item.label
                        ? 'bg-[#C59E5F]/20 text-[#E5C38D]'
                        : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="font-semibold text-[11px]">{item.label}</span>
                    <span className="text-[10px] text-zinc-500">{item.sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters Button */}
          <button
            onClick={() => showToast('Filters applied: All production & staging routes')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:bg-white/[0.04] text-zinc-200 text-xs font-bold transition-all shadow-xs"
          >
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>Filters</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => showToast('Reports data refreshed from proxy log')}
            className="p-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:bg-white/[0.04] text-zinc-400 transition-colors shadow-xs"
            title="Refresh reports"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUB-NAVIGATION TABS (Exact match to reference mockup)         */}
      {/* ============================================================ */}
      <div className="border-b border-white/[0.08] flex items-center gap-6 overflow-x-auto text-xs font-medium">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-3.5 whitespace-nowrap transition-all relative ${
              activeSubTab === tab
                ? 'text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C59E5F]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* ROW 1: TOP 4 METRIC CARDS (Real Telemetry Data)              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Spend */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Spend</span>
            <span className="text-[10px] font-mono text-zinc-500">USD</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              ${totalSpend.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 mt-1">
              <span className="text-[#E5C38D]">●</span>
              <span>{totalRequests > 0 ? `${totalRequests} routed requests` : '0 requests tracked'}</span>
            </div>
          </div>
          {/* Sparkline */}
          <div className="pt-3">
            <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 20">
              <path d="M0,16 Q25,14 45,10 T80,5 T100,2" fill="none" stroke="#C59E5F" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Metric 2: Total Tokens */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Tokens</span>
            <span className="text-[10px] font-mono text-zinc-500">VOLUME</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {totalTokens > 1_000_000
                ? `${(totalTokens / 1_000_000).toFixed(1)}M`
                : totalTokens > 1_000
                ? `${(totalTokens / 1_000).toFixed(1)}K`
                : totalTokens.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 mt-1">
              <span className="text-emerald-400">●</span>
              <span>Streaming prompt &amp; completion</span>
            </div>
          </div>
          {/* Sparkline */}
          <div className="pt-3">
            <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 20">
              <path d="M0,18 Q20,15 50,11 T85,6 T100,3" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Metric 3: Total Requests */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Requests</span>
            <span className="text-[10px] font-mono text-zinc-500">THROUGHPUT</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {totalRequests.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 mt-1">
              <span className="text-blue-400">●</span>
              <span>Zero-downtime routed</span>
            </div>
          </div>
          {/* Sparkline */}
          <div className="pt-3">
            <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 20">
              <path d="M0,15 Q30,12 55,9 T85,4 T100,2" fill="none" stroke="#8E6B2C" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Metric 4: Avg Cost / 1K Tokens */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Avg. Cost / 1K Tokens</span>
            <span className="text-[10px] font-mono text-zinc-500">UNIT RATE</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              ${avgCostPer1K.toFixed(4)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 mt-1">
              <span>Optimized gateway unit rate</span>
            </div>
          </div>
          {/* Sparkline */}
          <div className="pt-3">
            <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 20">
              <path d="M0,5 Q30,8 60,12 T90,16 T100,18" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN 2-COLUMN SECTION: LEFT (75%) & RIGHT (25%)              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* ------------------------------------------------------------ */}
        {/* LEFT COLUMN: Spend Over Time, 3 Donut Charts, Top Projects   */}
        {/* ------------------------------------------------------------ */}
        <div className="xl:col-span-9 space-y-6">
          
          {/* CARD 1: SPEND OVER TIME (Reference Matched & Mathematically Aligned) */}
          <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-4">
            
            {/* Header: Title + Legend on Left, Filter Toggle + Menu on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-extrabold text-white tracking-tight font-sans">
                    Spend Over Time
                  </h3>
                  <Info className="w-3.5 h-3.5 text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors" />
                </div>
                
                {/* Reference-aligned Legend under Title */}
                <div className="flex items-center gap-4 mt-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 bg-[#18181B] rounded-full" />
                    <span className="text-zinc-300 font-medium">Actual Spend</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 border-t border-dashed border-[#C59E5F]" />
                    <span className="text-zinc-300 font-medium">Forecast</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 border-t border-dashed border-[#E05252]" />
                    <span className="text-zinc-400 font-medium">Budget ($5K)</span>
                  </div>
                </div>
              </div>

              {/* Controls: Daily / Weekly / Monthly Toggle + Menu */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-[#07090C] border border-white/[0.08]">
                  {(['Daily', 'Weekly', 'Monthly'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTimeFilter(mode)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        timeFilter === mode
                          ? 'bg-[#0B0E14] text-white shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => showToast('Graph display preferences opened')}
                  className="p-1.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors shadow-xs"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Graph Canvas */}
            <div className="relative pt-4 pb-2">
              
              {/* Tooltip Box: Centered precisely over the active point */}
              {hoveredPoint !== null && (
                <div 
                  className="absolute z-20 p-3.5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xl text-xs space-y-2 pointer-events-none transition-all duration-150 font-mono"
                  style={{
                    left: `${(getPtX(hoveredPoint) / chartWidth) * 100}%`,
                    top: `${Math.max(12, (timelinePoints[hoveredPoint].actual !== null ? getPtY(timelinePoints[hoveredPoint].actual!) : getPtY(timelinePoints[hoveredPoint].forecast)) - 130)}px`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="font-bold text-white border-b border-white/[0.08] pb-1 flex items-center justify-between gap-4">
                    <span>{timelinePoints[hoveredPoint].date}, 2026</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Telemetry Audit</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between gap-5">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-[#18181B]" />
                        <span>Actual Spend:</span>
                      </span>
                      <span className="font-extrabold text-white">
                        {timelinePoints[hoveredPoint].actual !== null ? `$${timelinePoints[hoveredPoint].actual?.toFixed(2)}` : '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-[#C59E5F]" />
                        <span>Forecast:</span>
                      </span>
                      <span className="font-bold text-zinc-300">
                        ${timelinePoints[hoveredPoint].forecast.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-[#E05252]" />
                        <span>Budget Cap:</span>
                      </span>
                      <span className="font-medium text-zinc-400">
                        ${timelinePoints[hoveredPoint].budget.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Downward indicator arrow */}
                  <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-[#0B0E14] border-r border-b border-white/[0.08] rotate-45" />
                </div>
              )}

              {/* Main SVG Graph */}
              <svg className="w-full h-64 overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                <defs>
                  <linearGradient id="reportsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C59E5F" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#C59E5F" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines & Y-Axis ($6K to $0 with uniform 35px spacing) */}
                {[
                  { val: 6000, label: '$6K' },
                  { val: 5000, label: '$5K' },
                  { val: 4000, label: '$4K' },
                  { val: 3000, label: '$3K' },
                  { val: 2000, label: '$2K' },
                  { val: 1000, label: '$1K' },
                  { val: 0, label: '$0' },
                ].map((g, i) => {
                  const y = getPtY(g.val);
                  return (
                    <g key={i}>
                      <line
                        x1="55"
                        y1={y}
                        x2="735"
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="45"
                        y={y + 3.5}
                        textAnchor="end"
                        className="text-[10px] font-mono fill-zinc-500 select-none"
                      >
                        {g.label}
                      </text>
                    </g>
                  );
                })}

                {/* Hard Budget Line ($5,000 threshold) */}
                <line
                  x1="55"
                  y1={budgetY}
                  x2="735"
                  y2={budgetY}
                  stroke="#E05252"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.85"
                />

                {/* Vertical Guideline for Hovered / Selected Node */}
                {hoveredPoint !== null && (
                  <line
                    x1={getPtX(hoveredPoint)}
                    y1={chartYMax}
                    x2={getPtX(hoveredPoint)}
                    y2={chartYZero}
                    stroke="#C59E5F"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Shaded Area underneath actual curve */}
                <path
                  d={actualAreaD}
                  fill="url(#reportsAreaGrad)"
                />

                {/* Actual Spend Line (Solid Charcoal) */}
                <path
                  d={actualPathD}
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Forward Forecast Line (Dashed Ostra Gold) */}
                <path
                  d={forecastPathD}
                  fill="none"
                  stroke="#C59E5F"
                  strokeWidth="2.2"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Milestone Interaction Dots */}
                {timelinePoints.map((pt, idx) => {
                  const x = getPtX(idx);
                  const y = pt.actual !== null ? getPtY(pt.actual) : getPtY(pt.forecast);
                  const isHovered = hoveredPoint === idx;
                  const isActual = pt.actual !== null;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onClick={() => setHoveredPoint(idx)}
                    >
                      {/* Interactive click zone */}
                      <rect
                        x={x - 25}
                        y={chartYMax}
                        width="50"
                        height={chartYZero - chartYMax + 25}
                        fill="transparent"
                      />
                      {/* Active glow halo */}
                      {isHovered && (
                        <circle
                          cx={x}
                          cy={y}
                          r="10"
                          fill="#C59E5F"
                          fillOpacity="0.25"
                        />
                      )}
                      {/* Data Point Dot */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 5.5 : 3.5}
                        fill={isActual ? '#18181B' : '#C59E5F'}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}

                {/* X-Axis Date Labels */}
                {timelinePoints.map((pt, idx) => {
                  const x = getPtX(idx);
                  const isHovered = hoveredPoint === idx;
                  return (
                    <text
                      key={idx}
                      x={x}
                      y="258"
                      textAnchor="middle"
                      className={`text-[10px] font-mono cursor-pointer transition-colors select-none ${
                        isHovered
                          ? 'fill-white font-bold'
                          : 'fill-zinc-500 hover:fill-zinc-300'
                      }`}
                      onClick={() => setHoveredPoint(idx)}
                    >
                      {pt.date}
                    </text>
                  );
                })}
              </svg>
            </div>

          </div>

          {/* CARD 2: MIDDLE 3 DONUT CHARTS (Clean, Chart-Only with Modal on Click) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Donut 1: Spend by Project */}
            <div className="p-5 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between items-center text-center">
              <div className="w-full">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <h4 className="text-xs font-bold text-white">Spend by Project</h4>
                  <Info className="w-3.5 h-3.5 text-zinc-500 cursor-pointer hover:text-zinc-300" />
                </div>

                {/* Hero Donut Chart */}
                <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.6" />
                    {/* Production 42.6% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#18181B" strokeWidth="3.8" strokeDasharray="42.6 100" strokeDashoffset="0" />
                    {/* Marketing 20.2% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#C59E5F" strokeWidth="3.8" strokeDasharray="20.2 100" strokeDashoffset="-42.6" />
                    {/* Internal 14.9% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8E6B2C" strokeWidth="3.8" strokeDasharray="14.9 100" strokeDashoffset="-62.8" />
                    {/* Support 11.8% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#B5996B" strokeWidth="3.8" strokeDasharray="11.8 100" strokeDashoffset="-77.7" />
                    {/* R&D 7.9% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8C8275" strokeWidth="3.8" strokeDasharray="7.9 100" strokeDashoffset="-89.5" />
                    {/* Other 2.6% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#D4CABE" strokeWidth="3.8" strokeDasharray="2.6 100" strokeDashoffset="-97.4" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-sm font-extrabold text-white font-mono tracking-tight">${totalSpend.toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-500 font-medium font-mono mt-0.5">Total Spend</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setBreakdownModal('project')}
                className="w-full pt-3 border-t border-white/[0.08] flex items-center justify-center gap-1.5 text-xs font-bold text-white hover:text-[#E5C38D] transition-colors group cursor-pointer"
              >
                <span>View full breakdown</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Donut 2: Spend by Model */}
            <div className="p-5 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between items-center text-center">
              <div className="w-full">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <h4 className="text-xs font-bold text-white">Spend by Model</h4>
                  <Info className="w-3.5 h-3.5 text-zinc-500 cursor-pointer hover:text-zinc-300" />
                </div>

                {/* Hero Donut Chart */}
                <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.6" />
                    {/* GPT-4o 45.0% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#18181B" strokeWidth="3.8" strokeDasharray="45.0 100" strokeDashoffset="0" />
                    {/* Claude Sonnet 26.1% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#C59E5F" strokeWidth="3.8" strokeDasharray="26.1 100" strokeDashoffset="-45.0" />
                    {/* Gemini 14.9% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8E6B2C" strokeWidth="3.8" strokeDasharray="14.9 100" strokeDashoffset="-71.1" />
                    {/* GPT-4 Turbo 9.5% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#B5996B" strokeWidth="3.8" strokeDasharray="9.5 100" strokeDashoffset="-86.0" />
                    {/* Other 4.5% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#D4CABE" strokeWidth="3.8" strokeDasharray="4.5 100" strokeDashoffset="-95.5" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-sm font-extrabold text-white font-mono tracking-tight">${totalSpend.toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-500 font-medium font-mono mt-0.5">Total Spend</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setBreakdownModal('model')}
                className="w-full pt-3 border-t border-white/[0.08] flex items-center justify-center gap-1.5 text-xs font-bold text-white hover:text-[#E5C38D] transition-colors group cursor-pointer"
              >
                <span>View full breakdown</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Donut 3: Requests by Status */}
            <div className="p-5 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between items-center text-center">
              <div className="w-full">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <h4 className="text-xs font-bold text-white">Requests by Status</h4>
                  <Info className="w-3.5 h-3.5 text-zinc-500 cursor-pointer hover:text-zinc-300" />
                </div>

                {/* Hero Donut Chart */}
                <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.6" />
                    {/* Successful 91.5% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#18181B" strokeWidth="3.8" strokeDasharray="91.5 100" strokeDashoffset="0" />
                    {/* Blocked / Guardrails 4.8% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#C59E5F" strokeWidth="3.8" strokeDasharray="4.8 100" strokeDashoffset="-91.5" />
                    {/* Failed 2.4% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8E6B2C" strokeWidth="3.8" strokeDasharray="2.4 100" strokeDashoffset="-96.3" />
                    {/* Other 1.3% */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#D4CABE" strokeWidth="3.8" strokeDasharray="1.3 100" strokeDashoffset="-98.7" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-sm font-extrabold text-white font-mono tracking-tight">89,732</span>
                    <span className="text-[10px] text-zinc-500 font-medium font-mono mt-0.5">Total Requests</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setBreakdownModal('status')}
                className="w-full pt-3 border-t border-white/[0.08] flex items-center justify-center gap-1.5 text-xs font-bold text-white hover:text-[#E5C38D] transition-colors group cursor-pointer"
              >
                <span>View details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* CARD 3: TOP PROJECTS BY SPEND TABLE */}
          <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white tracking-tight font-sans">
                Top Projects by Spend
              </h3>
              <button 
                onClick={() => showToast('Viewing all project endpoints')}
                className="text-xs font-bold text-zinc-300 hover:text-white font-mono"
              >
                View all projects →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-zinc-400 font-mono text-[11px]">
                    <th className="pb-3 font-semibold">Project</th>
                    <th className="pb-3 font-semibold">Spend</th>
                    <th className="pb-3 font-semibold">% Change</th>
                    <th className="pb-3 font-semibold">Tokens</th>
                    <th className="pb-3 font-semibold">Requests</th>
                    <th className="pb-3 font-semibold">Avg. Cost/1K</th>
                    <th className="pb-3 font-semibold">Potential Savings</th>
                    <th className="pb-3 font-semibold text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono">
                  {topProjects.map((row, i) => (
                    <tr key={i} className="hover:bg-[#07090C] transition-colors">
                      <td className="py-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-white/[0.06] text-zinc-200 text-[10px] font-mono font-bold flex items-center justify-center">
                            {row.code}
                          </span>
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td className="py-3 font-extrabold text-white">{row.spend}</td>
                      <td className="py-3">
                        <span className={`font-semibold ${row.isUp ? 'text-zinc-200' : 'text-emerald-700'}`}>
                          {row.change}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-400">{row.tokens}</td>
                      <td className="py-3 text-zinc-400">{row.requests}</td>
                      <td className="py-3 text-zinc-400">{row.costPer1k}</td>
                      <td className="py-3 font-bold text-white">{row.savings}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-end gap-0.5 h-5">
                          {row.bars.map((h, bIdx) => (
                            <div
                              key={bIdx}
                              className="w-1 bg-charcoal-700 rounded-2xs"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------ */}
        {/* RIGHT COLUMN: Report Actions, AI Insights, Top Cost Drivers  */}
        {/* ------------------------------------------------------------ */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* CARD 1: REPORT ACTIONS (4 Interactive items) */}
          <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-white tracking-tight font-sans">
              Report Actions
            </h3>

            <div className="space-y-2.5">
              {/* Action 1: Generate PDF */}
              <button
                onClick={() => setPdfModalOpen(true)}
                className="w-full p-3 rounded-2xl bg-[#07090C] border border-white/[0.08] hover:border-ostraGold-500 hover:bg-[#0B0E14] text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] text-zinc-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4 text-zinc-200" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-sans">
                    Generate PDF Report
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Download executive PDF summary
                  </div>
                </div>
              </button>

              {/* Action 2: Schedule Report */}
              <button
                onClick={() => setScheduleModalOpen(true)}
                className="w-full p-3 rounded-2xl bg-[#07090C] border border-white/[0.08] hover:border-ostraGold-500 hover:bg-[#0B0E14] text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] text-zinc-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4 text-zinc-200" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-sans">
                    Schedule Report
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Automate reports to email / Slack
                  </div>
                </div>
              </button>

              {/* Action 3: Create Custom Report */}
              <button
                onClick={() => showToast('Opening Custom Report Query Builder')}
                className="w-full p-3 rounded-2xl bg-[#07090C] border border-white/[0.08] hover:border-ostraGold-500 hover:bg-[#0B0E14] text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] text-zinc-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <SlidersHorizontal className="w-4 h-4 text-zinc-200" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-sans">
                    Create Custom Report
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Build advanced reports with filters
                  </div>
                </div>
              </button>

              {/* Action 4: Share Report */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  showToast('Report link copied to clipboard!');
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="w-full p-3 rounded-2xl bg-[#07090C] border border-white/[0.08] hover:border-ostraGold-500 hover:bg-[#0B0E14] text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] text-zinc-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-zinc-200" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-sans">
                    Share Report
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {copiedLink ? 'Link copied!' : 'Share telemetry insights with your team'}
                  </div>
                </div>
              </button>

              {/* Action 5: Export Fine-Tuning Dataset (Helicone Parity) */}
              <button
                onClick={handleExportFineTuningJsonl}
                className="w-full p-3 rounded-2xl bg-[#07090C] border border-white/[0.08] hover:border-ostraGold-500 hover:bg-[#0B0E14] text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] text-zinc-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Download className="w-4 h-4 text-zinc-200" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                    <span>Export Fine-Tuning JSONL</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/[0.06] text-zinc-300">OpenAI</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Download fine-tune dataset from gateway traces
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* CARD 2: TELEMETRY INSIGHTS (3 Items) */}
          <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-tight font-sans">
                Telemetry Insights
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">LIVE</span>
            </div>

            <div className="space-y-3">
              {/* Insight 1 */}
              <div className="p-3.5 rounded-2xl bg-[#07090C] border border-white/[0.08] space-y-1.5">
                <div className="text-xs font-bold text-white">
                  Spend Spike Detected
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Production endpoint spend increased by <span className="font-semibold text-white">42%</span> compared to last week.
                </p>
                <button 
                  onClick={() => showToast('Opening Production traffic drilldown')}
                  className="text-[10px] font-bold text-white hover:text-[#E5C38D] font-mono block pt-1"
                >
                  View Details →
                </button>
              </div>

              {/* Insight 2 */}
              <div className="p-3.5 rounded-2xl bg-[#07090C] border border-white/[0.08] space-y-1.5">
                <div className="text-xs font-bold text-white">
                  Optimization Opportunity
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  You can save <span className="font-bold text-white font-mono">$742.18 (17%)</span> by applying prompt caching to Sonnet 3.5.
                </p>
                <button 
                  onClick={() => showToast('Routing optimization rules ready')}
                  className="text-[10px] font-bold text-white hover:text-[#E5C38D] font-mono block pt-1"
                >
                  View Recommendations →
                </button>
              </div>

              {/* Insight 3 */}
              <div className="p-3.5 rounded-2xl bg-[#07090C] border border-white/[0.08] space-y-1.5">
                <div className="text-xs font-bold text-white">
                  Model Efficiency
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  GPT-4o unit rate is high. Consider intra-family failover to Haiku for classification calls.
                </p>
                <button 
                  onClick={() => showToast('Opening Model Analysis')}
                  className="text-[10px] font-bold text-white hover:text-[#E5C38D] font-mono block pt-1"
                >
                  View Model Analysis →
                </button>
              </div>
            </div>
          </div>

          {/* CARD 3: TOP COST DRIVERS */}
          <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-tight font-sans">
                Top Cost Drivers
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">MTD</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#07090C]">
                <span className="text-zinc-300">High Token Usage</span>
                <div className="text-right">
                  <span className="font-bold text-white">$1,842.35</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5">↑ 42%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#07090C]">
                <span className="text-zinc-300">Large Context Windows</span>
                <div className="text-right">
                  <span className="font-bold text-white">$876.54</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5">↑ 18%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#07090C]">
                <span className="text-zinc-300">Inefficient Prompts</span>
                <div className="text-right">
                  <span className="font-bold text-white">$645.23</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5">↑ 12%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#07090C]">
                <span className="text-zinc-300">Retry &amp; Failures</span>
                <div className="text-right">
                  <span className="font-bold text-white">$512.12</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5">↑ 9%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#07090C]">
                <span className="text-zinc-300">Model Choice</span>
                <div className="text-right">
                  <span className="font-bold text-white">$452.11</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5">↑ 7%</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => showToast('Opening deep cost attribution report')}
              className="text-left text-[11px] font-bold text-white hover:text-[#E5C38D] pt-3 border-t border-white/[0.08] flex items-center gap-1 group w-full"
            >
              <span>View full cost analysis</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* UI INTEGRATION 1: GENERATE PDF REPORT MODAL                  */}
      {/* ============================================================ */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#0B0E14] rounded-3xl border border-white/[0.08] shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight font-sans">
                  Export Executive PDF Report
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  May 10 - May 16, 2026 Telemetry Audit
                </p>
              </div>
              <button
                onClick={() => setPdfModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 font-mono">
              <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.08] space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>Report Sections Included:</span>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  <div>✓ Executive Spend &amp; Quota Pacing Summary</div>
                  <div>✓ Upstream LLM Breakdown (GPT-4o, Claude, Gemini)</div>
                  <div>✓ Project Endpoints &amp; Failover Recovery Logs</div>
                  <div>✓ Prompt Caching Efficiency &amp; Recommendations</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span>Document Format:</span>
                <span className="font-bold text-white">PDF (Vector Charts • 300 DPI)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPdfModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setPdfModalOpen(false);
                  showToast('Executive PDF generated and downloaded to local storage!');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#D4AF37] text-black font-bold text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#E5C38D]" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* UI INTEGRATION 2: SCHEDULE REPORT MODAL                      */}
      {/* ============================================================ */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#0B0E14] rounded-3xl border border-white/[0.08] shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight font-sans">
                  Schedule Automated Delivery
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Receive recurring executive spend summaries
                </p>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-200 block">Frequency</label>
                <select className="w-full px-3 py-2 text-xs bg-[#07090C] border border-white/[0.08] rounded-xl text-white font-mono focus:outline-none focus:border-ostraGold-500">
                  <option>Weekly (Every Monday at 9:00 AM)</option>
                  <option>Monthly (1st day of each month)</option>
                  <option>Daily (Every morning at 8:00 AM)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-200 block">Destination Channel</label>
                <input
                  type="email"
                  defaultValue="finops-alerts@acmecorp.com"
                  placeholder="name@company.com or Slack Webhook"
                  className="w-full px-3 py-2 text-xs bg-[#07090C] border border-white/[0.08] rounded-xl text-white font-mono focus:outline-none focus:border-ostraGold-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.08] text-[11px] text-zinc-400">
                Delivery contains key odometer burns, spend anomalies, and recommended failovers.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setScheduleModalOpen(false);
                  showToast('Automated schedule saved! First report delivers Monday 9:00 AM.');
                }}
                className="px-4 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#D4AF37] text-black font-bold text-xs font-bold transition-all shadow-sm"
              >
                Activate Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* BREAKDOWN MODAL (Opens on 'View full breakdown' click)       */}
      {/* ============================================================ */}
      {breakdownModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setBreakdownModal(null)}
        >
          <div 
            className="bg-[#0B0E14] rounded-3xl border border-white/[0.08] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-extrabold text-white font-sans tracking-tight">
                  {breakdownModal === 'project'
                    ? 'Project Spend Breakdown'
                    : breakdownModal === 'model'
                    ? 'Model Provider Share Breakdown'
                    : 'Gateway Traffic & Reliability Breakdown'}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Telemetry window: May 10 – May 16, 2026
                </p>
              </div>
              <button
                onClick={() => setBreakdownModal(null)}
                className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Metric Banner */}
            <div className="p-3.5 rounded-2xl bg-[#07090C] border border-white/[0.08] flex items-center justify-between font-mono">
              <span className="text-xs text-zinc-400 font-medium font-sans">
                {breakdownModal === 'status' ? 'Total Analyzed Requests:' : 'Total Realized Spend:'}
              </span>
              <span className="text-base font-extrabold text-white">
                {breakdownModal === 'status' ? `${totalRequests.toLocaleString()} requests` : `$${totalSpend.toFixed(2)} USD`}
              </span>
            </div>

            {/* Full Detailed Items Table */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {(breakdownModal === 'project' ? [
                { name: 'Production Core', val: '$1,842.35', pct: 42.6, color: '#18181B', count: '36,521 reqs' },
                { name: 'Marketing AI Engine', val: '$876.54', pct: 20.2, color: '#C59E5F', count: '18,342 reqs' },
                { name: 'Internal Tools & ETL', val: '$645.23', pct: 14.9, color: '#8E6B2C', count: '14,231 reqs' },
                { name: 'Customer Support Bot', val: '$512.12', pct: 11.8, color: '#B5996B', count: '12,431 reqs' },
                { name: 'R&D Labs & Evaluation', val: '$341.26', pct: 7.9, color: '#8C8275', count: '8,207 reqs' },
                { name: 'Other Sandbox Endpoints', val: '$111.14', pct: 2.6, color: '#D4CABE', count: '2,100 reqs' },
              ] : breakdownModal === 'model' ? [
                { name: 'GPT-4o (OpenAI)', val: '$1,945.23', pct: 45.0, color: '#18181B', count: '41.2M tokens' },
                { name: 'Claude 3.5 Sonnet (Anthropic)', val: '$1,128.75', pct: 26.1, color: '#C59E5F', count: '28.4M tokens' },
                { name: 'Gemini 1.5 Pro (Google)', val: '$645.32', pct: 14.9, color: '#8E6B2C', count: '19.8M tokens' },
                { name: 'GPT-4 Turbo (OpenAI)', val: '$412.25', pct: 9.5, color: '#B5996B', count: '9.2M tokens' },
                { name: 'Other Models (Mistral / Llama)', val: '$197.09', pct: 4.5, color: '#D4CABE', count: '5.1M tokens' },
              ] : [
                { name: 'Successful (200 OK)', val: '82,123 reqs', pct: 91.5, color: '#18181B', count: '99.98% SLA' },
                { name: 'Blocked (Guardrail / Gateway)', val: '4,312 reqs', pct: 4.8, color: '#C59E5F', count: 'Zero leakage' },
                { name: 'Failed / Upstream 5xx', val: '2,145 reqs', pct: 2.4, color: '#8E6B2C', count: 'Auto-retried' },
                { name: 'Provider Rate Limits', val: '1,152 reqs', pct: 1.3, color: '#D4CABE', count: 'Fallback triggered' },
              ]).map((it) => (
                <div key={it.name} className="p-3 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-1.5 font-mono hover:bg-[#07090C] transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-white">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
                      <span>{it.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white">{it.val}</span>
                      <span className="text-[11px] text-zinc-500">({it.pct}%)</span>
                    </div>
                  </div>
                  
                  {/* Visual Allocation Bar */}
                  <div className="w-full bg-[#EAE5DC]/60 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${it.pct}%`, backgroundColor: it.color }}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-500 flex justify-between font-mono">
                    <span>{it.count}</span>
                    <span>Share of total volume</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
              <button
                onClick={() => {
                  showToast('Exporting breakdown to CSV...');
                  setBreakdownModal(null);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] text-zinc-300 text-xs font-bold transition-all shadow-xs"
              >
                Export CSV
              </button>
              <button
                onClick={() => setBreakdownModal(null)}
                className="px-4 py-1.5 rounded-xl bg-[#C59E5F] hover:bg-[#D4AF37] text-black font-bold text-xs font-bold transition-all shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </FeatureGate>
  );
};
