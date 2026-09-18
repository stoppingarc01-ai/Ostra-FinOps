import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  ChevronDown,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Share2,
  Clock,
  SlidersHorizontal,
  ArrowRight,
  Check,
  X,
  Info,
  MoreVertical
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [timeFilter, setTimeFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(3); // Default May 13 selected
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [breakdownModal, setBreakdownModal] = useState<'project' | 'model' | 'status' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  // Daily timeline points matching reference dashboard curve
  const timelinePoints = [
    { date: 'May 10', actual: 1250, forecast: 1250, budget: 5000 },
    { date: 'May 11', actual: 1950, forecast: 1950, budget: 5000 },
    { date: 'May 12', actual: 2680, forecast: 2680, budget: 5000 },
    { date: 'May 13', actual: 3426.18, forecast: 4102.49, budget: 5000 },
    { date: 'May 14', actual: null, forecast: 4620.00, budget: 5000 },
    { date: 'May 15', actual: null, forecast: 5120.00, budget: 5000 },
    { date: 'May 16', actual: null, forecast: 5540.00, budget: 5000 },
    { date: 'May 17', actual: null, forecast: 5980.00, budget: 5000 },
    { date: 'May 18', actual: null, forecast: 6420.00, budget: 5000 },
  ];

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
  const chartXStep = (chartXEnd - chartXStart) / (timelinePoints.length - 1);
  const chartYZero = 240;
  const chartYMax = 30; // $6,000 line

  const getPtX = (idx: number) => chartXStart + idx * chartXStep;
  const getPtY = (val: number) => chartYZero - (val / 6000) * (chartYZero - chartYMax);

  const actualCoords = [
    { x: getPtX(0), y: getPtY(1250) },
    { x: getPtX(1), y: getPtY(1950) },
    { x: getPtX(2), y: getPtY(2680) },
    { x: getPtX(3), y: getPtY(3426.18) },
  ];

  const forecastCoords = [
    { x: getPtX(3), y: getPtY(3426.18) },
    { x: getPtX(4), y: getPtY(4620.00) },
    { x: getPtX(5), y: getPtY(5120.00) },
    { x: getPtX(6), y: getPtY(5540.00) },
    { x: getPtX(7), y: getPtY(5980.00) },
    { x: getPtX(8), y: getPtY(6420.00) },
  ];

  const actualPathD = getSvgPath(actualCoords);
  const actualAreaD = `${actualPathD} L ${actualCoords[actualCoords.length - 1].x.toFixed(1)},${chartYZero} L ${actualCoords[0].x.toFixed(1)},${chartYZero} Z`;
  const forecastPathD = getSvgPath(forecastCoords);
  const budgetY = getPtY(5000);

  const topProjects = [
    {
      name: 'Production',
      code: 'PRD',
      spend: '$1,842.35',
      change: '+32.4%',
      isUp: true,
      tokens: '134.2M',
      requests: '36,521',
      costPer1k: '$0.0031',
      savings: '$432.18',
      bars: [30, 45, 60, 50, 75, 90, 85],
    },
    {
      name: 'Marketing AI',
      code: 'MKT',
      spend: '$876.54',
      change: '+18.7%',
      isUp: true,
      tokens: '62.1M',
      requests: '18,342',
      costPer1k: '$0.0028',
      savings: '$162.31',
      bars: [20, 35, 40, 55, 65, 70, 60],
    },
    {
      name: 'Internal Tools',
      code: 'INT',
      spend: '$645.23',
      change: '-6.3%',
      isUp: false,
      tokens: '48.7M',
      requests: '14,231',
      costPer1k: '$0.0026',
      savings: '$98.76',
      bars: [50, 45, 40, 35, 45, 40, 35],
    },
    {
      name: 'Customer Support',
      code: 'SUP',
      spend: '$512.12',
      change: '+11.9%',
      isUp: true,
      tokens: '38.2M',
      requests: '12,431',
      costPer1k: '$0.0027',
      savings: '$72.45',
      bars: [25, 30, 45, 50, 60, 65, 70],
    },
    {
      name: 'R&D Experiments',
      code: 'RND',
      spend: '$341.26',
      change: '-3.2%',
      isUp: false,
      tokens: '21.9M',
      requests: '8,207',
      costPer1k: '$0.0023',
      savings: '$34.12',
      bars: [30, 35, 25, 30, 25, 20, 22],
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-osterdGold-500/40 text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-osterdGold-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* HEADER SECTION & TOP LEVEL ACTIONS                           */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-charcoal-900 tracking-tight font-sans">
            Reports &amp; Executive Intelligence
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Comprehensive telemetry audits, spend pacing, and failover health logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Date Selector */}
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-medium text-charcoal-700 hover:bg-sandstone-100 transition-colors shadow-subtle font-mono">
            <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
            <span>May 10 - May 16, 2026</span>
            <ChevronDown className="w-3 h-3 text-charcoal-400" />
          </button>

          {/* Filters Button */}
          <button
            onClick={() => showToast('Filters applied: All production & staging routes')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EAE5DC] hover:bg-sandstone-100 text-charcoal-800 text-xs font-bold transition-all shadow-subtle"
          >
            <Filter className="w-3.5 h-3.5 text-charcoal-500" />
            <span>Filters</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => showToast('Reports data refreshed from proxy log')}
            className="p-2 rounded-xl bg-white border border-[#EAE5DC] hover:bg-sandstone-100 text-charcoal-600 transition-colors shadow-subtle"
            title="Refresh reports"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUB-NAVIGATION TABS (Exact match to reference mockup)         */}
      {/* ============================================================ */}
      <div className="border-b border-[#EAE5DC] flex items-center gap-6 overflow-x-auto text-xs font-medium">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-3.5 whitespace-nowrap transition-all relative ${
              activeSubTab === tab
                ? 'text-charcoal-900 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C59E5F]'
                : 'text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* ROW 1: TOP 4 METRIC CARDS (OsterdOps Palette)                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Spend */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500">Total Spend</span>
            <span className="text-[10px] font-mono text-charcoal-400">USD</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-charcoal-900 font-mono tracking-tight">
              $4,328.64
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-charcoal-600 mt-1">
              <TrendingUp className="w-3 h-3 text-osterdGold-600" />
              <span>↑ 28.6% vs May 3 - May 9</span>
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
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500">Total Tokens</span>
            <span className="text-[10px] font-mono text-charcoal-400">VOLUME</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-charcoal-900 font-mono tracking-tight">
              312.6M
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-charcoal-600 mt-1">
              <TrendingUp className="w-3 h-3 text-osterdGold-600" />
              <span>↑ 18.2% vs May 3 - May 9</span>
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
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500">Total Requests</span>
            <span className="text-[10px] font-mono text-charcoal-400">THROUGHPUT</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-charcoal-900 font-mono tracking-tight">
              89,732
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-charcoal-600 mt-1">
              <TrendingUp className="w-3 h-3 text-osterdGold-600" />
              <span>↑ 24.1% vs May 3 - May 9</span>
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
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500">Avg. Cost / 1K Tokens</span>
            <span className="text-[10px] font-mono text-charcoal-400">UNIT RATE</span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-charcoal-900 font-mono tracking-tight">
              $0.0028
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 mt-1">
              <TrendingDown className="w-3 h-3 text-emerald-700" />
              <span>↓ 12.5% vs May 3 - May 9</span>
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
          <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-4">
            
            {/* Header: Title + Legend on Left, Filter Toggle + Menu on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight font-sans">
                    Spend Over Time
                  </h3>
                  <Info className="w-3.5 h-3.5 text-charcoal-400 cursor-pointer hover:text-charcoal-700 transition-colors" />
                </div>
                
                {/* Reference-aligned Legend under Title */}
                <div className="flex items-center gap-4 mt-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 bg-[#18181B] rounded-full" />
                    <span className="text-charcoal-700 font-medium">Actual Spend</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 border-t border-dashed border-[#C59E5F]" />
                    <span className="text-charcoal-700 font-medium">Forecast</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 border-t border-dashed border-[#E05252]" />
                    <span className="text-charcoal-600 font-medium">Budget ($5K)</span>
                  </div>
                </div>
              </div>

              {/* Controls: Daily / Weekly / Monthly Toggle + Menu */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-[#F5F2EB] border border-[#EAE5DC]">
                  {(['Daily', 'Weekly', 'Monthly'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTimeFilter(mode)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        timeFilter === mode
                          ? 'bg-white text-charcoal-900 shadow-xs'
                          : 'text-charcoal-600 hover:text-charcoal-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => showToast('Graph display preferences opened')}
                  className="p-1.5 rounded-xl bg-white border border-[#EAE5DC] text-charcoal-500 hover:text-charcoal-900 hover:bg-sandstone-100 transition-colors shadow-xs"
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
                  className="absolute z-20 p-3.5 rounded-2xl bg-white border border-[#EAE5DC] shadow-xl text-xs space-y-2 pointer-events-none transition-all duration-150 font-mono"
                  style={{
                    left: `${(getPtX(hoveredPoint) / chartWidth) * 100}%`,
                    top: `${Math.max(12, (timelinePoints[hoveredPoint].actual !== null ? getPtY(timelinePoints[hoveredPoint].actual!) : getPtY(timelinePoints[hoveredPoint].forecast)) - 130)}px`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="font-bold text-charcoal-900 border-b border-[#EAE5DC] pb-1 flex items-center justify-between gap-4">
                    <span>{timelinePoints[hoveredPoint].date}, 2026</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">Telemetry Audit</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between gap-5">
                      <span className="flex items-center gap-1.5 text-charcoal-600">
                        <span className="w-2 h-2 rounded-full bg-[#18181B]" />
                        <span>Actual Spend:</span>
                      </span>
                      <span className="font-extrabold text-charcoal-900">
                        {timelinePoints[hoveredPoint].actual !== null ? `$${timelinePoints[hoveredPoint].actual?.toFixed(2)}` : '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                      <span className="flex items-center gap-1.5 text-charcoal-600">
                        <span className="w-2 h-2 rounded-full bg-[#C59E5F]" />
                        <span>Forecast:</span>
                      </span>
                      <span className="font-bold text-charcoal-700">
                        ${timelinePoints[hoveredPoint].forecast.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                      <span className="flex items-center gap-1.5 text-charcoal-600">
                        <span className="w-2 h-2 rounded-full bg-[#E05252]" />
                        <span>Budget Cap:</span>
                      </span>
                      <span className="font-medium text-charcoal-500">
                        ${timelinePoints[hoveredPoint].budget.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Downward indicator arrow */}
                  <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#EAE5DC] rotate-45" />
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
                        stroke="#F2EFE9"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="45"
                        y={y + 3.5}
                        textAnchor="end"
                        className="text-[10px] font-mono fill-charcoal-400 select-none"
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

                {/* Forward Forecast Line (Dashed Osterd Gold) */}
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
                          ? 'fill-charcoal-900 font-bold'
                          : 'fill-charcoal-400 hover:fill-charcoal-700'
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
            <div className="p-5 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between items-center text-center">
              <div className="w-full">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <h4 className="text-xs font-bold text-charcoal-900">Spend by Project</h4>
                  <Info className="w-3.5 h-3.5 text-charcoal-400 cursor-pointer hover:text-charcoal-700" />
                </div>

                {/* Hero Donut Chart */}
                <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F0ECE4" strokeWidth="3.6" />
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
                    <span className="text-sm font-extrabold text-charcoal-900 font-mono tracking-tight">$4,328.64</span>
                    <span className="text-[10px] text-charcoal-400 font-medium font-mono mt-0.5">Total Spend</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setBreakdownModal('project')}
                className="w-full pt-3 border-t border-[#EAE5DC] flex items-center justify-center gap-1.5 text-xs font-bold text-charcoal-900 hover:text-osterdGold-600 transition-colors group cursor-pointer"
              >
                <span>View full breakdown</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Donut 2: Spend by Model */}
            <div className="p-5 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between items-center text-center">
              <div className="w-full">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <h4 className="text-xs font-bold text-charcoal-900">Spend by Model</h4>
                  <Info className="w-3.5 h-3.5 text-charcoal-400 cursor-pointer hover:text-charcoal-700" />
                </div>

                {/* Hero Donut Chart */}
                <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F0ECE4" strokeWidth="3.6" />
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
                    <span className="text-sm font-extrabold text-charcoal-900 font-mono tracking-tight">$4,328.64</span>
                    <span className="text-[10px] text-charcoal-400 font-medium font-mono mt-0.5">Total Spend</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setBreakdownModal('model')}
                className="w-full pt-3 border-t border-[#EAE5DC] flex items-center justify-center gap-1.5 text-xs font-bold text-charcoal-900 hover:text-osterdGold-600 transition-colors group cursor-pointer"
              >
                <span>View full breakdown</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Donut 3: Requests by Status */}
            <div className="p-5 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between items-center text-center">
              <div className="w-full">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <h4 className="text-xs font-bold text-charcoal-900">Requests by Status</h4>
                  <Info className="w-3.5 h-3.5 text-charcoal-400 cursor-pointer hover:text-charcoal-700" />
                </div>

                {/* Hero Donut Chart */}
                <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F0ECE4" strokeWidth="3.6" />
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
                    <span className="text-sm font-extrabold text-charcoal-900 font-mono tracking-tight">89,732</span>
                    <span className="text-[10px] text-charcoal-400 font-medium font-mono mt-0.5">Total Requests</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setBreakdownModal('status')}
                className="w-full pt-3 border-t border-[#EAE5DC] flex items-center justify-center gap-1.5 text-xs font-bold text-charcoal-900 hover:text-osterdGold-600 transition-colors group cursor-pointer"
              >
                <span>View details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* CARD 3: TOP PROJECTS BY SPEND TABLE */}
          <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight font-sans">
                Top Projects by Spend
              </h3>
              <button 
                onClick={() => showToast('Viewing all project endpoints')}
                className="text-xs font-bold text-charcoal-700 hover:text-charcoal-950 font-mono"
              >
                View all projects →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAE5DC] text-charcoal-500 font-mono text-[11px]">
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
                <tbody className="divide-y divide-[#F5F2EB] font-mono">
                  {topProjects.map((row, i) => (
                    <tr key={i} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 font-bold text-charcoal-900">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-sandstone-200 text-charcoal-800 text-[10px] font-mono font-bold flex items-center justify-center">
                            {row.code}
                          </span>
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td className="py-3 font-extrabold text-charcoal-900">{row.spend}</td>
                      <td className="py-3">
                        <span className={`font-semibold ${row.isUp ? 'text-charcoal-800' : 'text-emerald-700'}`}>
                          {row.change}
                        </span>
                      </td>
                      <td className="py-3 text-charcoal-600">{row.tokens}</td>
                      <td className="py-3 text-charcoal-600">{row.requests}</td>
                      <td className="py-3 text-charcoal-600">{row.costPer1k}</td>
                      <td className="py-3 font-bold text-charcoal-900">{row.savings}</td>
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
          <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-4">
            <h3 className="text-xs font-bold text-charcoal-900 tracking-tight font-sans">
              Report Actions
            </h3>

            <div className="space-y-2.5">
              {/* Action 1: Generate PDF */}
              <button
                onClick={() => setPdfModalOpen(true)}
                className="w-full p-3 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] hover:border-osterdGold-500 hover:bg-white text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-sandstone-200 text-charcoal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4 text-charcoal-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-charcoal-900 font-sans">
                    Generate PDF Report
                  </div>
                  <div className="text-[11px] text-charcoal-500">
                    Download executive PDF summary
                  </div>
                </div>
              </button>

              {/* Action 2: Schedule Report */}
              <button
                onClick={() => setScheduleModalOpen(true)}
                className="w-full p-3 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] hover:border-osterdGold-500 hover:bg-white text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-sandstone-200 text-charcoal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4 text-charcoal-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-charcoal-900 font-sans">
                    Schedule Report
                  </div>
                  <div className="text-[11px] text-charcoal-500">
                    Automate reports to email / Slack
                  </div>
                </div>
              </button>

              {/* Action 3: Create Custom Report */}
              <button
                onClick={() => showToast('Opening Custom Report Query Builder')}
                className="w-full p-3 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] hover:border-osterdGold-500 hover:bg-white text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-sandstone-200 text-charcoal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <SlidersHorizontal className="w-4 h-4 text-charcoal-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-charcoal-900 font-sans">
                    Create Custom Report
                  </div>
                  <div className="text-[11px] text-charcoal-500">
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
                className="w-full p-3 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] hover:border-osterdGold-500 hover:bg-white text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-sandstone-200 text-charcoal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-charcoal-800" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-charcoal-900 font-sans">
                    Share Report
                  </div>
                  <div className="text-[11px] text-charcoal-500">
                    {copiedLink ? 'Link copied!' : 'Share telemetry insights with your team'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* CARD 2: TELEMETRY INSIGHTS (3 Items) */}
          <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-charcoal-900 tracking-tight font-sans">
                Telemetry Insights
              </h3>
              <span className="text-[10px] font-mono text-charcoal-400">LIVE</span>
            </div>

            <div className="space-y-3">
              {/* Insight 1 */}
              <div className="p-3.5 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] space-y-1.5">
                <div className="text-xs font-bold text-charcoal-900">
                  Spend Spike Detected
                </div>
                <p className="text-[11px] text-charcoal-600 leading-snug">
                  Production endpoint spend increased by <span className="font-semibold text-charcoal-900">42%</span> compared to last week.
                </p>
                <button 
                  onClick={() => showToast('Opening Production traffic drilldown')}
                  className="text-[10px] font-bold text-charcoal-900 hover:text-osterdGold-600 font-mono block pt-1"
                >
                  View Details →
                </button>
              </div>

              {/* Insight 2 */}
              <div className="p-3.5 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] space-y-1.5">
                <div className="text-xs font-bold text-charcoal-900">
                  Optimization Opportunity
                </div>
                <p className="text-[11px] text-charcoal-600 leading-snug">
                  You can save <span className="font-bold text-charcoal-900 font-mono">$742.18 (17%)</span> by applying prompt caching to Sonnet 3.5.
                </p>
                <button 
                  onClick={() => showToast('Routing optimization rules ready')}
                  className="text-[10px] font-bold text-charcoal-900 hover:text-osterdGold-600 font-mono block pt-1"
                >
                  View Recommendations →
                </button>
              </div>

              {/* Insight 3 */}
              <div className="p-3.5 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] space-y-1.5">
                <div className="text-xs font-bold text-charcoal-900">
                  Model Efficiency
                </div>
                <p className="text-[11px] text-charcoal-600 leading-snug">
                  GPT-4o unit rate is high. Consider intra-family failover to Haiku for classification calls.
                </p>
                <button 
                  onClick={() => showToast('Opening Model Analysis')}
                  className="text-[10px] font-bold text-charcoal-900 hover:text-osterdGold-600 font-mono block pt-1"
                >
                  View Model Analysis →
                </button>
              </div>
            </div>
          </div>

          {/* CARD 3: TOP COST DRIVERS */}
          <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-charcoal-900 tracking-tight font-sans">
                Top Cost Drivers
              </h3>
              <span className="text-[10px] font-mono text-charcoal-400">MTD</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7]">
                <span className="text-charcoal-700">High Token Usage</span>
                <div className="text-right">
                  <span className="font-bold text-charcoal-900">$1,842.35</span>
                  <span className="text-[10px] text-charcoal-500 ml-1.5">↑ 42%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7]">
                <span className="text-charcoal-700">Large Context Windows</span>
                <div className="text-right">
                  <span className="font-bold text-charcoal-900">$876.54</span>
                  <span className="text-[10px] text-charcoal-500 ml-1.5">↑ 18%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7]">
                <span className="text-charcoal-700">Inefficient Prompts</span>
                <div className="text-right">
                  <span className="font-bold text-charcoal-900">$645.23</span>
                  <span className="text-[10px] text-charcoal-500 ml-1.5">↑ 12%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7]">
                <span className="text-charcoal-700">Retry &amp; Failures</span>
                <div className="text-right">
                  <span className="font-bold text-charcoal-900">$512.12</span>
                  <span className="text-[10px] text-charcoal-500 ml-1.5">↑ 9%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7]">
                <span className="text-charcoal-700">Model Choice</span>
                <div className="text-right">
                  <span className="font-bold text-charcoal-900">$452.11</span>
                  <span className="text-[10px] text-charcoal-500 ml-1.5">↑ 7%</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => showToast('Opening deep cost attribution report')}
              className="text-left text-[11px] font-bold text-charcoal-900 hover:text-osterdGold-600 pt-3 border-t border-[#EAE5DC] flex items-center gap-1 group w-full"
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
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight font-sans">
                  Export Executive PDF Report
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  May 10 - May 16, 2026 Telemetry Audit
                </p>
              </div>
              <button
                onClick={() => setPdfModalOpen(false)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:bg-sandstone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-charcoal-700 font-mono">
              <div className="p-3 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] space-y-1.5">
                <div className="flex justify-between font-bold text-charcoal-900">
                  <span>Report Sections Included:</span>
                </div>
                <div className="text-[11px] text-charcoal-500 space-y-1">
                  <div>✓ Executive Spend &amp; Quota Pacing Summary</div>
                  <div>✓ Upstream LLM Breakdown (GPT-4o, Claude, Gemini)</div>
                  <div>✓ Project Endpoints &amp; Failover Recovery Logs</div>
                  <div>✓ Prompt Caching Efficiency &amp; Recommendations</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span>Document Format:</span>
                <span className="font-bold text-charcoal-900">PDF (Vector Charts • 300 DPI)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPdfModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-charcoal-600 hover:bg-sandstone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setPdfModalOpen(false);
                  showToast('Executive PDF generated and downloaded to local storage!');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-osterdGold-400" />
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
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight font-sans">
                  Schedule Automated Delivery
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Receive recurring executive spend summaries
                </p>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:bg-sandstone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-charcoal-800 block">Frequency</label>
                <select className="w-full px-3 py-2 text-xs bg-[#FCFAF7] border border-[#EAE5DC] rounded-xl text-charcoal-900 font-mono focus:outline-none focus:border-osterdGold-500">
                  <option>Weekly (Every Monday at 9:00 AM)</option>
                  <option>Monthly (1st day of each month)</option>
                  <option>Daily (Every morning at 8:00 AM)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-charcoal-800 block">Destination Channel</label>
                <input
                  type="email"
                  defaultValue="shaan@acmecorp.com"
                  placeholder="name@company.com or Slack Webhook"
                  className="w-full px-3 py-2 text-xs bg-[#FCFAF7] border border-[#EAE5DC] rounded-xl text-charcoal-900 font-mono focus:outline-none focus:border-osterdGold-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] text-[11px] text-charcoal-500">
                Delivery contains key odometer burns, spend anomalies, and recommended failovers.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-charcoal-600 hover:bg-sandstone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setScheduleModalOpen(false);
                  showToast('Automated schedule saved! First report delivers Monday 9:00 AM.');
                }}
                className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
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
            className="bg-white rounded-3xl border border-[#EAE5DC] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC]">
              <div>
                <h3 className="text-base font-extrabold text-charcoal-900 font-sans tracking-tight">
                  {breakdownModal === 'project'
                    ? 'Project Spend Breakdown'
                    : breakdownModal === 'model'
                    ? 'Model Provider Share Breakdown'
                    : 'Gateway Traffic & Reliability Breakdown'}
                </h3>
                <p className="text-xs text-charcoal-500 font-mono mt-0.5">
                  Telemetry window: May 10 – May 16, 2026
                </p>
              </div>
              <button
                onClick={() => setBreakdownModal(null)}
                className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-800 hover:bg-sandstone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Metric Banner */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between font-mono">
              <span className="text-xs text-charcoal-600 font-medium font-sans">
                {breakdownModal === 'status' ? 'Total Analyzed Requests:' : 'Total Realized Spend:'}
              </span>
              <span className="text-base font-extrabold text-charcoal-900">
                {breakdownModal === 'status' ? '89,732 requests' : '$4,328.64 USD'}
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
                { name: 'Blocked (Guardrail / Firewall)', val: '4,312 reqs', pct: 4.8, color: '#C59E5F', count: 'Zero leakage' },
                { name: 'Failed / Upstream 5xx', val: '2,145 reqs', pct: 2.4, color: '#8E6B2C', count: 'Auto-retried' },
                { name: 'Provider Rate Limits', val: '1,152 reqs', pct: 1.3, color: '#D4CABE', count: 'Fallback triggered' },
              ]).map((it) => (
                <div key={it.name} className="p-3 rounded-2xl bg-white border border-[#EAE5DC] space-y-1.5 font-mono hover:bg-[#FAF8F5] transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-charcoal-900">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
                      <span>{it.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-charcoal-900">{it.val}</span>
                      <span className="text-[11px] text-charcoal-400">({it.pct}%)</span>
                    </div>
                  </div>
                  
                  {/* Visual Allocation Bar */}
                  <div className="w-full bg-[#EAE5DC]/60 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${it.pct}%`, backgroundColor: it.color }}
                    />
                  </div>
                  <div className="text-[10px] text-charcoal-400 flex justify-between font-mono">
                    <span>{it.count}</span>
                    <span>Share of total volume</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-[#EAE5DC]">
              <button
                onClick={() => {
                  showToast('Exporting breakdown to CSV...');
                  setBreakdownModal(null);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-[#EAE5DC] hover:bg-sandstone-100 text-charcoal-700 text-xs font-bold transition-all shadow-2xs"
              >
                Export CSV
              </button>
              <button
                onClick={() => setBreakdownModal(null)}
                className="px-4 py-1.5 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
