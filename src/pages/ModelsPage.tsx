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
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-10 max-w-[1640px] mx-auto relative overflow-hidden select-none">
      {/* 3D Warm Ambient Radial Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-osterdGold-400/10 via-sandstone-300/15 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Breadcrumb / Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-sandstone-100 text-charcoal-600 hover:text-charcoal-900 border border-[#EAE5DB] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </button>

        <div className="hidden sm:flex items-center gap-3">
          {onNavigateDashboard && (
            <button
              onClick={onNavigateDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-sandstone-100 text-charcoal-700 border border-[#EAE5DB] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span>Open in Console</span>
            </button>
          )}
          <button
            onClick={onNavigatePricing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sandstone-200 hover:bg-sandstone-300 text-charcoal-800 text-xs font-bold font-mono transition-colors cursor-pointer"
          >
            <span>View Pricing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Exact Replica of AI Models & Specifications Catalog */}
      <div className="relative">
        <ModelsView />
      </div>

      {/* Bottom Developer Callout Strip */}
      <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-charcoal-950 text-white border border-charcoal-800 shadow-dashboard-3d flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-osterdGold-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to route these models locally?</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display text-zinc-100">
            Intercept every model call in Cursor, Cline, and Windsurf with 0.42ms overhead.
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-800 font-mono text-xs text-zinc-300">
            <span className="text-zinc-500">$</span> npx osterdops-guard
          </div>
          <button
            onClick={onNavigatePricing}
            className="px-5 py-2.5 rounded-full bg-osterdGold-500 hover:bg-osterdGold-400 text-charcoal-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
};
