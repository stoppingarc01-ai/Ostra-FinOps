import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Download,
  TrendingUp,
  BarChart2,
  TrendingDown,
  LineChart,
  PieChart
} from 'lucide-react';

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
  const [timeRange] = useState('Month to Date (May 2026)');
  const [selectedDay, setSelectedDay] = useState<DailySpend | null>(DAILY_DATA[5]);

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
      color: '#18181B',
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
      color: '#8E6B2C',
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
      color: '#DDD6C7',
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
      color: '#C7BDAB',
    },
  ];

  const maxDailyTotal = Math.max(...DAILY_DATA.map(d => d.total));

  return (
    <div className="space-y-6">
      
      {/* ============================================================ */}
      {/* HEADER & CONTROLS                                            */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-charcoal-900 tracking-tight font-sans">
            Usage &amp; Cost Analytics
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Real-time breakdown of token consumption, upstream provider costs, and failover efficiency.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Time range selector */}
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-medium text-charcoal-700 hover:bg-sandstone-100 transition-colors shadow-subtle font-mono">
              <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
              <span>{timeRange}</span>
              <ChevronDown className="w-3 h-3 text-charcoal-400" />
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={() => alert('Downloading Usage & Cost CSV ledger...')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EAE5DC] hover:bg-sandstone-100 text-charcoal-800 text-xs font-bold transition-all shadow-subtle"
          >
            <Download className="w-3.5 h-3.5 text-charcoal-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TOP SUMMARY METRIC CARDS (4 Cards, OstraOps Palette)        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Spend MTD */}
        <div className="p-5 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span className="font-medium">Total Spend (MTD)</span>
            <span className="font-mono text-[10px] text-charcoal-400">MAY 1 - 16</span>
          </div>
          <div className="pt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-charcoal-900 font-mono tracking-tight">
              $4,328.64
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-charcoal-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-ostraGold-600" />
              <span>+28.6% vs April pacing</span>
            </div>
          </div>
        </div>

        {/* Card 2: Projected Monthly Burn */}
        <div className="p-5 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span className="font-medium">Projected EOM Burn</span>
            <span className="font-mono text-[10px] text-charcoal-400">HARD CAP: $8,500</span>
          </div>
          <div className="pt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-charcoal-900 font-mono tracking-tight">
              $6,712.00
            </div>
            <div className="h-1.5 w-full bg-[#EAE5DC] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-ostraGold-500 rounded-full w-[78.9%]" />
            </div>
            <div className="text-[10px] text-charcoal-500 font-mono mt-1 flex justify-between">
              <span>78.9% projected quota used</span>
              <span>Safe margin</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Tokens Processed */}
        <div className="p-5 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span className="font-medium">Total Tokens</span>
            <span className="font-mono text-[10px] text-charcoal-400">ODOMETER</span>
          </div>
          <div className="pt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-charcoal-900 font-mono tracking-tight">
              312.6M
            </div>
            <div className="text-[11px] text-charcoal-500 font-mono mt-1">
              218.4M prompt • 94.2M completion
            </div>
          </div>
        </div>

        {/* Card 4: Effective Cost Per 1K Tokens */}
        <div className="p-5 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span className="font-medium">Blended Cost / 1K Tokens</span>
            <span className="font-mono text-[10px] text-charcoal-400">AVG</span>
          </div>
          <div className="pt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-charcoal-900 font-mono tracking-tight">
              $0.00276
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 mt-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
              <span>-18.4% cost via smart prompt routing</span>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* FEATURED GRAPH SECTION (Explicitly requested by user)        */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-6">
        
        {/* Graph Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE5DC] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight font-sans flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-ostraGold-600" />
              <span>Daily Spend &amp; Model Routing Distribution</span>
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Multi-model stacked burn trajectory with forward end-of-month projection
            </p>
          </div>

          {/* Metric Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#F5F2EB] border border-[#EAE5DC] self-start md:self-auto">
            <button
              onClick={() => setMetricMode('spend')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                metricMode === 'spend'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Spend ($ USD)
            </button>
            <button
              onClick={() => setMetricMode('tokens')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                metricMode === 'tokens'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Token Volume
            </button>
            <button
              onClick={() => setMetricMode('requests')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                metricMode === 'requests'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
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
            <div className="mb-4 p-3 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-charcoal-900 font-mono">
                  {selectedDay.dayLabel} Telemetry:
                </span>
                <span className="font-mono font-extrabold text-charcoal-900 text-sm">
                  ${selectedDay.total.toFixed(2)} Total
                </span>
                {selectedDay.forecast && (
                  <span className="px-2 py-0.5 rounded-md bg-sandstone-300 text-charcoal-700 text-[10px] font-mono">
                    PROJECTION
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#18181B]" />
                  <span>GPT-4o: ${selectedDay.gpt4o.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#C59E5F]" />
                  <span>Sonnet 3.5: ${selectedDay.claudeSonnet.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#8E6B2C]" />
                  <span>Gemini: ${selectedDay.geminiPro.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#DDD6C7]" />
                  <span>Mini/Haiku: ${selectedDay.miniHaiku.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Stacked Bar Chart */}
          <div className="h-64 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-[#EAE5DC]">
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
                    day.forecast ? 'opacity-65' : ''
                  }`}
                >
                  {/* Tooltip on hover */}
                  <div className="text-[10px] font-mono text-charcoal-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${day.total.toFixed(0)}
                  </div>

                  {/* Stacked Pillar */}
                  <div
                    className={`w-full max-w-[48px] rounded-t-lg overflow-hidden flex flex-col justify-end transition-all ${
                      isSelected ? 'ring-2 ring-ostraGold-500 ring-offset-2' : ''
                    } ${day.forecast ? 'border border-dashed border-charcoal-400' : ''}`}
                    style={{ height: `${heightPct}%` }}
                  >
                    {/* Mini / Haiku segment (top) */}
                    <div
                      className="bg-[#DDD6C7] hover:bg-[#C7BDAB] transition-colors"
                      style={{ height: `${miniPct}%` }}
                      title={`Mini/Haiku: $${day.miniHaiku.toFixed(2)}`}
                    />
                    {/* Gemini Pro segment */}
                    <div
                      className="bg-[#8E6B2C] hover:bg-[#A37B34] transition-colors"
                      style={{ height: `${geminiPct}%` }}
                      title={`Gemini: $${day.geminiPro.toFixed(2)}`}
                    />
                    {/* Claude Sonnet segment */}
                    <div
                      className="bg-[#C59E5F] hover:bg-[#D4AF37] transition-colors"
                      style={{ height: `${sonnetPct}%` }}
                      title={`Claude Sonnet: $${day.claudeSonnet.toFixed(2)}`}
                    />
                    {/* GPT-4o segment (bottom) */}
                    <div
                      className="bg-[#18181B] hover:bg-black transition-colors"
                      style={{ height: `${gptPct}%` }}
                      title={`GPT-4o: $${day.gpt4o.toFixed(2)}`}
                    />
                  </div>

                  {/* X-axis date label */}
                  <span className={`text-[10px] font-mono mt-2 truncate max-w-full ${
                    isSelected ? 'font-bold text-charcoal-900' : 'text-charcoal-400'
                  }`}>
                    {day.dayLabel.split(' ')[0]} {day.dayLabel.split(' ')[1]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Graph Legend */}
          <div className="flex flex-wrap items-center justify-between pt-4 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-charcoal-700 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#18181B]" />
                <span>GPT-4o (56.6%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#C59E5F]" />
                <span>Claude 3.5 Sonnet (30.0%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#8E6B2C]" />
                <span>Gemini 1.5 Pro (9.5%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#DDD6C7]" />
                <span>Mini / Haiku Failovers (3.9%)</span>
              </div>
            </div>

            <div className="text-[11px] text-charcoal-400 font-mono">
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
        <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight font-sans flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-ostraGold-600" />
                  <span>Cumulative Spend Trajectory (Line Graph)</span>
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Actual spend velocity vs. linear monthly budget pacing
                </p>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold text-charcoal-900 font-mono">
                  $4,328.64
                </div>
                <div className="text-[10px] text-emerald-700 font-mono font-medium">
                  -$58.46 under budget
                </div>
              </div>
            </div>

            {/* Line Graph SVG Canvas */}
            <div className="pt-6 pb-2">
              <svg className="w-full h-52 overflow-visible" viewBox="0 0 500 180">
                <defs>
                  <linearGradient id="spendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#18181B" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#18181B" stopOpacity="0.0" />
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
                    <line x1="35" y1={g.y} x2="490" y2={g.y} stroke="#F2EFE9" strokeDasharray="3 3" />
                    <text x="28" y={g.y + 4} textAnchor="end" className="text-[9px] font-mono fill-charcoal-400">
                      {g.val}
                    </text>
                  </g>
                ))}

                {/* Shaded Area under actual curve */}
                <path
                  d="M 35,170 L 35,165 Q 100,155 170,135 T 265,95 L 265,170 Z"
                  fill="url(#spendAreaGrad)"
                />

                {/* Line 1: Linear Budget Target Pacing (Dashed Gold) */}
                <line
                  x1="35" y1="170"
                  x2="480" y2="15"
                  stroke="#C59E5F"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />

                {/* Line 2: Actual Spend Curve (Solid Deep Charcoal) */}
                <path
                  d="M 35,165 Q 100,155 170,135 T 265,95"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Line 3: Projected Path to EOM (Dashed Charcoal) */}
                <path
                  d="M 265,95 Q 370,60 480,45"
                  fill="none"
                  stroke="#18181B"
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
                    fill="#18181B"
                    stroke="#FFFFFF"
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
                    className="text-[9px] font-mono fill-charcoal-400"
                  >
                    {d.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* Line Graph Legend */}
          <div className="flex items-center justify-between pt-3 border-t border-[#EAE5DC] text-xs font-mono">
            <div className="flex items-center gap-4 text-[11px] text-charcoal-700">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-[#18181B]" />
                <span>Actual Spend ($4,328.64)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-t border-dashed border-[#C59E5F]" />
                <span>Budget Pacing Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-t border-dashed border-[#18181B]" />
                <span>EOM Projection ($6,712)</span>
              </div>
            </div>
          </div>
        </div>

        {/* GRAPH 2: PROVIDER & MODEL SHARE PIE CHART */}
        <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight font-sans flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-ostraGold-600" />
                  <span>Market Share by Model (Pie Chart)</span>
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Proportional token spend distribution across upstream providers
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-sandstone-200 text-charcoal-800 text-[10px] font-mono font-bold">
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
                    <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#F5F2EB" strokeWidth="5.5" />
                    
                    {/* Slice 1: GPT-4o 56.6% */}
                    <circle
                      cx="21" cy="21" r="15.9155" fill="none"
                      stroke="#18181B" strokeWidth="6"
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
                      stroke="#8E6B2C" strokeWidth="6"
                      strokeDasharray="9.5 90.5"
                      strokeDashoffset="-86.6"
                    />

                    {/* Slice 4: Failover Mini / Haiku 3.9% */}
                    <circle
                      cx="21" cy="21" r="15.9155" fill="none"
                      stroke="#DDD6C7" strokeWidth="6"
                      strokeDasharray="3.9 96.1"
                      strokeDashoffset="-96.1"
                    />
                  </svg>

                  {/* Donut Center Readout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-extrabold text-charcoal-900 font-mono leading-none">
                      $4,328
                    </span>
                    <span className="text-[9px] text-charcoal-400 font-mono mt-0.5">
                      Total Spend
                    </span>
                  </div>
                </div>
              </div>

              {/* Pie Slices Legend Table */}
              <div className="sm:col-span-7 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7] border border-[#EAE5DC]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#18181B]" />
                    <span className="font-bold text-charcoal-900">GPT-4o</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-charcoal-900">$2,450.21</span>
                    <span className="text-[10px] text-charcoal-500 ml-1.5">(56.6%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7] border border-[#EAE5DC]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#C59E5F]" />
                    <span className="font-bold text-charcoal-900">Claude 3.5 Sonnet</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-charcoal-900">$1,301.77</span>
                    <span className="text-[10px] text-charcoal-500 ml-1.5">(30.0%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7] border border-[#EAE5DC]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#8E6B2C]" />
                    <span className="font-bold text-charcoal-900">Gemini 1.5 Pro</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-charcoal-900">$412.32</span>
                    <span className="text-[10px] text-charcoal-500 ml-1.5">(9.5%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7] border border-[#EAE5DC]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#DDD6C7]" />
                    <span className="font-bold text-charcoal-900">Mini / Haiku Failovers</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-charcoal-900">$164.34</span>
                    <span className="text-[10px] text-charcoal-500 ml-1.5">(3.9%)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#EAE5DC] text-[11px] text-charcoal-500 font-mono">
            <span>Primary driver: Code generation &amp; agents</span>
            <span>Zero quota overflows</span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* SECONDARY ROW: INPUT/OUTPUT RATIO & PROJECT SPEND SHARE      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sub-Graph 1: Prompt vs Completion Token Ratio */}
        <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-charcoal-900 font-sans">
              Prompt vs. Completion Token Split
            </h4>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Prompt caching saves up to 50% on repetitive developer context
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {modelBreakdown.slice(0, 3).map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-charcoal-900">{item.model}</span>
                  <span className="text-charcoal-500">{item.tokens} total</span>
                </div>

                <div className="h-2 w-full bg-[#F5F2EB] rounded-full overflow-hidden flex">
                  {/* Prompt tokens */}
                  <div
                    className="bg-[#18181B] h-full"
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

                <div className="flex items-center justify-between text-[10px] text-charcoal-400 font-mono">
                  <span>Prompt: {item.promptTokens}</span>
                  <span>Cache Hit: {item.cacheHitRate}</span>
                  <span>Completion: {item.completionTokens}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Graph 2: Project Spend Share */}
        <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-charcoal-900 font-sans">
              Cost Allocation by Project
            </h4>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Spend distribution across registered proxy service endpoints
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {[
              { name: 'Main Web Platform', spend: '$2,450.21', pct: 56.6, color: '#18181B' },
              { name: 'Customer Support Copilot', spend: '$1,210.43', pct: 28.0, color: '#C59E5F' },
              { name: 'Internal Coding Assistant', spend: '$412.32', pct: 9.5, color: '#8E6B2C' },
              { name: 'Checkout Fraud Detector', spend: '$164.34', pct: 3.8, color: '#DDD6C7' },
              { name: 'R&D Synthetic Lab', spend: '$91.34', pct: 2.1, color: '#C7BDAB' },
            ].map((proj, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-charcoal-900">{proj.name}</span>
                  <span>{proj.spend} ({proj.pct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#F5F2EB] rounded-full overflow-hidden">
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
      <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight font-sans">
              Provider &amp; Model Ledger
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Granular telemetry logs for upstream token volume and spend reconciliation
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EAE5DC] text-charcoal-500 font-mono text-[11px]">
                <th className="pb-3 font-semibold">Model / Provider</th>
                <th className="pb-3 font-semibold">Total Tokens</th>
                <th className="pb-3 font-semibold">Prompt / Compl.</th>
                <th className="pb-3 font-semibold">Prompt Cache</th>
                <th className="pb-3 font-semibold">Avg Latency</th>
                <th className="pb-3 font-semibold text-right">Spend</th>
                <th className="pb-3 font-semibold text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] font-mono">
              {modelBreakdown.map((row, i) => (
                <tr key={i} className="hover:bg-[#FCFAF7] transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-charcoal-900">{row.model}</div>
                    <div className="text-[10px] text-charcoal-400">{row.provider}</div>
                  </td>
                  <td className="py-3 font-bold text-charcoal-900">{row.tokens}</td>
                  <td className="py-3 text-charcoal-600">{row.promptTokens} / {row.completionTokens}</td>
                  <td className="py-3 text-emerald-700 font-bold">{row.cacheHitRate}</td>
                  <td className="py-3 text-charcoal-600">{row.avgLatency}</td>
                  <td className="py-3 text-right font-extrabold text-charcoal-900">
                    ${row.cost.toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-bold text-charcoal-600">
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
