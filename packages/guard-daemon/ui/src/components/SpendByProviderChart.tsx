import React from 'react';
import type { TraceRecord } from '../types';

interface SpendByProviderChartProps {
  traces?: TraceRecord[];
  totalCostUsd?: number;
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: '#0C2419',
  anthropic: '#10B981',
  deepseek: '#86B995',
  google: '#34D399',
  other: '#C8E4D0',
};

export const SpendByProviderChart: React.FC<SpendByProviderChartProps> = ({
  traces = [],
  totalCostUsd = 0,
}) => {
  // Aggregate spend by provider from real traces
  const providerSpendMap: Record<string, number> = {};
  let computedTotal = 0;

  for (const t of traces) {
    const prov = (t.provider || 'other').toLowerCase();
    providerSpendMap[prov] = (providerSpendMap[prov] || 0) + (t.costUsd || 0);
    computedTotal += t.costUsd || 0;
  }

  const effectiveTotal = totalCostUsd > 0 ? totalCostUsd : computedTotal;

  const providers = Object.entries(providerSpendMap).map(([name, amount]) => {
    const percent = effectiveTotal > 0 ? Math.round((amount / effectiveTotal) * 100) : 0;
    const displayName =
      name === 'openai'
        ? 'OpenAI'
        : name === 'anthropic'
        ? 'Anthropic'
        : name === 'deepseek'
        ? 'DeepSeek'
        : name.charAt(0).toUpperCase() + name.slice(1);

    return {
      name: displayName,
      percent,
      amount: `$${amount.toFixed(amount < 0.01 ? 4 : 2)}`,
      color: PROVIDER_COLORS[name] || '#94A3B8',
    };
  });

  // Calculate SVG donut paths
  const radius = 56;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between h-[320px] font-sans cursor-analytic-pointer">
      {/* Header */}
      <div className="pb-3 border-b border-[#F5F2EB]">
        <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">Spend by Provider</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
        {/* SVG Donut Chart */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            {providers.length === 0 ? (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#F0ECE1"
                strokeWidth={strokeWidth}
              />
            ) : (
              providers.map((p) => {
                const dash = (p.percent / 100) * circumference;
                const offset = -((accumulatedPercent / 100) * circumference);
                accumulatedPercent += p.percent;

                return (
                  <circle
                    key={p.name}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={p.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={offset}
                    className="transition-all duration-500 hover:opacity-85"
                  />
                );
              })
            )}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-bold font-mono text-charcoal-900 leading-tight">
              ${effectiveTotal.toFixed(effectiveTotal < 0.01 && effectiveTotal > 0 ? 4 : 2)}
            </span>
            <span className="text-[10px] text-charcoal-500 font-medium">
              Total Spend
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full space-y-2">
          {providers.length === 0 ? (
            <div className="text-center py-6 text-xs text-charcoal-400">
              No provider calls yet. Send requests to the local proxy to see live breakdown.
            </div>
          ) : (
            providers.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-charcoal-800 font-medium text-xs">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-charcoal-400">{p.percent}%</span>
                  <span className="text-charcoal-900 font-bold w-14 text-right">{p.amount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer / Quick Tip */}
      <div className="pt-3 border-t border-[#F5F2EB] flex items-center justify-between text-[11px] text-charcoal-500">
        <span>Dual-protocol gateway</span>
        <span className="font-mono text-emerald-700 font-semibold">OpenAI & Anthropic</span>
      </div>
    </div>
  );
};
