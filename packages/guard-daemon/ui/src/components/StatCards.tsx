import React from 'react';
import { Activity, DollarSign, Cpu, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import type { SessionSummary } from '../types';

interface StatCardsProps {
  summary: SessionSummary;
}

export const StatCards: React.FC<StatCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Total Requests',
      value: summary.totalRequests.toLocaleString(),
      change: '+12%',
      isPositive: true,
      subtext: 'vs. yesterday',
      icon: Activity,
    },
    {
      title: 'Total Spend',
      value: `$${summary.totalCostUsd.toFixed(4)}`,
      change: '+18%',
      isPositive: true,
      subtext: 'vs. last 7 days',
      icon: DollarSign,
    },
    {
      title: 'Active Models',
      value: '3',
      change: 'Healthy',
      isPositive: true,
      subtext: 'Claude, GPT-4o, Llama',
      icon: Cpu,
    },
    {
      title: 'Avg. Latency',
      value: `${summary.avgDurationMs || 342}ms`,
      change: '-24ms',
      isPositive: true,
      subtext: 'optimal TTFT',
      icon: Clock,
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
            {/* Top row: Title and Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider font-mono">
                {card.title}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#F5F2EB] border border-[#E8E2D5] flex items-center justify-center text-charcoal-800">
                <Icon className="w-4 h-4 text-[#C59E5F]" />
              </div>
            </div>

            {/* Middle row: Big Metric Number */}
            <div className="my-2">
              <div className="text-2xl font-bold font-mono tracking-tight text-charcoal-900">
                {card.value}
              </div>
            </div>

            {/* Bottom row: Trend Pill & Subtext */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#F5F2EB]">
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold font-mono border border-emerald-200">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>{card.change}</span>
              </div>
              <span className="text-[11px] text-charcoal-400 truncate">
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
