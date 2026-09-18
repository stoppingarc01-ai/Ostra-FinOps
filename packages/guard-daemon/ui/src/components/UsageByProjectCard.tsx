import React from 'react';
import { ArrowRight } from 'lucide-react';

export const UsageByProjectCard: React.FC = () => {
  const projects = [
    { name: 'Personal Assistant', requests: 94, spend: '$18.24', percent: 85, color: '#10B981', barColor: 'bg-[#10B981]' },
    { name: 'Code Agent', requests: 67, spend: '$12.86', percent: 65, color: '#059669', barColor: 'bg-[#059669]' },
    { name: 'Research', requests: 41, spend: '$8.37', percent: 45, color: '#F59E0B', barColor: 'bg-[#F59E0B]' },
    { name: 'Side Project', requests: 22, spend: '$5.12', percent: 30, color: '#3B82F6', barColor: 'bg-[#3B82F6]' },
    { name: 'Other', requests: 9, spend: '$2.73', percent: 15, color: '#8B5CF6', barColor: 'bg-[#8B5CF6]' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between font-sans h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F5F2EB]">
        <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">Usage by Project</h3>
        <button className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 flex items-center gap-1 transition-colors cursor-pointer">
          <span>View all</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Subheadings */}
      <div className="flex items-center justify-between py-2 text-[10px] font-mono uppercase text-charcoal-400 border-b border-[#F5F2EB]">
        <div className="w-1/2">Project</div>
        <div className="w-1/4 text-right">Requests</div>
        <div className="w-1/4 text-right">Spend</div>
      </div>

      {/* Project Rows */}
      <div className="divide-y divide-[#F5F2EB] flex-1">
        {projects.map((p) => (
          <div key={p.name} className="py-2.5 space-y-1.5 hover:bg-[#FAF8F5] transition-colors rounded-lg px-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 w-1/2 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="font-semibold text-charcoal-800 truncate text-xs">{p.name}</span>
              </div>
              <div className="w-1/4 text-right font-mono text-charcoal-600 text-xs">
                {p.requests}
              </div>
              <div className="w-1/4 text-right font-mono text-charcoal-900 font-bold text-xs">
                {p.spend}
              </div>
            </div>

            {/* Horizontal Mini Progress Bar */}
            <div className="h-1.5 w-full bg-[#F5F2EB] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${p.barColor}`}
                style={{ width: `${p.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
