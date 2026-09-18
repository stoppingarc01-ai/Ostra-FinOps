import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Clock
} from 'lucide-react';

interface DataPoint {
  time: string;
  unmanaged: number; // in $
  actual: number;    // in $
  model: string;
  tokens: string;
  failoverActive?: boolean;
  notes?: string;
}

type Timeframe = '24h' | '7d' | '30d';

const DATA_24H: DataPoint[] = [
  { time: '00:00', unmanaged: 180, actual: 180, model: 'Claude 3.7 Sonnet', tokens: '640k', failoverActive: false },
  { time: '03:00', unmanaged: 340, actual: 330, model: 'Claude 3.7 Sonnet', tokens: '1.2M', failoverActive: false },
  { time: '06:00', unmanaged: 590, actual: 520, model: 'Claude 3.7 Sonnet', tokens: '1.8M', failoverActive: false },
  { time: '09:00', unmanaged: 980, actual: 810, model: 'Claude 3.7 Sonnet', tokens: '2.9M', failoverActive: false },
  { time: '12:00', unmanaged: 1490, actual: 1120, model: 'Claude 3.7 Sonnet', tokens: '4.2M', failoverActive: false },
  { time: '14:30', unmanaged: 2180, actual: 1290, model: '⚡ Failover: Haiku 3.5', tokens: '6.8M', failoverActive: true, notes: 'Velocity Cap Hit ($1.80/min) → Routed to Claude 3.5 Haiku' },
  { time: '17:00', unmanaged: 2840, actual: 1410, model: 'Claude 3.5 Haiku', tokens: '8.4M', failoverActive: true },
  { time: '20:00', unmanaged: 3260, actual: 1540, model: 'Claude 3.5 Haiku', tokens: '9.6M', failoverActive: true },
  { time: 'Now',   unmanaged: 3580, actual: 1620, model: 'Claude 3.5 Haiku', tokens: '10.8M', failoverActive: true },
];

const DATA_7D: DataPoint[] = [
  { time: 'Mon', unmanaged: 1200, actual: 1150, model: 'Claude 3.7 Sonnet', tokens: '4.1M', failoverActive: false },
  { time: 'Tue', unmanaged: 2450, actual: 1980, model: 'Claude 3.7 Sonnet', tokens: '7.8M', failoverActive: false },
  { time: 'Wed', unmanaged: 3900, actual: 2600, model: '⚡ Failover: Haiku 3.5', tokens: '12.4M', failoverActive: true, notes: 'Spike Protection Engaged' },
  { time: 'Thu', unmanaged: 5600, actual: 3250, model: 'Claude 3.5 Haiku', tokens: '18.1M', failoverActive: true },
  { time: 'Fri', unmanaged: 7400, actual: 3890, model: 'Claude 3.5 Haiku', tokens: '24.6M', failoverActive: true },
  { time: 'Sat', unmanaged: 8800, actual: 4320, model: 'Claude 3.7 Sonnet', tokens: '28.2M', failoverActive: false },
  { time: 'Sun', unmanaged: 9950, actual: 4680, model: 'Claude 3.5 Haiku', tokens: '31.0M', failoverActive: true },
];

const DATA_30D: DataPoint[] = [
  { time: 'Week 1', unmanaged: 4200, actual: 3800, model: 'Claude 3.7 Sonnet', tokens: '15.4M', failoverActive: false },
  { time: 'Week 2', unmanaged: 9800, actual: 6900, model: '⚡ Failover: Haiku 3.5', tokens: '38.2M', failoverActive: true, notes: 'Multiple loop limits caught' },
  { time: 'Week 3', unmanaged: 16400, actual: 10400, model: 'Claude 3.5 Haiku', tokens: '64.1M', failoverActive: true },
  { time: 'Week 4', unmanaged: 24800, actual: 13950, model: 'Claude 3.5 Haiku', tokens: '92.8M', failoverActive: true },
];

