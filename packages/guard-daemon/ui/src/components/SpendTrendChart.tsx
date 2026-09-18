import React, { useState } from 'react';
import type { TraceRecord } from '../types';

interface SpendTrendChartProps {
  traces?: TraceRecord[];
}

export const SpendTrendChart: React.FC<SpendTrendChartProps> = ({ traces = [] }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Generate last 7 days buckets
  const now = new Date();
  const dayBuckets: { dateStr: string; label: string; actual: number; est: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dayBuckets.push({ dateStr, label, actual: 0, est: 0 });
  }

  // Populate from traces
  for (const t of traces) {
    const traceDateStr = new Date(t.timestamp).toISOString().split('T')[0];
    const bucket = dayBuckets.find((b) => b.dateStr === traceDateStr);
    if (bucket) {
      bucket.actual += t.costUsd || 0;
    }
  }

  // Add a small projection for 'est' (estimated next day spend based on run-rate)
  for (const b of dayBuckets) {
    b.est = b.actual * 1.15;
  }

  const maxSpend = Math.max(...dayBuckets.map((d) => Math.max(d.actual, d.est)), 0.05);
  const maxVal = Math.ceil(maxSpend * 1.2 * 100) / 100;
  const chartHeight = 160;
  const chartWidth = 420;
  const colWidth = chartWidth / dayBuckets.length;

  const points = dayBuckets.map((d, i) => {
    const x = i * colWidth + colWidth / 2;
    const y = chartHeight - (d.actual / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`;
  }, '');

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between h-[320px] font-sans cursor-analytic-pointer">
      {/* Chart Header & Legend */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F5F2EB]">
        <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">Spend Trend (7 Days)</h3>
        <div className="flex items-center gap-4 text-xs font-medium text-charcoal-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0C2419]" />
            <span className="text-[11px]">Actual Spend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B8E2CC]" />
            <span className="text-[11px]">Estimated Run-rate</span>
          </div>
        </div>
      </div>

      {/* SVG Combined Bar & Line Chart Area */}
      <div className="relative flex-1 flex items-center justify-between pt-2">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between h-[160px] text-[10px] font-mono text-charcoal-400 pr-2 select-none">
          <span>${maxVal.toFixed(2)}</span>
          <span>${(maxVal * 0.75).toFixed(2)}</span>
          <span>${(maxVal * 0.5).toFixed(2)}</span>
          <span>${(maxVal * 0.25).toFixed(2)}</span>
          <span>$0.00</span>
        </div>

        {/* Chart SVG */}
        <div className="flex-1 h-[190px] relative">
          <svg viewBox={`0 0 ${chartWidth} 190`} className="w-full h-full overflow-visible">
            {/* Grid horizontal dashed lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
              <line
                key={i}
                x1="0"
                y1={chartHeight * p}
                x2={chartWidth}
                y2={chartHeight * p}
                stroke="#F0ECE1"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Estimated Spend Bars */}
            {points.map((pt, i) => {
              const barH = Math.max(2, (pt.est / maxVal) * chartHeight);
              const barW = 22;
              return (
                <rect
                  key={`est-${i}`}
                  x={pt.x - barW / 2}
                  y={chartHeight - barH}
                  width={barW}
                  height={barH}
                  rx="4"
                  fill="#E5F2EB"
                  className="transition-all"
                />
              );
            })}

            {/* Connecting Actual Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#0C2419"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Actual Spend Circles */}
            {points.map((pt, i) => (
              <g key={`pt-${i}`} className="cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIdx === i ? 5 : 3.5}
                  fill="#0C2419"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-200"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            ))}

            {/* X-Axis Labels */}
            {points.map((pt, i) => (
              <text
                key={`lbl-${i}`}
                x={pt.x}
                y={chartHeight + 18}
                textAnchor="middle"
                className="text-[10px] fill-charcoal-400 font-sans font-medium"
              >
                {pt.label}
              </text>
            ))}

            {/* Custom Interactive Gradient Cursor Hover Icon */}
            {hoveredIdx !== null && (
              <g transform={`translate(${points[hoveredIdx].x - 6}, ${points[hoveredIdx].y - 32})`} className="pointer-events-none transition-all duration-150">
                <image
                  href="/custom-cursor-green-32.png"
                  width="22"
                  height="22"
                  className="filter drop-shadow-md"
                />
              </g>
            )}
          </svg>

          {/* Hover Tooltip */}
          {hoveredIdx !== null && (
            <div
              className="absolute pointer-events-none bg-charcoal-900 text-white text-[10px] font-mono px-3 py-1.5 rounded-xl shadow-xl -translate-x-1/2 -translate-y-full flex flex-col items-center gap-0.5 z-20 border border-charcoal-700/80"
              style={{
                left: `${(points[hoveredIdx].x / chartWidth) * 100}%`,
                top: `${points[hoveredIdx].y - 36}px`,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-sans font-semibold text-charcoal-200">
                  {points[hoveredIdx].label}
                </span>
              </div>
              <span className="font-bold text-emerald-300 text-xs">
                ${points[hoveredIdx].actual.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
