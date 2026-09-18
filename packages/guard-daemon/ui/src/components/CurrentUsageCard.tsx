import React, { useState } from 'react';
import { ChevronDown, ArrowDownLeft, ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react';
import type { BudgetInfo, SessionSummary } from '../types';

interface CurrentUsageCardProps {
  budget: BudgetInfo;
  summary: SessionSummary;
}

export const CurrentUsageCard: React.FC<CurrentUsageCardProps> = ({
  budget,
  summary,
}) => {
  const [timeframe, setTimeframe] = useState<'session' | 'month'>('session');

  // Compute percentage based on budget ceiling
  const ceiling = Math.max(budget.ceiling, 1);
  const spent = summary.totalCostUsd;
  const percent = Math.min(Math.round((spent / ceiling) * 100), 100);

  // SVG Semi-circular Donut Gauge calculation
  const radius = 58;
  const circumference = Math.PI * radius; // 180 degrees arc
  const strokeDashoffset = circumference * (1 - percent / 100);

  const totalTokens = summary.totalInputTokens + summary.totalOutputTokens;
  const tokensFormatted = totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}K` : totalTokens.toString();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between h-[520px] font-sans min-w-[280px]">
      {/* Header with Title & Dropdown Pill */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#F5F2EB]">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#C59E5F]" />
          <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">Current Usage</h3>
        </div>
        <button
          onClick={() => setTimeframe(timeframe === 'session' ? 'month' : 'session')}
          className="text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 bg-[#F5F2EB] hover:bg-[#EAE3D2] px-2.5 py-1 rounded-lg border border-[#E8E2D5] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <span>{timeframe === 'session' ? 'This Session' : 'This Month'}</span>
          <ChevronDown className="w-3 h-3 text-charcoal-500" />
        </button>
      </div>

      {/* Radial Arc Donut Gauge */}
      <div className="my-auto flex flex-col items-center justify-center relative py-1 w-full overflow-hidden">
        <div className="w-48 sm:w-52 h-28 relative flex items-center justify-center">
          <svg viewBox="0 0 160 95" className="w-full h-full overflow-visible">
            {/* Background Arc Track */}
            <path
              d="M 15 85 A 65 65 0 0 1 145 85"
              fill="none"
              stroke="#F0ECE1"
              strokeWidth="13"
              strokeLinecap="round"
            />
            {/* Value Arc Stroke */}
            <path
              d="M 15 85 A 65 65 0 0 1 145 85"
              fill="none"
              stroke="url(#usageGradient)"
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${circumference * 1.08}`}
              strokeDashoffset={`${strokeDashoffset * 1.08}`}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="usageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C59E5F" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Metric */}
          <div className="absolute bottom-1 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-extrabold font-mono text-charcoal-900 tracking-tight">
              {percent}%
            </span>
            <span className="text-[10px] font-mono text-charcoal-500 uppercase tracking-wider mt-0.5">
              of ${ceiling.toFixed(2)} Cap
            </span>
          </div>
        </div>

        <p className="text-[11px] text-charcoal-500 text-center mt-3 font-medium px-2">
          Spending velocity is healthy & below threshold
        </p>
      </div>

      {/* Spend Progress Bar & Breakdown */}
      <div className="space-y-3.5 pt-3.5 border-t border-[#F5F2EB]">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono font-medium">
            <span className="text-charcoal-700 font-bold">Spent: ${spent.toFixed(2)}</span>
            <span className="text-charcoal-400">Limit: ${ceiling.toFixed(2)}</span>
          </div>
          <div className="h-2 w-full bg-[#F0ECE1] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C59E5F] to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>

        {/* Detailed 2-Box Token Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE4D8] min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-charcoal-500 truncate">
              <ArrowDownLeft className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">Prompt In</span>
            </div>
            <div className="text-xs font-bold font-mono text-charcoal-900 mt-1 truncate">
              {summary.totalInputTokens.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE4D8] min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-charcoal-500 truncate">
              <ArrowUpRight className="w-3 h-3 text-[#C59E5F] shrink-0" />
              <span className="truncate">Completion Out</span>
            </div>
            <div className="text-xs font-bold font-mono text-charcoal-900 mt-1 truncate">
              {summary.totalOutputTokens.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer Badge */}
        <div className="flex items-center justify-between text-[11px] font-mono text-charcoal-600 bg-[#F5F2EB] px-3 py-1.5 rounded-lg border border-[#E8E2D5]">
          <span className="flex items-center gap-1 text-emerald-800 font-semibold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Zero Leakage
          </span>
          <span className="text-charcoal-700 font-bold truncate ml-2">
            {tokensFormatted} Tokens
          </span>
        </div>
      </div>
    </div>
  );
};
