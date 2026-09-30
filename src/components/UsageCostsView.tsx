import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Download,
  TrendingUp,
  BarChart2,
  TrendingDown,
  LineChart,
  PieChart,
  CheckCircle2
} from 'lucide-react';
import { fetchGatewayStats, isSupabaseConfigured, type GatewayStats } from '../lib/supabase';

interface DailySpend {
  date: string;
  dayLabel: string;
  gpt4o: number;
  claudeSonnet: number;
  geminiPro: number;
  miniHaiku: number;
  total: number;
  forecast?: boolean;
}

const DAILY_DATA: DailySpend[] = [
  { date: '2026-05-10', dayLabel: 'May 10', gpt4o: 310.20, claudeSonnet: 180.50, geminiPro: 52.10, miniHaiku: 22.40, total: 565.20 },
  { date: '2026-05-11', dayLabel: 'May 11', gpt4o: 345.10, claudeSonnet: 195.20, geminiPro: 58.40, miniHaiku: 25.10, total: 623.80 },
  { date: '2026-05-12', dayLabel: 'May 12', gpt4o: 380.40, claudeSonnet: 210.00, geminiPro: 64.20, miniHaiku: 28.30, total: 682.90 },
  { date: '2026-05-13', dayLabel: 'May 13', gpt4o: 360.50, claudeSonnet: 190.10, geminiPro: 61.00, miniHaiku: 26.50, total: 638.10 },
  { date: '2026-05-14', dayLabel: 'May 14', gpt4o: 395.80, claudeSonnet: 225.40, geminiPro: 70.30, miniHaiku: 30.20, total: 721.70 },
  { date: '2026-05-15', dayLabel: 'May 15', gpt4o: 410.20, claudeSonnet: 240.60, geminiPro: 74.50, miniHaiku: 32.10, total: 757.40 },
  { date: '2026-05-16', dayLabel: 'May 16', gpt4o: 248.01, claudeSonnet: 60.00,  geminiPro: 31.82, miniHaiku: 0.00,   total: 339.83 },
  // Projected remaining days of month
  { date: '2026-05-17', dayLabel: 'May 17 (Est)', gpt4o: 280.00, claudeSonnet: 150.00, geminiPro: 45.00, miniHaiku: 25.00, total: 500.00, forecast: true },
  { date: '2026-05-18', dayLabel: 'May 18 (Est)', gpt4o: 310.00, claudeSonnet: 165.00, geminiPro: 50.00, miniHaiku: 28.00, total: 553.00, forecast: true },
];