export const SpendVelocityChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const dataset = useMemo(() => {
    switch (timeframe) {
      case '7d': return DATA_7D;
      case '30d': return DATA_30D;
      default: return DATA_24H;
    }
  }, [timeframe]);

  // Chart coordinate mapping
  const width = 640;
  const height = 210;
  const padding = { top: 25, right: 30, bottom: 35, left: 55 };

  const maxVal = useMemo(() => {
    const rawMax = Math.max(...dataset.map(d => d.unmanaged));
    return Math.ceil((rawMax * 1.15) / 500) * 500;
  }, [dataset]);

  const getX = (index: number) => {
    const availableWidth = width - padding.left - padding.right;
    return padding.left + (index / (dataset.length - 1)) * availableWidth;
  };

  const getY = (val: number) => {
    const availableHeight = height - padding.top - padding.bottom;
    const ratio = Math.max(0, Math.min(1, val / maxVal));
    return height - padding.bottom - ratio * availableHeight;
  };

  // Generate SVG cubic bezier path
  const makeSmoothPath = (values: number[]) => {
    if (values.length < 2) return '';
    const points = values.map((v, i) => ({ x: getX(i), y: getY(v) }));
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const actualPath = makeSmoothPath(dataset.map(d => d.actual));
  const unmanagedPath = makeSmoothPath(dataset.map(d => d.unmanaged));

  // Area under actual path
  const actualAreaPath = `${actualPath} L ${getX(dataset.length - 1)},${height - padding.bottom} L ${getX(0)},${height - padding.bottom} Z`;

  // Shaded savings zone between unmanaged and actual
  const pointsActual = dataset.map((_, i) => ({ x: getX(i), y: getY(dataset[i].actual) }));
  const savingsArea = `${unmanagedPath} L ${pointsActual[pointsActual.length - 1].x},${pointsActual[pointsActual.length - 1].y} ` +
    pointsActual.slice().reverse().map((p, i) => (i === 0 ? '' : `L ${p.x},${p.y}`)).join(' ') +
    ` Z`;

  const activePoint = hoverIndex !== null ? dataset[hoverIndex] : dataset[dataset.length - 1];
  const totalSaved = dataset[dataset.length - 1].unmanaged - dataset[dataset.length - 1].actual;
  const savedPercent = Math.round((totalSaved / dataset[dataset.length - 1].unmanaged) * 100);

  // Y-axis grid levels
  const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  return (
    <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between transition-all duration-300">
      
      {/* Header Bar */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight flex items-center gap-2">
                <span>Spend Velocity &amp; Intra-Family Failover</span>
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Active Protection
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Live token expenditures showing actual spend vs. unmanaged run-rate.
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Timeframe pill selector */}
            <div className="flex items-center p-0.5 rounded-xl bg-[#F5F2EB] border border-[#E8E2D5] text-xs font-mono">
              {(['24h', '7d', '30d'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    setTimeframe(tf);
                    setHoverIndex(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
                    timeframe === tf
                      ? 'bg-white text-charcoal-900 shadow-xs'
                      : 'text-charcoal-500 hover:text-charcoal-900'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Local Proxy status */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sandstone-200 border border-sandstone-300 text-[10px] font-mono font-bold text-charcoal-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline">PROXY</span> 127.0.0.1:8080
            </span>
          </div>
        </div>

        {/* Live Headline Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 p-3 rounded-2xl bg-[#FCFAF7] border border-[#EAE4D8]">
          <div className="space-y-0.5">
            <span className="text-[10.5px] font-medium text-charcoal-500">Current Managed Spend</span>
            <div className="text-base sm:text-lg font-extrabold text-charcoal-900 font-mono tracking-tight flex items-baseline gap-1">
              <span>${dataset[dataset.length - 1].actual.toLocaleString()}</span>
              <span className="text-[10px] font-normal text-emerald-600 font-mono">Controlled</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10.5px] font-medium text-charcoal-500">Unmanaged Run-Rate</span>
            <div className="text-base sm:text-lg font-extrabold text-charcoal-400 line-through font-mono tracking-tight">
              ${dataset[dataset.length - 1].unmanaged.toLocaleString()}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10.5px] font-medium text-charcoal-500">Circuit Breaker Savings</span>
            <div className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono tracking-tight flex items-center gap-1">
              <span>${totalSaved.toLocaleString()}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                +{savedPercent}%
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10.5px] font-medium text-charcoal-500">Active Routing Model</span>
            <div className="text-xs sm:text-sm font-bold text-charcoal-800 font-mono truncate flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-osterdGold-500 shrink-0" />
              <span className="truncate">{activePoint.model.replace('⚡ ', '')}</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div 
          className="relative w-full select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <svg 
            className="w-full h-56 sm:h-64 overflow-visible" 
            viewBox={`0 0 ${width} ${height}`} 
            preserveAspectRatio="none"
          >
            <defs>
              {/* Gradient for Managed Spend Area */}
              <linearGradient id="managedSpendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C59E5F" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#C59E5F" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#C59E5F" stopOpacity="0.00" />
              </linearGradient>

              {/* Shaded Savings Zone Gradient */}
              <linearGradient id="savingsZoneGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
              </linearGradient>

              {/* Glow filter for active point */}
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#C59E5F" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((tickVal, idx) => {
              const y = getY(tickVal);
              return (
                <g key={idx}>
                  <line 
                    x1={padding.left} 
                    y1={y} 
                    x2={width - padding.right} 
                    y2={y} 
                    stroke="#F0ECE3" 
                    strokeDasharray={idx === 0 ? undefined : "3 3"} 
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fill="#A8A29E"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    ${tickVal >= 1000 ? `${(tickVal / 1000).toFixed(1)}k` : tickVal}
                  </text>
                </g>
              );
            })}

            {/* X-Axis Timestamps */}
            {dataset.map((d, i) => {
              const x = getX(i);
              return (
                <g key={i}>
                  <line 
                    x1={x} 
                    y1={height - padding.bottom} 
                    x2={x} 
                    y2={height - padding.bottom + 4} 
                    stroke="#D6D3D1" 
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={height - padding.bottom + 16}
                    textAnchor="middle"
                    fill={hoverIndex === i ? '#1C1917' : '#78716C'}
                    fontSize="10"
                    fontWeight={hoverIndex === i ? '700' : '500'}
                    fontFamily="sans-serif"
                  >
                    {d.time}
                  </text>
                </g>
              );
            })}

            {/* Protected / Saved Area Delta Zone */}
            <path
              d={savingsArea}
              fill="url(#savingsZoneGrad)"
            />

            {/* Managed Spend Area Fill */}
            <path
              d={actualAreaPath}
              fill="url(#managedSpendGrad)"
            />

            {/* Unmanaged Run-Rate Line (Dashed Charcoal/Zinc) */}
            <path
              d={unmanagedPath}
              fill="none"
              stroke="#A8A29E"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />

            {/* Managed Spend Line (Solid Rich OsterdGold) */}
            <path
              d={actualPath}
              fill="none"
              stroke="#C59E5F"
              strokeWidth="3.2"
              strokeLinecap="round"
              filter="url(#goldGlow)"
            />

            {/* Failover Circuit Breaker Marker (Vertical callout) */}
            {(() => {
              const failoverIdx = dataset.findIndex(d => d.failoverActive);
              if (failoverIdx !== -1) {
                const fx = getX(failoverIdx);
                const fyActual = getY(dataset[failoverIdx].actual);
                return (
                  <g className="animate-in fade-in duration-500">
                    <line
                      x1={fx}
                      y1={padding.top}
                      x2={fx}
                      y2={height - padding.bottom}
                      stroke="#EAB308"
                      strokeWidth="1.2"
                      strokeDasharray="2 2"
                      opacity="0.8"
                    />
                    <circle
                      cx={fx}
                      cy={fyActual}
                      r="7"
                      fill="#FEF08A"
                      opacity="0.5"
                      className="animate-ping"
                    />
                    <circle
                      cx={fx}
                      cy={fyActual}
                      r="4.5"
                      fill="#CA8A04"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  </g>
                );
              }
              return null;
            })()}

            {/* Interactive Points on Managed Curve */}
            {dataset.map((pt, i) => {
              const cx = getX(i);
              const cy = getY(pt.actual);
              const isHovered = hoverIndex === i;
              const isLast = i === dataset.length - 1;

              return (
                <g 
                  key={i} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                >
                  {/* Invisible larger hit target */}
                  <circle cx={cx} cy={cy} r="16" fill="transparent" />

                  {/* Outer ring on hover/last */}
                  {(isHovered || isLast) && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? '8' : '6'}
                      fill={pt.failoverActive ? '#FEF08A' : '#F7E7CD'}
                      opacity="0.8"
                      className="transition-all duration-200"
                    />
                  )}

                  {/* Core node */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? '5' : '4'}
                    fill={pt.failoverActive ? '#854D0E' : (isLast ? '#18181B' : '#FFFFFF')}
                    stroke={pt.failoverActive ? '#EAB308' : '#C59E5F'}
                    strokeWidth="2.5"
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}

            {/* Hover Crosshair Vertical Line */}
            {hoverIndex !== null && (
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={height - padding.bottom}
                stroke="#18181B"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.35"
              />
            )}
          </svg>

          {/* Floating Hover Tooltip (HTML DOM for crisp typography) */}
          {hoverIndex !== null && (
            <div 
              className="absolute pointer-events-none z-20 top-2 transform -translate-x-1/2 bg-charcoal-900 text-white p-3 rounded-xl shadow-xl border border-charcoal-700 text-xs font-sans w-52 animate-in fade-in zoom-in-95 duration-150"
              style={{
                left: `${(getX(hoverIndex) / width) * 100}%`,
              }}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-charcoal-800 text-[11px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-osterdGold-400" />
                  {dataset[hoverIndex].time}
                </span>
                <span className="text-emerald-400 font-bold">
                  Saved ${ (dataset[hoverIndex].unmanaged - dataset[hoverIndex].actual).toLocaleString() }
                </span>
              </div>

              <div className="pt-2 space-y-1 font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-osterdGold-500" />
                    Managed:
                  </span>
                  <span className="font-bold text-white">
                    ${dataset[hoverIndex].actual.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-zinc-500" />
                    Unmanaged:
                  </span>
                  <span className="text-zinc-400 line-through">
                    ${dataset[hoverIndex].unmanaged.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10.5px] pt-1 text-zinc-300">
                  <span className="text-zinc-400">Model:</span>
                  <span className="truncate max-w-[110px] text-right font-sans font-semibold text-osterdGold-300">
                    {dataset[hoverIndex].model}
                  </span>
                </div>

                {dataset[hoverIndex].notes && (
                  <div className="pt-1.5 mt-1 border-t border-charcoal-800 text-[10px] text-amber-300 leading-tight font-sans">
                    ⚡ {dataset[hoverIndex].notes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Legend & Safeguard Summary */}
      <div className="pt-4 mt-2 border-t border-[#F0ECE4] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-osterdGold-500" />
            <span className="text-charcoal-700 font-sans font-medium">Controlled Run-Rate (OsterdOps)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-stone-400 border-dashed border-b" />
            <span className="text-charcoal-500 font-sans">Base Unmanaged Spend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
            <span className="text-charcoal-600 font-sans font-medium">Protected Delta Zone</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-charcoal-600 font-sans">
          <span>Protected Savings:</span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold">
            ${totalSaved.toLocaleString()}
          </span>
        </div>
      </div>

    </div>
  );
};
