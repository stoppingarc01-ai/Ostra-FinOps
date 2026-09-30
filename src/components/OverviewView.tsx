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
  X
} from 'lucide-react';
import { fetchGatewayLogs, isSupabaseConfigured } from '../lib/supabase';
import type { GatewayLog } from '../types/database';

interface OverviewViewProps {
  onNavigateToUsage?: () => void;
  onNavigateToModels?: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToBudgets?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateToUsage,
  onNavigateToModels,
  onNavigateToAlerts,
  onNavigateToBudgets,
}) => {
  const [timeframe, setTimeframe] = useState('Last 7 days');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(6);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  // Live Backend Telemetry Integration
  const [liveLogs, setLiveLogs] = useState<GatewayLog[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<{ uptime: number; activeRequests: number; version?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Check Local Gateway Backend (via Vite proxy /gateway/healthz)
    const checkGateway = async () => {
      try {
        const res = await fetch('/gateway/healthz');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.status === 'ok') {
            setGatewayStatus(data);
            setIsLiveConnected(true);
          }
        }
      } catch {
        try {
          const directRes = await fetch('http://localhost:8080/healthz');
          if (directRes.ok) {
            const data = await directRes.json();
            if (isMounted && data.status === 'ok') {
              setGatewayStatus(data);
              setIsLiveConnected(true);
            }
          }
        } catch {}
      }
    };

    // 2. Check Supabase Telemetry Logs if configured
    const loadLogs = async () => {
      if (isSupabaseConfigured) {
        try {
          const logs = await fetchGatewayLogs(100);
          if (isMounted && logs && logs.length > 0) {
            setLiveLogs(logs);
            setIsLiveConnected(true);
          }
        } catch {
          // Graceful fallback to rich defaults
        }
      }
    };

    checkGateway();
    loadLogs();
    const interval = setInterval(() => {
      checkGateway();
      loadLogs();
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Compute live spend / tokens / requests if live logs exist
  const liveSpend = liveLogs.length > 0
    ? liveLogs.reduce((acc, l) => acc + (l.cost_usd || 0), 0)
    : null;
  const liveTokens = liveLogs.length > 0
    ? liveLogs.reduce((acc, l) => acc + (l.input_tokens || 0) + (l.output_tokens || 0), 0)
    : null;
  const liveRequestsCount = liveLogs.length > 0 ? liveLogs.length : null;

  const trendData = [
    { day: 'Sep 1', spend: '$0.20', height: 14, tokens: '18.4K', requests: '1,120' },
    { day: 'Sep 2', spend: '$0.45', height: 24, tokens: '38.2K', requests: '2,400' },
    { day: 'Sep 3', spend: '$0.60', height: 32, tokens: '55.1K', requests: '3,810' },
    { day: 'Sep 4', spend: '$0.85', height: 44, tokens: '79.6K', requests: '5,140' },
    { day: 'Sep 5', spend: '$1.05', height: 52, tokens: '104.2K', requests: '6,720' },
    { day: 'Sep 6', spend: '$1.25', height: 62, tokens: '124.8K', requests: '7,950' },
    { day: 'Sep 7', spend: '$1.42', height: 72, tokens: '142.0K', requests: '8,932' },
  ];

  const timeOptions = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'All time'];

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-200">
      
      {/* ============================================================ */}
      {/* HEADER: TITLE + SUBTITLE + TIMEFRAME SELECTOR                */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Your AI infrastructure at a glance
          </p>
        </div>

        {/* Header Actions: Gateway Status + Timeframe */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* Live Gateway Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#0B0E14] text-xs font-mono shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]' : 'bg-zinc-600'}`} />
            <span className="text-zinc-300 font-medium">
              {isLiveConnected ? 'Gateway :8080 Live' : 'Gateway Standby'}
            </span>
            {gatewayStatus?.version && (
              <span className="text-[10px] text-zinc-500 font-mono">v{gatewayStatus.version}</span>
            )}
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
      {/* ROW 1: 4 TOP METRIC CARDS                                    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Spend */}
        <div 
          onClick={onNavigateToUsage}
          className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total Spend</span>
            <div className="w-7 h-7 rounded-lg bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight font-sans">
              {liveSpend != null ? `$${liveSpend.toFixed(2)}` : '$1.42'}
            </span>
            <span className="text-xs text-zinc-500 font-medium">/ $5.00</span>
          </div>

          <div className="mt-3">
            <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#C59E5F] h-full rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(100, Math.round(((liveSpend ?? 1.42) / 5) * 100))}%` }} 
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-zinc-500 font-medium">
              <span>{isLiveConnected ? '● Live Gateway' : 'Cached Seed'}</span>
              <span>{Math.min(100, Math.round(((liveSpend ?? 1.42) / 5) * 100))}% cap</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tokens Used */}
        <div 
          onClick={onNavigateToUsage}
          className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Tokens Used</span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-zinc-300">
              <Cpu className="w-3.5 h-3.5 text-[#C59E5F]" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight font-sans">
              {liveTokens != null ? `${(liveTokens / 1000).toFixed(1)}K` : '142K'}
            </span>
            <span className="text-xs text-zinc-500 font-medium">/ min</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              + 12%
            </span>
            {/* Smooth Sine Curve Sparkline */}
            <svg className="w-20 h-5 text-emerald-500 overflow-visible" viewBox="0 0 60 18" fill="none">
              <path 
                d="M1 14 Q 15 4, 30 14 T 58 3" 
                stroke="#10B981" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
              />
            </svg>
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
              {liveLogs.length > 0 && liveLogs[0].routed_model ? liveLogs[0].routed_model : 'Gemini Flash'}
            </span>
          </div>

          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Cost Optimized</span>
            </span>
          </div>
        </div>

        {/* Card 4: Total Requests */}
        <div 
          onClick={onNavigateToUsage}
          className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total Requests</span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-zinc-300">
              <Activity className="w-3.5 h-3.5 text-[#C59E5F]" />
            </div>
          </div>

          <div className="my-1">
            <span className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight font-sans">
              {liveRequestsCount != null ? liveRequestsCount.toLocaleString() : '8,932'}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-xs font-bold text-emerald-400">
              + 18%
            </span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* ROW 2: SPEND TREND (WIDE) + TOP MODELS BY COST (CARD)        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Spend Trend Chart (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white tracking-tight">Spend Trend</h3>
            <span className="text-xs font-mono text-zinc-500 font-medium">USD ($)</span>
          </div>

          {/* SVG Area & Line Chart */}
          <div className="relative h-44 w-full pt-3">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 450 140" preserveAspectRatio="none">
              <defs>
                <linearGradient id="spendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C59E5F" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#C59E5F" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="450" y2="20" stroke="#F4EFE6" strokeDasharray="4 4" />
              <line x1="0" y1="55" x2="450" y2="55" stroke="#F4EFE6" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="450" y2="90" stroke="#F4EFE6" strokeDasharray="4 4" />
              <line x1="0" y1="125" x2="450" y2="125" stroke="rgba(255,255,255,0.08)" />

              {/* Gradient Area Fill */}
              <path
                d="M 20,110 L 85,100 L 150,88 L 215,74 L 280,56 L 345,42 L 420,24 L 420,125 L 20,125 Z"
                fill="url(#spendAreaGrad)"
              />

              {/* Main Line */}
              <path
                d="M 20,110 L 85,100 L 150,88 L 215,74 L 280,56 L 345,42 L 420,24"
                fill="none"
                stroke="#C59E5F"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Interactive Points */}
              {trendData.map((point, index) => {
                const cx = index === 6 ? 420 : 20 + index * 65;
                const cy = 125 - point.height * 1.35;
                const isSelected = selectedDay === index;
                return (
                  <g 
                    key={point.day} 
                    className="cursor-pointer group"
                    onClick={() => setSelectedDay(index)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 5.5 : 3.8}
                      fill={isSelected ? '#18181B' : '#FFFFFF'}
                      stroke="#C59E5F"
                      strokeWidth={isSelected ? 2.5 : 2}
                      className="transition-all duration-150 group-hover:scale-125"
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-Axis Date Labels */}
            <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-3 px-2">
              {trendData.map((d, i) => (
                <button
                  key={d.day}
                  onClick={() => setSelectedDay(i)}
                  className={`cursor-pointer transition-colors ${
                    selectedDay === i 
                      ? 'font-bold text-white underline decoration-ostraGold-500 underline-offset-4' 
                      : 'hover:text-zinc-200'
                  }`}
                >
                  {d.day}
                </button>
              ))}
            </div>

            {/* Selected Day Tooltip */}
            {selectedDay !== null && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#07090C] border border-white/[0.08] flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">
                  {trendData[selectedDay].day} Detail:
                </span>
                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span>Spend: <strong className="text-[#E5C38D]">{trendData[selectedDay].spend}</strong></span>
                  <span>Tokens: <strong className="text-white">{trendData[selectedDay].tokens}</strong></span>
                  <span>Requests: <strong className="text-white">{trendData[selectedDay].requests}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Models by Cost (5 cols on lg) */}
        <div 
          onClick={onNavigateToModels}
          className="lg:col-span-5 p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between cursor-pointer group hover:shadow-md transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white tracking-tight">Top Models by Cost</h3>
              <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">View All →</span>
            </div>

            <div className="space-y-4">
              {/* Gemini Flash */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-zinc-200">Gemini Flash</span>
                  <span className="text-white font-bold font-mono">62%</span>
                </div>
                <div className="w-full bg-[#EAE6DD] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#946A2C] h-full rounded-full" style={{ width: '62%' }} />
                </div>
              </div>

              {/* GPT-4o */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-zinc-200">GPT-4o</span>
                  <span className="text-white font-bold font-mono">23%</span>
                </div>
                <div className="w-full bg-[#EAE6DD] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#18181B] h-full rounded-full" style={{ width: '23%' }} />
                </div>
              </div>

              {/* Claude Sonnet */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-zinc-200">Claude Sonnet</span>
                  <span className="text-white font-bold font-mono">9%</span>
                </div>
                <div className="w-full bg-[#EAE6DD] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#C59E5F] h-full rounded-full" style={{ width: '9%' }} />
                </div>
              </div>

              {/* Other */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-zinc-200">Other</span>
                  <span className="text-white font-bold font-mono">6%</span>
                </div>
                <div className="w-full bg-[#EAE6DD] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#D4CEBF] h-full rounded-full" style={{ width: '6%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Primary driver: Gemini Flash</span>
            <span className="font-semibold text-emerald-700">90% savings enabled</span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* ROW 3: RECENT ALERTS (WIDE) + NET SAVED CARD (DARK)          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Recent Alerts (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-white tracking-tight">Recent Alerts</h3>
              <button 
                onClick={onNavigateToAlerts}
                className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                View full audit log →
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Alert 1 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#07090C] border border-amber-500/25 transition-all hover:border-amber-500/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-snug">
                      Token spike detected!
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Agent: research-agent • 2m ago
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert('Token spike detected on research-agent: 42,000 tokens consumed in 45s during autonomous web search loop. Intra-family rate limit applied.')}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#0B0E14]/[0.06] border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-[#0B0E14]/[0.1] transition-colors shadow-xs cursor-pointer"
                >
                  View
                </button>
              </div>

              {/* Alert 2 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#07090C] border border-emerald-500/25 transition-all hover:border-emerald-500/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-snug">
                      Budget cap updated
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      New limit: $1.00 → $5.00 • 12m ago
                    </div>
                  </div>
                </div>
                <button
                  onClick={onNavigateToBudgets}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#0B0E14]/[0.06] border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-[#0B0E14]/[0.1] transition-colors shadow-xs cursor-pointer"
                >
                  View
                </button>
              </div>

              {/* Alert 3 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#07090C] border border-blue-500/25 transition-all hover:border-blue-500/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-snug">
                      Model optimization suggested
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Switch to Gemini Flash (90% cheaper)
                    </div>
                  </div>
                </div>
                <button
                  onClick={onNavigateToModels}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#0B0E14]/[0.06] border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-[#0B0E14]/[0.1] transition-colors shadow-xs cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Net Saved Card (5 cols on lg, Dark Charcoal Card with Gold Waves) */}
        <div className="lg:col-span-5 relative p-7 rounded-3xl bg-gradient-to-br from-[#111414] via-[#18181B] to-[#0B0F0F] text-white overflow-hidden shadow-xl border border-charcoal-800/80 flex flex-col justify-between min-h-[220px]">
          
          {/* Flowing Gold Topographic Waves (Signature OstraOps wave art) */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 300 180" preserveAspectRatio="none">
              <path d="M0,150 C80,100 160,170 300,110" stroke="#C59E5F" strokeWidth="1.4" fill="none" />
              <path d="M0,165 C80,115 190,160 300,125" stroke="#C59E5F" strokeWidth="1.2" fill="none" />
              <path d="M0,130 C90,80 210,140 300,95" stroke="#C59E5F" strokeWidth="1.6" fill="none" />
              <path d="M0,180 C110,135 200,140 300,140" stroke="#C59E5F" strokeWidth="1" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              $16.58
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/90 px-2.5 py-1 rounded-full border border-emerald-800/80">
              -90%
            </span>
          </div>

          <div className="relative z-10 mt-8">
            <div className="text-base font-bold text-white tracking-tight">Net Saved</div>
            <div className="text-xs text-zinc-400 mt-0.5 font-normal">vs. projected spend</div>
          </div>
        </div>

      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#C59E5F] text-black font-bold/50 backdrop-blur-xs p-4">
          <div className="bg-[#0B0E14] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-white text-sm">Security &amp; Velocity Event</h4>
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
                className="px-4 py-2 rounded-xl bg-[#C59E5F] text-black font-bold text-xs font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