export const UsageCostsView: React.FC = () => {
  const [metricMode, setMetricMode] = useState<'spend' | 'tokens' | 'requests'>('spend');
  const [timeRange, setTimeRange] = useState('Month to Date (May 2026)');
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DailySpend | null>(DAILY_DATA[5]);
  const [liveStats, setLiveStats] = useState<GatewayStats | null>(null);

  // Fetch live aggregated KPIs from Supabase gateway_logs
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchGatewayStats(30).then(setLiveStats).catch(() => {});
  }, []);

  // Derived display values: use live data when available, fall back to demo
  const displaySpend = liveStats ? `$${liveStats.totalSpendUsd.toFixed(2)}` : '$4,328.64';
  const displayTokens = liveStats
    ? liveStats.totalTokens >= 1_000_000
      ? `${(liveStats.totalTokens / 1_000_000).toFixed(1)}M`
      : `${(liveStats.totalTokens / 1000).toFixed(1)}K`
    : '312.6M';
  const isLive = liveStats !== null;


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Day', 'GPT-4o ($)', 'Claude Sonnet ($)', 'Gemini Pro ($)', 'Mini/Haiku ($)', 'Total ($)', 'Status'];
    const rows = DAILY_DATA.map(d => [
      d.date,
      d.dayLabel,
      d.gpt4o.toFixed(2),
      d.claudeSonnet.toFixed(2),
      d.geminiPro.toFixed(2),
      d.miniHaiku.toFixed(2),
      d.total.toFixed(2),
      d.forecast ? 'Estimated' : 'Settled'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ostraops_usage_costs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Usage & Cost CSV ledger successfully.');
  };

  const modelBreakdown = [
    {
      model: 'GPT-4o',
      provider: 'OpenAI',
      tokens: '175.0M',
      promptTokens: '122.5M',
      completionTokens: '52.5M',
      cacheHitRate: '42.8%',
      avgLatency: '310ms',
      cost: 2450.21,
      share: 56.6,
      color: '#FFFFFF',
    },
    {
      model: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      tokens: '93.8M',
      promptTokens: '68.4M',
      completionTokens: '25.4M',
      cacheHitRate: '38.2%',
      avgLatency: '420ms',
      cost: 1301.77,
      share: 30.0,
      color: '#C59E5F',
    },
    {
      model: 'Gemini 1.5 Pro',
      provider: 'Google Vertex',
      tokens: '29.7M',
      promptTokens: '22.1M',
      completionTokens: '7.6M',
      cacheHitRate: '51.4%',
      avgLatency: '190ms',
      cost: 412.32,
      share: 9.5,
      color: '#E5C38D',
    },
    {
      model: 'GPT-4o-mini',
      provider: 'OpenAI',
      tokens: '11.2M',
      promptTokens: '8.4M',
      completionTokens: '2.8M',
      cacheHitRate: '24.1%',
      avgLatency: '140ms',
      cost: 98.40,
      share: 2.3,
      color: '#71717A',
    },
    {
      model: 'Claude 3.5 Haiku',
      provider: 'Anthropic',
      tokens: '2.9M',
      promptTokens: '2.1M',
      completionTokens: '0.8M',
      cacheHitRate: '19.5%',
      avgLatency: '160ms',
      cost: 65.94,
      share: 1.6,
      color: '#52525B',
    },
  ];

  const maxDailyTotal = Math.max(...DAILY_DATA.map(d => d.total));

  return (
    <div className="space-y-6">
      
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
            Real-time breakdown of token consumption, upstream provider costs, and failover efficiency.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Time range selector */}
          <div className="relative">
            <button
              onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors shadow-xs font-mono cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C59E5F]" />
              <span>{timeRange}</span>
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${timeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {timeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0B0E14] border border-white/[0.12] shadow-2xl p-1.5 z-40 space-y-1 font-mono text-xs">
                {[
                  { label: 'Month to Date (May 2026)', sub: 'May 01 - May 16, 2026' },
                  { label: 'Last 7 Days', sub: 'Rolling weekly window' },
                  { label: 'Last 30 Days', sub: 'April 16 - May 16, 2026' },
                  { label: 'Year to Date (2026)', sub: 'Jan 01 - May 16, 2026' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setTimeRange(item.label);
                      setTimeDropdownOpen(false);
                      showToast(`Viewing data for: ${item.label}`);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex flex-col cursor-pointer ${
                      timeRange === item.label
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

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Download CSV breakdown"
          >
            <Download className="w-3.5 h-3.5 text-[#C59E5F]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TOP SUMMARY METRIC CARDS (4 Cards, Dark Obsidian)            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Spend MTD */}
        <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium">Total Spend (MTD)</span>
            <span className="font-mono text-[10px] text-zinc-500">{isLive ? 'LIVE' : 'MAY 1 - 16'}</span>
          </div>
          <div className="pt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
              {displaySpend}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#E5C38D] mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#C59E5F]" />
              <span>{isLive ? `${liveStats!.totalRequests.toLocaleString()} requests` : '+28.6% vs April pacing'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Projected Monthly Burn */}
        <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium">Projected EOM Burn</span>
            <span className="font-mono text-[10px] text-zinc-500">HARD CAP: $8,500</span>
          </div>
          <div className="pt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
              $6,712.00
            </div>
            <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] rounded-full w-[78.9%]" />
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-1 flex justify-between">
              <span>78.9% projected quota used</span>
              <span className="text-emerald-400">Safe margin</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Tokens Processed */}
        <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium">Total Tokens</span>
            <span className="font-mono text-[10px] text-zinc-500">ODOMETER</span>
          </div>
          <div className="pt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
              {displayTokens}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">
              {isLive ? `${liveStats!.totalRequests} requests tracked` : '218.4M prompt • 94.2M completion'}
            </div>
          </div>
        </div>

        {/* Card 4: Effective Cost Per 1K Tokens */}
        <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium">Blended Cost / 1K Tokens</span>
            <span className="font-mono text-[10px] text-zinc-500">AVG</span>
          </div>
          <div className="pt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
              $0.00276
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 mt-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>-18.4% cost via smart prompt routing</span>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* FEATURED GRAPH SECTION                                        */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-6">
        
        {/* Graph Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight font-sans flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#C59E5F]" />
              <span>Daily Spend &amp; Model Routing Distribution</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Multi-model stacked burn trajectory with forward end-of-month projection
            </p>
          </div>

          {/* Metric Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#07090C] border border-white/[0.08] self-start md:self-auto">
            <button
              onClick={() => setMetricMode('spend')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                metricMode === 'spend'
                  ? 'bg-[#C59E5F] text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Spend ($ USD)
            </button>
            <button
              onClick={() => setMetricMode('tokens')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                metricMode === 'tokens'
                  ? 'bg-[#C59E5F] text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Token Volume
            </button>
            <button
              onClick={() => setMetricMode('requests')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                metricMode === 'requests'
                  ? 'bg-[#C59E5F] text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Requests
            </button>
          </div>
        </div>

        {/* The Graph Canvas */}
        <div className="relative pt-4">
          
          {/* Selected Date Inspector Banner */}
          {selectedDay && (
            <div className="mb-4 p-3 rounded-xl bg-[#07090C] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-mono">
                  {selectedDay.dayLabel} Telemetry:
                </span>
                <span className="font-mono font-extrabold text-[#E5C38D] text-sm">
                  ${selectedDay.total.toFixed(2)} Total
                </span>
                {selectedDay.forecast && (
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.08] text-zinc-400 text-[10px] font-mono border border-white/[0.08]">
                    PROJECTION
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-white" />
                  <span>GPT-4o: ${selectedDay.gpt4o.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#C59E5F]" />
                  <span>Sonnet 3.5: ${selectedDay.claudeSonnet.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E5C38D]" />
                  <span>Gemini: ${selectedDay.geminiPro.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-zinc-600" />
                  <span>Mini/Haiku: ${selectedDay.miniHaiku.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Stacked Bar Chart */}
          <div className="h-64 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-white/[0.08]">
            {DAILY_DATA.map((day, idx) => {
              const heightPct = (day.total / maxDailyTotal) * 100;
              const gptPct = (day.gpt4o / day.total) * 100;
              const sonnetPct = (day.claudeSonnet / day.total) * 100;
              const geminiPct = (day.geminiPro / day.total) * 100;
              const miniPct = (day.miniHaiku / day.total) * 100;
              const isSelected = selectedDay?.date === day.date;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 flex flex-col items-center h-full justify-end cursor-pointer group transition-all ${
                    day.forecast ? 'opacity-50' : ''
                  }`}
                >
                  {/* Tooltip on hover */}
                  <div className="text-[10px] font-mono text-[#E5C38D] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${day.total.toFixed(0)}
                  </div>

                  {/* Stacked Pillar */}
                  <div
                    className={`w-full max-w-[48px] rounded-t-lg overflow-hidden flex flex-col justify-end transition-all ${
                      isSelected ? 'ring-2 ring-[#C59E5F] ring-offset-2 ring-offset-[#0B0E14]' : ''
                    } ${day.forecast ? 'border border-dashed border-zinc-600' : ''}`}
                    style={{ height: `${heightPct}%` }}
                  >
                    {/* Mini / Haiku segment (top) */}
                    <div
                      className="bg-zinc-600 hover:bg-zinc-500 transition-colors"
                      style={{ height: `${miniPct}%` }}
                      title={`Mini/Haiku: $${day.miniHaiku.toFixed(2)}`}
                    />
                    {/* Gemini Pro segment */}
                    <div
                      className="bg-[#E5C38D] hover:bg-[#F0D5AA] transition-colors"
                      style={{ height: `${geminiPct}%` }}
                      title={`Gemini: $${day.geminiPro.toFixed(2)}`}
                    />
                    {/* Claude Sonnet segment */}
                    <div
                      className="bg-[#C59E5F] hover:bg-[#D8B072] transition-colors"
                      style={{ height: `${sonnetPct}%` }}
                      title={`Claude Sonnet: $${day.claudeSonnet.toFixed(2)}`}
                    />
                    {/* GPT-4o segment (bottom) */}
                    <div
                      className="bg-white hover:bg-zinc-200 transition-colors"
                      style={{ height: `${gptPct}%` }}
                      title={`GPT-4o: $${day.gpt4o.toFixed(2)}`}
                    />
                  </div>

                  {/* X-axis date label */}
                  <span className={`text-[10px] font-mono mt-2 truncate max-w-full ${
                    isSelected ? 'font-bold text-white' : 'text-zinc-500'
                  }`}>
                    {day.dayLabel.split(' ')[0]} {day.dayLabel.split(' ')[1]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Graph Legend */}
          <div className="flex flex-wrap items-center justify-between pt-4 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-zinc-300 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-white" />
                <span>GPT-4o (56.6%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#C59E5F]" />
                <span>Claude 3.5 Sonnet (30.0%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#E5C38D]" />
                <span>Gemini 1.5 Pro (9.5%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-zinc-600" />
                <span>Mini / Haiku Failovers (3.9%)</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 font-mono">
              Dashed bars = Remaining EOM forecast
            </div>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* STANDARD GRAPHS SECTION: LINE GRAPH & PIE CHART              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRAPH 1: CUMULATIVE SPEND LINE GRAPH */}
        <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight font-sans flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-[#C59E5F]" />
                  <span>Cumulative Spend Trajectory (Line Graph)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Actual spend velocity vs. linear monthly budget pacing
                </p>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold text-white font-mono">
                  $4,328.64
                </div>
                <div className="text-[10px] text-emerald-400 font-mono font-medium">
                  -$58.46 under budget
                </div>
              </div>
            </div>

            {/* Line Graph SVG Canvas */}
            <div className="pt-6 pb-2">
              <svg className="w-full h-52 overflow-visible" viewBox="0 0 500 180">
                <defs>
                  <linearGradient id="spendAreaGradDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C59E5F" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#C59E5F" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines & Y-Axis Labels */}
                {[
                  { y: 20, val: '$8k' },
                  { y: 60, val: '$6k' },
                  { y: 100, val: '$4k' },
                  { y: 140, val: '$2k' },
                  { y: 170, val: '$0' },
                ].map((g, i) => (
                  <g key={i}>
                    <line x1="35" y1={g.y} x2="490" y2={g.y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <text x="28" y={g.y + 4} textAnchor="end" className="text-[9px] font-mono fill-zinc-500">
                      {g.val}
                    </text>
                  </g>
                ))}

                {/* Shaded Area under actual curve */}
                <path
                  d="M 35,170 L 35,165 Q 100,155 170,135 T 265,95 L 265,170 Z"
                  fill="url(#spendAreaGradDark)"
                />

                {/* Line 1: Linear Budget Target Pacing (Dashed Gold) */}
                <line
                  x1="35" y1="170"
                  x2="480" y2="15"
                  stroke="#C59E5F"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                />

                {/* Line 2: Actual Spend Curve (Solid Deep Gold/White) */}
                <path
                  d="M 35,165 Q 100,155 170,135 T 265,95"
                  fill="none"
                  stroke="#E5C38D"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Line 3: Projected Path to EOM (Dashed Zinc) */}
                <path
                  d="M 265,95 Q 370,60 480,45"
                  fill="none"
                  stroke="#71717A"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                {/* Key Milestone Dots on Actual Line */}
                {[
                  { cx: 35, cy: 165 },
                  { cx: 110, cy: 150 },
                  { cx: 185, cy: 130 },
                  { cx: 265, cy: 95 },
                ].map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.cx}
                    cy={pt.cy}
                    r="3.5"
                    fill="#E5C38D"
                    stroke="#0B0E14"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Mid-Month Indicator Pin at May 16 */}
                <circle cx="265" cy="95" r="5" fill="#C59E5F" stroke="#FFFFFF" strokeWidth="2" />

                {/* X-Axis Date Labels */}
                {[
                  { x: 35, label: 'May 1' },
                  { x: 110, label: 'May 6' },
                  { x: 185, label: 'May 11' },
                  { x: 265, label: 'May 16' },
                  { x: 340, label: 'May 21' },
                  { x: 410, label: 'May 26' },
                  { x: 480, label: 'May 31' },
                ].map((d, i) => (
                  <text
                    key={i}
                    x={d.x}
                    y="185"
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-zinc-500"
                  >
                    {d.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* Line Graph Legend */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs font-mono">
            <div className="flex items-center gap-4 text-[11px] text-zinc-300">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-[#E5C38D]" />
                <span>Actual Spend ($4,328.64)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-t border-dashed border-[#C59E5F]" />
                <span>Budget Pacing Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-t border-dashed border-zinc-500" />
                <span>EOM Projection ($6,712)</span>
              </div>
            </div>
          </div>
        </div>

        {/* GRAPH 2: PROVIDER & MODEL SHARE PIE CHART */}
        <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight font-sans flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#C59E5F]" />
                  <span>Market Share by Model (Pie Chart)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Proportional token spend distribution across upstream providers
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-zinc-300 text-[10px] font-mono font-bold border border-white/[0.08]">
                5 ACTIVE MODELS
              </span>
            </div>

            {/* Pie Chart Graphic & Legend Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6 pt-5">
              
              {/* Pie / Donut SVG Graphic */}
              <div className="sm:col-span-5 flex justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 42 42">
                    {/* Background Ring */}
                    <circle cx="21" cy="21" r="15.9155" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5.5" />
                    
                    {/* Slice 1: GPT-4o 56.6% */}
                    <circle
                      cx="21" cy="21" r="15.9155" fill="none"
                      stroke="#FFFFFF" strokeWidth="6"
                      strokeDasharray="56.6 43.4"
                      strokeDashoffset="0"
                    />

                    {/* Slice 2: Claude 3.5 Sonnet 30.0% */}
                    <circle
                      cx="21" cy="21" r="15.9155" fill="none"
                      stroke="#C59E5F" strokeWidth="6"
                      strokeDasharray="30.0 70.0"
                      strokeDashoffset="-56.6"
                    />

                    {/* Slice 3: Gemini 1.5 Pro 9.5% */}
                    <circle
                      cx="21" cy="21" r="15.9155" fill="none"
                      stroke="#E5C38D" strokeWidth="6"
                      strokeDasharray="9.5 90.5"
                      strokeDashoffset="-86.6"
                    />

                    {/* Slice 4: Failover Mini / Haiku 3.9% */}
                    <circle
                      cx="21" cy="21" r="15.9155" fill="none"
                      stroke="#52525B" strokeWidth="6"
                      strokeDasharray="3.9 96.1"
                      strokeDashoffset="-96.1"
                    />
                  </svg>

                  {/* Donut Center Readout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-extrabold text-white font-mono leading-none">
                      $4,328
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono mt-0.5">
                      Total Spend
                    </span>
                  </div>
                </div>
              </div>

              {/* Pie Slices Legend Table */}
              <div className="sm:col-span-7 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#07090C] border border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-white" />
                    <span className="font-bold text-white">GPT-4o</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">$2,450.21</span>
                    <span className="text-[10px] text-zinc-400 ml-1.5">(56.6%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#07090C] border border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#C59E5F]" />
                    <span className="font-bold text-white">Claude 3.5 Sonnet</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">$1,301.77</span>
                    <span className="text-[10px] text-zinc-400 ml-1.5">(30.0%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#07090C] border border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#E5C38D]" />
                    <span className="font-bold text-white">Gemini 1.5 Pro</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">$412.32</span>
                    <span className="text-[10px] text-zinc-400 ml-1.5">(9.5%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#07090C] border border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-zinc-600" />
                    <span className="font-bold text-white">Mini / Haiku Failovers</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">$164.34</span>
                    <span className="text-[10px] text-zinc-400 ml-1.5">(3.9%)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-[11px] text-zinc-400 font-mono">
            <span>Primary driver: Code generation &amp; agents</span>
            <span className="text-emerald-400">Zero quota overflows</span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* SECONDARY ROW: INPUT/OUTPUT RATIO & PROJECT SPEND SHARE      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sub-Graph 1: Prompt vs Completion Token Ratio */}
        <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-white font-sans">
              Prompt vs. Completion Token Split
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Prompt caching saves up to 50% on repetitive developer context
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {modelBreakdown.slice(0, 3).map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white">{item.model}</span>
                  <span className="text-zinc-400">{item.tokens} total</span>
                </div>

                <div className="h-2 w-full bg-white/[0.08] rounded-full overflow-hidden flex">
                  {/* Prompt tokens */}
                  <div
                    className="bg-white h-full"
                    style={{ width: `${(parseFloat(item.promptTokens) / parseFloat(item.tokens)) * 100}%` }}
                    title={`Prompt: ${item.promptTokens}`}
                  />
                  {/* Completion tokens */}
                  <div
                    className="bg-[#C59E5F] h-full"
                    style={{ width: `${(parseFloat(item.completionTokens) / parseFloat(item.tokens)) * 100}%` }}
                    title={`Completion: ${item.completionTokens}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Prompt: {item.promptTokens}</span>
                  <span className="text-[#E5C38D]">Cache Hit: {item.cacheHitRate}</span>
                  <span>Completion: {item.completionTokens}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Graph 2: Project Spend Share */}
        <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-white font-sans">
              Cost Allocation by Project
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Spend distribution across registered proxy service endpoints
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {[
              { name: 'Main Web Platform', spend: '$2,450.21', pct: 56.6, color: '#FFFFFF' },
              { name: 'Customer Support Copilot', spend: '$1,210.43', pct: 28.0, color: '#C59E5F' },
              { name: 'Internal Coding Assistant', spend: '$412.32', pct: 9.5, color: '#E5C38D' },
              { name: 'Checkout Fraud Detector', spend: '$164.34', pct: 3.8, color: '#71717A' },
              { name: 'R&D Synthetic Lab', spend: '$91.34', pct: 2.1, color: '#52525B' },
            ].map((proj, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white">{proj.name}</span>
                  <span className="text-zinc-300">{proj.spend} ({proj.pct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${proj.pct}%`, backgroundColor: proj.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* DETAILED PROVIDER & MODEL USAGE LEDGER TABLE                 */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight font-sans">
              Provider &amp; Model Ledger
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Granular telemetry logs for upstream token volume and spend reconciliation
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-zinc-400 font-mono text-[11px]">
                <th className="pb-3 font-semibold">Model / Provider</th>
                <th className="pb-3 font-semibold">Total Tokens</th>
                <th className="pb-3 font-semibold">Prompt / Compl.</th>
                <th className="pb-3 font-semibold">Prompt Cache</th>
                <th className="pb-3 font-semibold">Avg Latency</th>
                <th className="pb-3 font-semibold text-right">Spend</th>
                <th className="pb-3 font-semibold text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {modelBreakdown.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-white">{row.model}</div>
                    <div className="text-[10px] text-zinc-500">{row.provider}</div>
                  </td>
                  <td className="py-3 font-bold text-zinc-200">{row.tokens}</td>
                  <td className="py-3 text-zinc-400">{row.promptTokens} / {row.completionTokens}</td>
                  <td className="py-3 text-emerald-400 font-bold">{row.cacheHitRate}</td>
                  <td className="py-3 text-zinc-400">{row.avgLatency}</td>
                  <td className="py-3 text-right font-extrabold text-white">
                    ${row.cost.toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-bold text-zinc-400">
                    {row.share}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
