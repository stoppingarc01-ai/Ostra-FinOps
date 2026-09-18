import React, { useState } from 'react';
import { ArrowRight, Terminal, Copy, Check, ShieldCheck, Zap, Layers, Activity } from 'lucide-react';
import { HeroDashboard3D } from './HeroDashboard3D';
import { AnthropicLogo, OpenAILogo, GeminiLogo, MetaLlamaLogo } from './LLMLogos';

interface HeroProps {
  onNavigateToPricing?: () => void;
  onNavigateToUiShowcase?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateToPricing, onNavigateToUiShowcase }) => {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('npx osterdops-guard');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToUi = () => {
    const el = document.getElementById('ui-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigateToUiShowcase) {
      onNavigateToUiShowcase();
    }
  };

  return (
    <section className="relative pt-16 pb-16 md:pt-20 md:pb-24 overflow-hidden select-none">
      {/* 3D Warm Ambient Radial Aura behind Hero */}
      <div className="absolute top-10 left-1/3 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-br from-osterdGold-400/15 via-sandstone-300/25 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Floating 3D LLM Satellite Badges in the Background / Foreground */}
      
      {/* Satellite 1: Claude Floating Pill (Top Right of Text) */}
      <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-[#EAE5DB] shadow-card-3d absolute top-20 left-[42%] z-20 animate-float-1 preserve-3d">
        <div className="w-6 h-6 rounded-lg bg-charcoal-900 text-white flex items-center justify-center p-1 shadow-xs">
          <AnthropicLogo className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-charcoal-900 font-display leading-tight">Claude 3.7 Sonnet</span>
          <span className="text-[9px] text-emerald-600 font-mono font-semibold">Protected • 310ms</span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
      </div>

      {/* Satellite 2: OpenAI Floating Pill (Left Edge) */}
      <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-[#EAE5DB] shadow-card-3d absolute top-72 left-[2%] z-20 animate-float-2 preserve-3d">
        <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center p-1 shadow-xs">
          <OpenAILogo className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-charcoal-900 font-display leading-tight">GPT-4o & o3-mini</span>
          <span className="text-[9px] text-charcoal-500 font-mono">Hard Cap: $15.00/day</span>
        </div>
      </div>

      {/* Satellite 3: Gemini Floating Pill (Bottom of Left Column) */}
      <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-[#EAE5DB] shadow-card-3d absolute bottom-12 left-[36%] z-20 animate-float-3 preserve-3d">
        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center p-1 shadow-xs">
          <GeminiLogo className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-charcoal-900 font-display leading-tight">Gemini 2.5 Pro</span>
          <span className="text-[9px] text-blue-600 font-mono font-semibold">2M Context Guard</span>
        </div>
      </div>

      {/* Satellite 4: Meta Llama Floating Pill (Right Top Edge) */}
      <div className="hidden 2xl:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-[#EAE5DB] shadow-card-3d absolute top-28 right-[4%] z-20 animate-float-4 preserve-3d">
        <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center p-1 shadow-xs">
          <MetaLlamaLogo className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-charcoal-900 font-display leading-tight">Llama 3.3 70B</span>
          <span className="text-[9px] text-sky-600 font-mono font-semibold">Local vLLM Loopback</span>
        </div>
      </div>

      <div className="max-w-[1540px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-12 items-center">
          
          {/* Left Column: Typography & Conversion Core */}
          <div className="xl:col-span-5 space-y-6 z-10">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sandstone-200/90 border border-sandstone-300/90 text-[11px] font-bold tracking-[0.15em] text-charcoal-700 uppercase font-mono shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-osterdGold-500 animate-ping" />
              <span>THE FINANCIAL FIREWALL FOR AI AGENTS</span>
            </div>

            {/* Main 3D Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-charcoal-900 leading-[1.08] tracking-[-0.035em] font-display">
              Control Your AI Spend.{' '}
              <span className="gold-gradient-text block font-extrabold">
                Understand Every Agent.
              </span>
            </h1>

            {/* Sub-headline description */}
            <p className="text-base sm:text-[17px] text-charcoal-600 leading-relaxed max-w-xl font-normal">
              OsterdOps gives engineering teams and solo builders microsecond-level financial circuit breakers, agentic loop velocity caps, and deterministic intra-family failovers — without a single cloud proxy hop.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={onNavigateToPricing}
                className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-charcoal-900 text-white text-[15px] font-semibold shadow-md hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <span>Deploy Free</span>
                <ArrowRight className="w-4 h-4 text-osterdGold-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={scrollToUi}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-sandstone-100 border border-[#EAE5DB] text-charcoal-800 text-[15px] font-semibold transition-all shadow-subtle hover:-translate-y-0.5 cursor-pointer"
              >
                <Activity className="w-4 h-4 text-osterdGold-600" />
                <span>Inspect Live UI Console</span>
              </button>
            </div>

            {/* Terminal Command Quick Copy Badge */}
            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-charcoal-500">
              <div 
                onClick={copyCommand}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sandstone-200/80 border border-sandstone-300/80 hover:bg-sandstone-200 cursor-pointer transition-all font-mono text-charcoal-800 shadow-2xs hover:shadow-xs group"
                title="Click to copy"
              >
                <Terminal className="w-3.5 h-3.5 text-osterdGold-600" />
                <span className="font-semibold">npx osterdops-guard</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-charcoal-400 ml-1 group-hover:text-charcoal-800 transition-colors" />
                )}
              </div>
              <span className="text-[11px] text-charcoal-500 font-mono">
                0 install • 100% on-device loopback
              </span>
            </div>

            {/* 3 Value Badges Strip */}
            <div className="pt-6 border-t border-[#EAE5DB] grid grid-cols-3 gap-4 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 font-display">
                  <div className="w-5 h-5 rounded-md bg-sandstone-200 flex items-center justify-center text-osterdGold-700">
                    <Layers className="w-3 h-3" />
                  </div>
                  <span>Hard Cap Limits</span>
                </div>
                <p className="text-[11px] text-charcoal-500 leading-tight">Instant circuit break at limit</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 font-display">
                  <div className="w-5 h-5 rounded-md bg-sandstone-200 flex items-center justify-center text-osterdGold-700">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <span>Deterministic</span>
                </div>
                <p className="text-[11px] text-charcoal-500 leading-tight">Zero cross-vendor tool bugs</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 font-display">
                  <div className="w-5 h-5 rounded-md bg-sandstone-200 flex items-center justify-center text-osterdGold-700">
                    <Zap className="w-3 h-3" />
                  </div>
                  <span>&lt;0.42ms Overhead</span>
                </div>
                <p className="text-[11px] text-charcoal-500 leading-tight">Zero buffering delay</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Product Dashboard Showcase */}
          <div className="xl:col-span-7 flex items-center justify-center relative w-full perspective-1200">
            <HeroDashboard3D />
          </div>

        </div>
      </div>
    </section>
  );
};
