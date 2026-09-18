import React from 'react';
import { ArrowRight } from 'lucide-react';
import { RobotMascot } from './RobotMascot';

export const OptimizationBanner: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#071A12',
        background: 'linear-gradient(135deg, #05140E 0%, #0C261B 50%, #040E0A 100%)',
      }}
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-[#1A3E2C] flex items-center justify-between gap-4"
    >
      {/* Background ambient lighting */}
      <div className="absolute right-1/3 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left: Mascot & Text */}
      <div className="flex items-center gap-4 relative z-10 min-w-0">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center p-1">
          <RobotMascot size={42} />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-white tracking-tight">
            Optimize your AI usage
          </h4>
          <p className="text-xs text-[#9EC4AE] mt-0.5 truncate">
            Get personalized recommendations to reduce costs and improve performance.
          </p>
        </div>
      </div>

      {/* Right: Button */}
      <div className="shrink-0 relative z-10">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#071A12] hover:bg-[#FAF8F5] text-xs font-bold transition-all shadow-sm hover:scale-[1.02] cursor-pointer">
          <span>View Recommendations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
