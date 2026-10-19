import React, { useState } from 'react';
import { ArrowRight, Terminal, Copy, Check, ShieldCheck, Zap, Layers, ChevronDown } from 'lucide-react';
const HeroDashboard3D = React.lazy(() => import('./HeroDashboard3D').then((m) => ({ default: m.HeroDashboard3D })));
const AiThinkingOrbLazy = React.lazy(() => import('./AiThinkingOrb').then((m) => ({ default: m.AiThinkingOrb })));
import { AnthropicLogo, OpenAILogo, GeminiLogo, MetaLlamaLogo, DeepSeekLogo, MistralLogo, NvidiaLogo } from './LLMLogos';

interface HeroProps {
  onNavigateToPricing?: () => void;
  onNavigateToUiShowcase?: () => void;
  onNavigateToModels?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateToPricing, onNavigateToUiShowcase, onNavigateToModels }) => {
  const [copied, setCopied] = useState(false);

  const providerBadges = [
    {
      name: 'Claude 3.7 Sonnet',
      status: 'Protected • 310ms',
      Logo: AnthropicLogo,
      iconBg: 'bg-charcoal-900 text-white',
    },
    {
      name: 'Nemotron-3 Ultra 550B',
      status: 'Protected • 240ms',
      Logo: NvidiaLogo,
      iconBg: 'bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/30',
    },
    {
      name: 'GPT-4o & o3-mini',
      status: 'Protected • 280ms',
      Logo: OpenAILogo,
      iconBg: 'bg-emerald-700 text-white',
    },
    {
      name: 'Gemini 2.5 Pro',
      status: 'Protected • 190ms',
      Logo: GeminiLogo,
      iconBg: 'bg-white text-blue-600 border border-[#EAE5DB]',
    },
    {
      name: 'Llama 3.3 70B',
      status: 'Protected • Local',
      Logo: MetaLlamaLogo,
      iconBg: 'bg-sky-600 text-white',
    },
    {
      name: 'DeepSeek R1 & V3',
      status: 'Protected • 420ms',
      Logo: DeepSeekLogo,
      iconBg: 'bg-blue-700 text-white',
    },
    {
      name: 'Mistral Large 2',
      status: 'Protected • 220ms',
      Logo: MistralLogo,
      iconBg: 'bg-amber-600 text-white',
    },
  ];

  const copyCommand = () => {
    navigator.clipboard.writeText('npx ostraops');
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
    <section className="relative pt-16 sm:pt-20 md:pt-24 lg:pt-26 pb-16 md:pb-24 overflow-hidden select-none">
      {/* 3D Warm Ambient Radial Aura behind Hero - optimized for mobile GPU */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[320px] h-[320px] sm:w-[1000px] sm:h-[600px] bg-gradient-to-br from-[#C59E5F]/15 via-[#E5C38D]/10 to-transparent blur-3xl sm:blur-[160px] pointer-events-none -z-10" />

      {/* Secondary warm glow on the sides - desktop only */}
      <div className="hidden sm:block absolute top-48 left-[5%] w-[450px] h-[450px] bg-gradient-to-tr from-[#C59E5F]/10 via-[#9C7938]/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="hidden sm:block absolute top-48 right-[5%] w-[450px] h-[450px] bg-gradient-to-bl from-[#E5C38D]/10 via-[#C59E5F]/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Floating gold particles - desktop only to save mobile compositor cycles */}
      <div className="hidden sm:block hero-particle top-[15%] left-[20%]" style={{ animationDelay: '0s' }} />
      <div className="hidden sm:block hero-particle top-[30%] left-[12%]" style={{ animationDelay: '1.5s', width: 3, height: 3 }} />
      <div className="hidden sm:block hero-particle top-[60%] left-[25%]" style={{ animationDelay: '3s', width: 5, height: 5, opacity: 0.3 }} />
      <div className="hidden sm:block hero-particle top-[20%] left-[70%]" style={{ animationDelay: '2s', width: 3, height: 3 }} />
      <div className="hidden sm:block hero-particle top-[45%] left-[85%]" style={{ animationDelay: '4s' }} />
      <div className="hidden sm:block hero-particle top-[70%] left-[75%]" style={{ animationDelay: '1s', width: 6, height: 6, opacity: 0.25 }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">

        {/* ============================================================ */}
        {/* Hero Split: Text Left + AI Thinking Orb Right                */}
        {/* ============================================================ */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 z-10">

          {/* LEFT: Text & CTA — shifted left as requested */}
          <div className="flex-[1.15] w-full min-w-0 text-left space-y-5 flex flex-col items-start pt-0 lg:pt-2 -translate-x-3 sm:-translate-x-5 lg:-translate-x-8">

            {/* Main Headline */}
            <h1 className="w-full text-left self-start text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-white leading-[1.12] tracking-[-0.035em] font-display hero-title m-0 p-0">
              <span className="block">The Smart Spend Controller</span>
              <span className="gold-gradient-text block font-extrabold mt-1">
                For AI Apps &amp; Agents.
              </span>
            </h1>

            {/* Sub-headline — strictly left-aligned flush with headline */}
            <p className="w-full text-left self-start text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl font-normal hero-sub m-0 p-0">
              Set real-time budget limits to stop runaway agent loops and surprise bills before they arrive.
            </p>

            {/* Primary Action Buttons */}
            <div className="w-full flex flex-wrap items-center justify-start self-start gap-3.5 pt-1 m-0">
              <button
                onClick={onNavigateToPricing}
                className="btn-primary-glow group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#07090C] text-[15px] font-bold shadow-lg shadow-[#C59E5F]/20 hover:shadow-[#C59E5F]/35 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>View Plans &amp; Pricing</span>
                <ArrowRight className="w-4 h-4 text-[#07090C] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={scrollToUi}
                className="btn-secondary-glass inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/[0.04] border border-white/[0.1] hover:border-[#C59E5F]/50 text-zinc-300 hover:text-white hover:bg-white/[0.08] text-[15px] font-semibold transition-all cursor-pointer group shadow-lg"
              >
                <span>Explore Platform</span>
                <Layers className="w-4 h-4 text-zinc-400 group-hover:text-[#E5C38D] transition-colors" />
              </button>
            </div>

            {/* Terminal Command Quick Copy Badge */}
            <div className="w-full pt-1 flex flex-wrap items-center justify-start gap-3 text-xs text-zinc-400">
              <button 
                type="button"
                onClick={copyCommand}
                className="terminal-badge inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:border-[#C59E5F]/40 cursor-pointer font-mono text-zinc-200 transition-colors shadow-2xs group min-h-[40px]"
                title="Click to copy install command"
                aria-label="Copy terminal install command: npx ostraops-guard"
              >
                <Terminal className="w-3.5 h-3.5 text-[#C59E5F]" />
                <span className="font-semibold text-zinc-100">npx ostraops-guard</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-500 ml-1 group-hover:text-zinc-200 transition-colors" />
                )}
              </button>
              <span className="text-[11px] text-zinc-400 font-mono">
                Runs locally • Zero signup needed
              </span>
            </div>

            {/* Works with ecosystem chips strip */}
            <div className="w-full flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] font-mono text-zinc-400">
              <span className="text-zinc-500 font-semibold mr-1">Available for:</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300">Cursor</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300">Windsurf</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300">Cline</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300">Claude Code</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300">Python</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300">LangChain</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300">Node / Next.js</span>
            </div>

            {/* 3 Value Badges Strip */}
            <div className="pt-4 flex flex-wrap items-center justify-start gap-5 sm:gap-8 text-left border-t border-white/[0.08] w-full">
              <div className="value-badge flex items-center gap-2 cursor-default">
                <div className="value-badge-icon w-6 h-6 rounded-lg bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-100 font-display">Hard Spend Limits</div>
                  <div className="text-[10px] text-zinc-400">Auto-stops when budget is hit</div>
                </div>
              </div>

              <div className="value-badge flex items-center gap-2 cursor-default">
                <div className="value-badge-icon w-6 h-6 rounded-lg bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-100 font-display">All Providers</div>
                  <div className="text-[10px] text-zinc-400">One dashboard for every AI</div>
                </div>
              </div>

              <div className="value-badge flex items-center gap-2 cursor-default">
                <div className="value-badge-icon w-6 h-6 rounded-lg bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D]">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-100 font-display">Near-Zero Lag</div>
                  <div className="text-[10px] text-zinc-400">Under 1ms overhead per call</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: AI Thinking Orb */}
          <div className="flex-1 w-full max-w-lg lg:max-w-xl xl:max-w-2xl">
            <React.Suspense fallback={<div className="min-h-[400px] w-full rounded-3xl bg-[#0B0E14]/30" />}>
              <AiThinkingOrbLazy />
            </React.Suspense>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Full-Width Desktop Dashboard Application Showcase            */}
        {/* ============================================================ */}
        <div className="mt-12 sm:mt-16 w-full max-w-[1440px] mx-auto relative content-auto">
          <React.Suspense fallback={<div className="min-h-[420px] w-full rounded-3xl bg-[#0B0E14]/60 border border-white/[0.08]" />}>
            <HeroDashboard3D 
              standaloneWindow={true} 
              onNavigatePricing={onNavigateToPricing} 
            />
          </React.Suspense>
        </div>

        {/* Model Providers Dock — Floating 3D Satellite Logos that expand details on hover */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C59E5F]" />
            <span>Supported LLM Lineages • Hover Floating Logo for Telemetry</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-5 py-3 perspective-1200">
            {providerBadges.map((provider, idx) => {
              const floatClass = 
                idx % 4 === 0 ? 'animate-float-1' :
                idx % 4 === 1 ? 'animate-float-2' :
                idx % 4 === 2 ? 'animate-float-3' : 'animate-float-4';

              return (
                <button
                  type="button"
                  key={provider.name}
                  onClick={onNavigateToModels}
                  className={`${floatClass} hover-pause preserve-3d group relative flex items-center cursor-pointer transition-transform duration-300 hover:scale-105 border-0 bg-transparent p-0 text-left`}
                  style={{ animationDelay: `${idx * 0.4}s` }}
                  title={`${provider.name} (${provider.status})`}
                  aria-label={`View models and pricing details for ${provider.name}`}
                >
                  {/* Floating 3D Pill — expands smoothly on hover */}
                  <div className="flex items-center rounded-2xl bg-[#0B0E14]/90 backdrop-blur-md border border-white/[0.1] shadow-xl transition-all duration-300 group-hover:border-[#C59E5F]/50 group-hover:shadow-[0_0_20px_rgba(197,158,95,0.15)] p-1.5 sm:p-2">
                    {/* Default: Just the clean logo tile */}
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${provider.iconBg} shadow-xs shrink-0`}>
                      <provider.Logo className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>

                    {/* Details: Reveals on hover */}
                    <div className="max-w-0 opacity-0 group-hover:max-w-[240px] group-hover:opacity-100 group-hover:px-2.5 transition-all duration-300 ease-out overflow-hidden flex items-center gap-2.5 whitespace-nowrap">
                      <div className="flex flex-col text-left py-0.5">
                        <span className="text-[11px] font-bold text-zinc-100 font-display leading-tight">
                          {provider.name}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-mono font-semibold">
                          {provider.status}
                        </span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="hidden md:flex justify-center mt-8">
          <button 
            onClick={scrollToUi}
            className="animate-soft-bounce flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            aria-label="Scroll to explore"
          >
            <span className="text-[10px] font-mono tracking-widest uppercase">Explore</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
