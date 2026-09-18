import React from 'react';
import { DollarSign, Layers, ArrowDownLeft, ArrowUpRight, ArrowDown, ArrowUp } from 'lucide-react';
import type { SessionSummary } from '../types';

interface AnalyticsStatCardsProps {
  summary: SessionSummary;
}

export const AnalyticsStatCards: React.FC<AnalyticsStatCardsProps> = ({ summary }) => {
  const formatTokens = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const cards = [
    {
      title: 'Total Spend',
      value: `$${summary.totalCostUsd.toFixed(summary.totalCostUsd < 0.01 && summary.totalCostUsd > 0 ? 4 : 2)}`,
      change: summary.totalRequests > 0 ? 'Live' : '0%',
      isUp: summary.totalCostUsd > 0,
      subtext: 'active session spend',
      icon: DollarSign,
      sparkline: 'M0,25 Q15,20 30,22 T60,18 T90,26 T120,10',
    },
    {
      title: 'Total Requests',
      value: summary.totalRequests.toLocaleString(),
      change: summary.totalRequests > 0 ? `${summary.totalRequests} calls` : 'Idle',
      isUp: true,
      subtext: 'intercepted calls',
      icon: Layers,
      sparkline: 'M0,28 Q15,22 30,25 T60,14 T90,20 T120,8',
    },
    {
      title: 'Input Tokens',
      value: formatTokens(summary.totalInputTokens),
      change: `${formatTokens(summary.totalInputTokens)}`,
      isUp: false,
      subtext: 'prompt volume',
      icon: ArrowDownLeft,
      sparkline: 'M0,22 Q15,24 30,19 T60,25 T90,16 T120,12',
    },
    {
      title: 'Output Tokens',
      value: formatTokens(summary.totalOutputTokens),
      change: `${formatTokens(summary.totalOutputTokens)}`,
      isUp: true,
      subtext: 'completion volume',
      icon: ArrowUpRight,
      sparkline: 'M0,26 Q15,20 30,24 T60,12 T90,18 T120,6',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle hover:border-[#DDD6C7] transition-all flex flex-col justify-between"
          >
            {/* Header with Title and Circle Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal-600">
                {card.title}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#E5F2EB] text-[#0C2419] flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#0E432F]" />
              </div>
            </div>

            {/* Bottom Row with Value, Trend, and SVG Sparkline */}
            <div className="flex items-end justify-between mt-3">
              <div>
                <div className="text-2xl font-bold font-mono text-charcoal-900 tracking-tight">
                  {card.value}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center text-[11px] font-bold font-mono text-emerald-700 bg-[#E5F2EB] px-1.5 py-0.2 rounded">
                    {card.isUp ? (
                      <ArrowUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="w-3 h-3 mr-0.5" />
                    )}
                    {card.change}
                  </span>
                  <span className="text-[11px] text-charcoal-400">
                    {card.subtext}
                  </span>
                </div>
              </div>

              {/* Green SVG Sparkline */}
              <div className="w-24 h-10 shrink-0">
                <svg viewBox="0 0 120 35" className="w-full h-full overflow-visible">
                  <path
                    d={card.sparkline}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
