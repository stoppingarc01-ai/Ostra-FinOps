import React from 'react';
import { ModelsView } from '../components/ModelsView';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface ModelsPageProps {
  onNavigateHome?: () => void;
  onNavigatePricing?: () => void;
  onNavigateDashboard?: () => void;
}

export const ModelsPage: React.FC<ModelsPageProps> = ({
  onNavigateHome,
  onNavigatePricing,
  onNavigateDashboard,
}) => {
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-10 max-w-[1640px] mx-auto relative overflow-hidden select-none bg-[#07090C] min-h-screen text-zinc-100">
      {/* 3D Warm Ambient Radial Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#C59E5F]/10 via-[#C59E5F]/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Breadcrumb / Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.1] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </button>

        <div className="hidden sm:flex items-center gap-3">
          {onNavigateDashboard && (
            <button
              onClick={onNavigateDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.1] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span>Open in Console</span>
            </button>
          )}
          <button
            onClick={onNavigatePricing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#07090C] hover:brightness-110 text-xs font-bold font-sans transition-all cursor-pointer"
          >
            <span>View Pricing</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#07090C]" />
          </button>
        </div>
      </div>

      {/* Exact Replica of AI Models & Specifications Catalog */}
      <div className="relative">
        <ModelsView />
      </div>

      {/* Bottom Developer Callout Strip */}
      <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#0B0E14] text-white border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#E5C38D] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to track your model spend?</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display text-zinc-100">
            Track token usage, set hard spend limits, and keep your AI bills under control.
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-[#07090C] border border-white/[0.1] font-mono text-xs text-zinc-200">
            <span className="text-zinc-500">$</span> npx ostraops
          </div>
          <button
            onClick={onNavigatePricing}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#07090C] hover:brightness-110 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
};
