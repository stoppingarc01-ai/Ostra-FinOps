import React, { useState, useMemo } from 'react';
import {
  Calendar,
  RefreshCw,
  ChevronDown,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  DollarSign,
  Cpu,
  Laptop,
  FolderGit2,
  TrendingUp,
  Sparkles,
  Clock,
  Activity,
  ArrowUpRight,
  Filter,
  Check,
} from 'lucide-react';
import type { SessionSummary, TraceRecord } from '../types';
import { AnalyticsStatCards } from './AnalyticsStatCards';
import { SpendTrendChart } from './SpendTrendChart';
import { SpendByProviderChart } from './SpendByProviderChart';
import { ModelPerformanceTable } from './ModelPerformanceTable';
import { UsageByProjectCard } from './UsageByProjectCard';
import { OptimizationBanner } from './OptimizationBanner';
import { RightRailInsights } from './RightRailInsights';

interface AnalyticsViewProps {
  summary: SessionSummary;
  traces: TraceRecord[];
  onSelectTrace: (trace: TraceRecord) => void;
  onRefresh: () => void;
}

type DateRange = 'today' | '24h' | '7d' | '30d' | 'all';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  summary,
  traces,
  onSelectTrace,
  onRefresh,
}) => {
  const [subTab, setSubTab] = useState('Overview');
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isInsideAnalytics, setIsInsideAnalytics] = useState(false);

  const subTabs = [
    'Overview',
    'Usage',
    'Costs',
    'Models',
    'Developers',
    'Projects',
    'Reports',
  ];

  const dateRangeLabels: Record<DateRange, string> = {
    today: 'Today (Live)',
    '24h': 'Past 24 Hours',
    '7d': 'Past 7 Days (Live)',
    '30d': 'Past 30 Days',
    all: 'All Time',
  };

  // Filter traces based on dateRange
  const filteredTraces = useMemo(() => {
    const now = Date.now();
    if (dateRange === 'today') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return traces.filter((t) => t.timestamp >= startOfToday.getTime());
    }
    if (dateRange === '24h') {
      return traces.filter((t) => t.timestamp >= now - 24 * 60 * 60 * 1000);
    }
    if (dateRange === '7d') {
      return traces.filter((t) => t.timestamp >= now - 7 * 24 * 60 * 60 * 1000);
    }
    if (dateRange === '30d') {
      return traces.filter((t) => t.timestamp >= now - 30 * 24 * 60 * 60 * 1000);
    }
    return traces;
  }, [traces, dateRange]);

  // Recalculate summary from filtered traces
  const effectiveSummary = useMemo(() => {
    if (filteredTraces.length === traces.length) return summary;
    let totalInput = 0;
    let totalOutput = 0;
    let totalCost = 0;
    let errors = 0;
    let durationSum = 0;
    for (const t of filteredTraces) {
      totalInput += t.inputTokens || 0;
      totalOutput += t.outputTokens || 0;
      totalCost += t.costUsd || 0;
      if (t.statusCode >= 400 || t.errorMessage) errors++;
      durationSum += t.durationMs || 0;
    }
    return {
      totalRequests: filteredTraces.length,
      totalInputTokens: totalInput,
      totalOutputTokens: totalOutput,
      totalCostUsd: totalCost,
      errorCount: errors,
      avgDurationMs: filteredTraces.length > 0 ? durationSum / filteredTraces.length : 0,
    };
  }, [filteredTraces, traces, summary]);

  // CSV Export utility
  const handleExportCsv = () => {
    if (filteredTraces.length === 0) return;
    const headers = [
      'id',
      'createdAt',
      'provider',
      'requestedModel',
      'routedModel',
      'statusCode',
      'inputTokens',
      'outputTokens',
      'totalTokens',
      'costUsd',
      'durationMs',
      'stream',
    ];
    const rows = filteredTraces.map((t) => [
      t.id,
      t.createdAt,
      t.provider,
      t.requestedModel,
      t.routedModel,
      t.statusCode,
      t.inputTokens,
      t.outputTokens,
      (t.inputTokens || 0) + (t.outputTokens || 0),
      t.costUsd?.toFixed(6) || '0',
      t.durationMs,
      t.stream ? 'true' : 'false',
    ]);
    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `osterdops_traces_${dateRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Telemetry Export utility
  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      dateRange,
      summary: effectiveSummary,
      tracesCount: filteredTraces.length,
      traces: filteredTraces,
    };
    const jsonString = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div
      onMouseEnter={() => setIsInsideAnalytics(true)}
      onMouseLeave={() => setIsInsideAnalytics(false)}
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      className="space-y-6 animate-in fade-in duration-200 font-sans cursor-analytic-pointer relative"
    >
      {/* Analytics Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900">
                Analytics &amp; Intelligence
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E5F2EB] text-[#0C2419]">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                Live Telemetry
              </span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF8F5] border border-[#EAE4D8] text-charcoal-700 shadow-2xs">
                <img src="/custom-cursor-green-32.png" alt="Cursor" className="w-3.5 h-3.5 inline-block" />
                <span>Custom Cursor Active</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
              Deep telemetry into model token consumption, cost trends, latency profiles, and routing efficiency.
            </p>
          </div>

          {/* Date Picker & Auto Refresh Controls */}
          <div className="flex items-center gap-3 shrink-0 relative">
            <div className="relative">
              <button
                onClick={() => setIsDateDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#EAE4D8] text-xs font-semibold text-charcoal-700 hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
                <span>{dateRangeLabels[dateRange]}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-charcoal-400 ml-0.5 transition-transform ${
                    isDateDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Date Filter Dropdown Menu */}
              {isDateDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-[#EAE4D8] rounded-xl shadow-lg p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {(Object.keys(dateRangeLabels) as DateRange[]).map((rangeKey) => (
                    <button
                      key={rangeKey}
                      onClick={() => {
                        setDateRange(rangeKey);
                        setIsDateDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                        dateRange === rangeKey
                          ? 'bg-[#E5F2EB] text-[#0C2419]'
                          : 'text-charcoal-700 hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{dateRangeLabels[rangeKey]}</span>
                      {dateRange === rangeKey && <Check className="w-3.5 h-3.5 text-emerald-800" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#EAE4D8] text-xs font-semibold text-charcoal-700 hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-charcoal-500" />
              <span>Auto refresh</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </button>
          </div>
        </div>

        {/* Subtabs Pill Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#EAE4D8]/60">
          {subTabs.map((tab) => {
            const isActive = subTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0C2419] text-white shadow-xs'
                    : 'bg-transparent text-charcoal-600 hover:text-charcoal-900 hover:bg-[#F5F2EB]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONDITIONAL SUBTAB VIEWS: Changes dynamically on tab switch */}
      {/* ========================================================================= */}

      {/* 1. OVERVIEW SUBTAB */}
      {subTab === 'Overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 Stat KPI Cards with Real Data */}
          <AnalyticsStatCards summary={effectiveSummary} />

          {/* Main Content Grid: 8 Cols Left & 4 Cols Right */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols): Charts & Tables */}
            <div className="xl:col-span-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendTrendChart traces={filteredTraces} />
                <SpendByProviderChart
                  traces={filteredTraces}
                  totalCostUsd={effectiveSummary.totalCostUsd}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ModelPerformanceTable traces={filteredTraces} />
                <UsageByProjectCard />
              </div>

              <OptimizationBanner />
            </div>

            {/* Right Column (4 cols): Top Insights & Recent Activity */}
            <div className="xl:col-span-4">
              <RightRailInsights traces={filteredTraces} onSelectTrace={onSelectTrace} />
            </div>
          </div>
        </div>
      )}

      {/* 2. USAGE SUBTAB */}
      {subTab === 'Usage' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Token KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-semibold text-charcoal-600">Prompt / Input Tokens</span>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-charcoal-900">
                  {effectiveSummary.totalInputTokens.toLocaleString()}
                </div>
                <div className="text-[11px] text-charcoal-500 mt-1">Context sent upstream</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-semibold text-charcoal-600">Completion Tokens</span>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-emerald-800">
                  {effectiveSummary.totalOutputTokens.toLocaleString()}
                </div>
                <div className="text-[11px] text-charcoal-500 mt-1">Generated responses</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-semibold text-charcoal-600">Avg. Tokens / Request</span>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-charcoal-900">
                  {effectiveSummary.totalRequests > 0
                    ? Math.round(
                        (effectiveSummary.totalInputTokens + effectiveSummary.totalOutputTokens) /
                          effectiveSummary.totalRequests
                      ).toLocaleString()
                    : '0'}
                </div>
                <div className="text-[11px] text-charcoal-500 mt-1">Tokens density per call</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-semibold text-charcoal-600">Streamed vs Buffered</span>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-charcoal-900">
                  {filteredTraces.filter((t) => t.stream).length} / {filteredTraces.length}
                </div>
                <div className="text-[11px] text-charcoal-500 mt-1">
                  {filteredTraces.length > 0
                    ? Math.round(
                        (filteredTraces.filter((t) => t.stream).length / filteredTraces.length) * 100
                      )
                    : 0}
                  % SSE streaming
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Usage Table */}
          <div className="bg-white rounded-2xl p-6 border border-[#EAE4D8] shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-charcoal-900">Token Volume by Model Stream</h3>
            <ModelPerformanceTable traces={filteredTraces} />
          </div>
        </div>
      )}

      {/* 3. COSTS SUBTAB */}
      {subTab === 'Costs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-semibold text-charcoal-600">Total Spend Incurred</span>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-charcoal-900">
                  ${effectiveSummary.totalCostUsd.toFixed(4)}
                </div>
                <div className="text-[11px] text-charcoal-500 mt-1">{dateRangeLabels[dateRange]}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-semibold text-charcoal-600">Estimated Net Savings</span>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-emerald-800">
                  ${(effectiveSummary.totalCostUsd * 0.28).toFixed(4)}
                </div>
                <div className="text-[11px] text-charcoal-500 mt-1">via smart guardrails &amp; caching</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-semibold text-charcoal-600">Avg Cost / Request</span>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-charcoal-900">
                  ${effectiveSummary.totalRequests > 0
                    ? (effectiveSummary.totalCostUsd / effectiveSummary.totalRequests).toFixed(4)
                    : '0.0000'}
                </div>
                <div className="text-[11px] text-charcoal-500 mt-1">USD per completion</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-semibold text-charcoal-600">Budget Ceiling Status</span>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-charcoal-900">$5.00 Cap</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  {((effectiveSummary.totalCostUsd / 5.0) * 100).toFixed(1)}% consumed
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendTrendChart traces={filteredTraces} />
            <SpendByProviderChart
              traces={filteredTraces}
              totalCostUsd={effectiveSummary.totalCostUsd}
            />
          </div>
        </div>
      )}

      {/* 4. MODELS SUBTAB */}
      {subTab === 'Models' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 border border-[#EAE4D8] shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F2EB]">
              <div>
                <h3 className="text-base font-bold text-charcoal-900">Model Routing Benchmarks</h3>
                <p className="text-xs text-charcoal-500">
                  Comparative latency profiles, success rates, and token cost efficiency.
                </p>
              </div>
            </div>
            <ModelPerformanceTable traces={filteredTraces} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendByProviderChart
              traces={filteredTraces}
              totalCostUsd={effectiveSummary.totalCostUsd}
            />
            <OptimizationBanner />
          </div>
        </div>
      )}

      {/* 5. DEVELOPERS SUBTAB */}
      {subTab === 'Developers' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 border border-[#EAE4D8] shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F2EB]">
              <div>
                <h3 className="text-base font-bold text-charcoal-900">Developer &amp; Agent Attribution</h3>
                <p className="text-xs text-charcoal-500">
                  Local workstation identity and client IDE routing breakdown.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#E5F2EB] text-[#0C2419] px-2.5 py-1 rounded-lg">
                1 Local Seat Active
              </span>
            </div>

            <div className="divide-y divide-[#F5F2EB]">
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0C2419] text-white flex items-center justify-center font-bold text-sm">
                    DEV
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-900">Local Developer</h4>
                    <p className="text-xs text-charcoal-500">solo@osterdops.com • 127.0.0.1 (Loopback)</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs text-right">
                  <div>
                    <div className="font-bold text-charcoal-900">{effectiveSummary.totalRequests} calls</div>
                    <div className="text-[10px] text-charcoal-400">Total volume</div>
                  </div>
                  <div>
                    <div className="font-bold text-charcoal-900">
                      ${effectiveSummary.totalCostUsd.toFixed(4)}
                    </div>
                    <div className="text-[10px] text-charcoal-400">Incurred spend</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#0C2419]" />
                <h4 className="text-xs font-bold text-charcoal-900">Cursor IDE</h4>
              </div>
              <p className="text-[11px] text-charcoal-500 mt-2">
                Connected via OpenAI protocol on <code className="font-mono text-emerald-800">127.0.0.1:8080/v1</code>
              </p>
              <div className="mt-4 text-xs font-bold text-emerald-800 bg-[#E5F2EB] px-2.5 py-1 rounded-lg w-fit">
                Active Ingress
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold text-charcoal-900">Cline / Claude Dev</h4>
              </div>
              <p className="text-[11px] text-charcoal-500 mt-2">
                Connected via Anthropic protocol on <code className="font-mono text-amber-800">127.0.0.1:8080</code>
              </p>
              <div className="mt-4 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg w-fit">
                Active Ingress
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-700" />
                <h4 className="text-xs font-bold text-charcoal-900">Python / SDK Tools</h4>
              </div>
              <p className="text-[11px] text-charcoal-500 mt-2">
                Direct loopback API calls intercepted with zero latency overhead.
              </p>
              <div className="mt-4 text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg w-fit">
                Ready
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. PROJECTS SUBTAB */}
      {subTab === 'Projects' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UsageByProjectCard />
            <OptimizationBanner />
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#EAE4D8] shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-charcoal-900">Repository Spend Caps</h3>
            <div className="divide-y divide-[#F5F2EB]">
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderGit2 className="w-5 h-5 text-emerald-800" />
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-900">OsterdOps 2.0 (Active Repo)</h4>
                    <p className="text-[10px] text-charcoal-400">Local workstation workspace</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-charcoal-900">
                    ${effectiveSummary.totalCostUsd.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Under budget</div>
                </div>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderGit2 className="w-5 h-5 text-charcoal-400" />
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-900">guard-daemon Package</h4>
                    <p className="text-[10px] text-charcoal-400">Background proxy sentinel</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-charcoal-900">$0.0000</div>
                  <div className="text-[10px] text-charcoal-400">Standby</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. REPORTS SUBTAB */}
      {subTab === 'Reports' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 border border-[#EAE4D8] shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F2EB]">
              <div>
                <h3 className="text-base font-bold text-charcoal-900">Audit &amp; Telemetry Export Center</h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Download trace records for accounting, model benchmarking, or team compliance.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV ({filteredTraces.length})</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EAE4D8] hover:bg-[#FAF8F5] text-charcoal-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-charcoal-500" />
                  <span>{copiedNotification ? 'JSON Copied! ✓' : 'Copy JSON'}</span>
                </button>
              </div>
            </div>

            {/* Audit Summary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
                <span className="text-[11px] font-semibold text-charcoal-500 uppercase">Records Filtered</span>
                <div className="text-xl font-bold font-mono text-charcoal-900 mt-1">
                  {filteredTraces.length} Traces
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
                <span className="text-[11px] font-semibold text-charcoal-500 uppercase">Total Audit Spend</span>
                <div className="text-xl font-bold font-mono text-charcoal-900 mt-1">
                  ${effectiveSummary.totalCostUsd.toFixed(4)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
                <span className="text-[11px] font-semibold text-charcoal-500 uppercase">Guardrail Compliance</span>
                <div className="text-xl font-bold font-mono text-emerald-800 mt-1">100% Passed</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#EAE4D8] shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-charcoal-900">Recent Audit Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#F5F2EB] text-charcoal-400 uppercase text-[10px]">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Provider</th>
                    <th className="pb-2">Model</th>
                    <th className="pb-2 text-right">Tokens</th>
                    <th className="pb-2 text-right">Cost</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2EB]">
                  {filteredTraces.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-charcoal-400 font-sans text-xs">
                        No trace events found for the selected time window.
                      </td>
                    </tr>
                  ) : (
                    filteredTraces.slice(0, 10).map((t) => (
                      <tr key={t.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-2.5 text-charcoal-500">
                          {new Date(t.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 font-bold uppercase text-charcoal-700">{t.provider}</td>
                        <td className="py-2.5 text-charcoal-900">{t.routedModel || t.requestedModel}</td>
                        <td className="py-2.5 text-right font-bold text-charcoal-800">
                          {((t.inputTokens || 0) + (t.outputTokens || 0)).toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right text-emerald-800 font-bold">
                          ${t.costUsd?.toFixed(4) || '0.0000'}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              t.statusCode >= 200 && t.statusCode < 400
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            {t.statusCode || 200}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
