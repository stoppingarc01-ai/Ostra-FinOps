import React from 'react';
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  XCircle,
} from 'lucide-react';
import type { TraceRecord } from '../types';

interface RightRailInsightsProps {
  traces?: TraceRecord[];
  onSelectTrace?: (trace: TraceRecord) => void;
}

export const RightRailInsights: React.FC<RightRailInsightsProps> = ({
  traces = [],
  onSelectTrace,
}) => {
  const insights = [
    {
      title: 'Model Optimization Opportunity',
      desc: 'Switching from GPT-4o to GPT-4o-mini could save ~62% on costs.',
      icon: Lightbulb,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Unusual Token Spike',
      desc: 'DeepSeek usage increased by 340% in the last 24 hours.',
      icon: TrendingUp,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Budget Status',
      desc: "You're at 62% of your monthly limit. ~$301.68 remaining.",
      icon: ShieldCheck,
      color: 'text-emerald-700 bg-emerald-50',
    },
    {
      title: 'Best Performing Model',
      desc: 'Claude 3.7 Sonnet has the lowest latency (1.2s) with high quality (92%).',
      icon: Star,
      color: 'text-blue-600 bg-blue-50',
    },
  ];

  const defaultActivities = [
    {
      title: 'Request completed',
      desc: 'GPT-4o • 1,248 tokens • $0.018',
      time: '2m ago',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Budget threshold warning',
      desc: 'Project: Code Agent • 78% used',
      time: '14m ago',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Model switch (fallback)',
      desc: 'Claude -> Claude 3.5 Haiku',
      time: '27m ago',
      icon: RefreshCw,
      color: 'text-emerald-700 bg-emerald-50',
    },
    {
      title: 'New virtual key created',
      desc: 'ost_live_8F2A******',
      time: '1h ago',
      icon: Key,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Request failed',
      desc: 'DeepSeek • 503 Service Unavailable',
      time: '2h ago',
      icon: XCircle,
      color: 'text-rose-600 bg-rose-50',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Top Insights Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle">
        <div className="flex items-center gap-2 pb-3.5 border-b border-[#F5F2EB] mb-3">
          <Sparkles className="w-4 h-4 text-[#C59E5F]" />
          <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">Top Insights</h3>
        </div>

        <div className="space-y-2.5">
          {insights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-3 rounded-xl border border-[#F5F2EB] hover:border-[#E8E2D5] hover:bg-[#FAF8F5] transition-all cursor-pointer group flex items-start gap-3"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-charcoal-900 leading-tight">
                      {item.title}
                    </h4>
                    <ChevronRight className="w-3 h-3 text-charcoal-300 group-hover:text-charcoal-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Recent Activity Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F5F2EB] mb-3">
          <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">Recent Activity</h3>
          <button className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 flex items-center gap-1 transition-colors cursor-pointer">
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-[#F5F2EB]">
          {defaultActivities.map((act, i) => {
            const Icon = act.icon;
            return (
              <div
                key={i}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors rounded-lg px-1 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${act.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-charcoal-900 leading-tight truncate">
                      {act.title}
                    </h5>
                    <p className="text-[10.5px] text-charcoal-500 font-mono mt-0.5 truncate">
                      {act.desc}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-charcoal-400 shrink-0">
                  {act.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
