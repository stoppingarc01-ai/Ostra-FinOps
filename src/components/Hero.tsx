import React, { useState } from 'react';
import { ArrowRight, Terminal, Copy, Check, ShieldCheck, Zap, Layers, Activity, ChevronDown } from 'lucide-react';
import { HeroDashboard3D } from './HeroDashboard3D';
import { AnthropicLogo, OpenAILogo, GeminiLogo, MetaLlamaLogo, DeepSeekLogo, MistralLogo } from './LLMLogos';

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
    navigator.clipboard.writeText('npx ostraops-guard');
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
      <div className="absolute top-10 left-1/3 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-br from-ostraGold-400/15 via-sandstone-300/25 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Secondary warm glow on the right */}
      <div className="absolute top-32 right-[10%] w-[400px] h-[400px] bg-gradient-to-bl from-amber-200/10 via-ostraGold-300/8 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Floating gold particles */}
      <div className="hero-particle top-[15%] left-[20%]" style={{ animationDelay: '0s' }} />
      <div className="hero-particle top-[30%] left-[12%]" style={{ animationDelay: '1.5s', width: 3, height: 3 }} />
      <div className="hero-particle top-[60%] left-[25%]" style={{ animationDelay: '3s', width: 5, height: 5, opacity: 0.3 }} />
      <div className="hero-particle top-[20%] left-[40%]" style={{ animationDelay: '2s', width: 3, height: 3 }} />
      <div className="hero-particle top-[45%] left-[8%]" style={{ animationDelay: '4s' }} />
      <div className="hero-particle top-[70%] left-[35%]" style={{ animationDelay: '1s', width: 6, height: 6, opacity: 0.25 }} />



      <div className="max-w-[1540px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-12 items-center">
          
          {/* Left Column: Typography & Conversion Core */}
          <div className="xl:col-span-5 space-y-6 z-10">
            {/* Eyebrow badge — animated pop-in */}
            <div className="animate-badge-pop inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sandstone-200/90 border border-sandstone-300/90 text-[11px] font-bold tracking-[0.15em] text-charcoal-700 uppercase font-mono shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-ostraGold-500 animate-ping" />
              <span>THE FINANCIAL GATEWAY FOR AI AGENTS</span>
            </div>

            {/* Main 3D Headline — staggered reveal */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-charcoal-900 leading-[1.08] tracking-[-0.035em] font-display">
              <span className="animate-text-reveal block">Control Your AI Spend.</span>
              <span className="gold-gradient-text block font-extrabold animate-text-reveal-delay-1">
                Understand Every Agent.
              </span>
            </h1>

            {/* Sub-headline description — delayed reveal */}
            <p className="animate-text-reveal-delay-2 text-base sm:text-[17px] text-charcoal-600 leading-relaxed max-w-xl font-normal">
              OstraOps gives engineering teams and solo builders microsecond-level financial circuit breakers, agentic loop velocity caps, and deterministic intra-family failovers — without a single cloud proxy hop.
            </p>

            {/* Primary Action Buttons — with glow + glass effects */}
            <div className="animate-text-reveal-delay-3 flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={onNavigateToPricing}
                className="btn-primary-glow group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-charcoal-900 text-white text-[15px] font-semibold shadow-md cursor-pointer"
              >
                <span>Deploy Free</span>
                <ArrowRight className="w-4 h-4 text-ostraGold-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={scrollToUi}
                className="btn-secondary-glass inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white border border-[#EAE5DB] text-charcoal-800 text-[15px] font-semibold shadow-subtle cursor-pointer"
              >
                <Activity className="w-4 h-4 text-ostraGold-600" />
                <span>Inspect Live UI Console</span>
              </button>
            </div>

            {/* Terminal Command Quick Copy Badge — with shimmer */}
            <div className="animate-text-reveal-delay-4 pt-1 flex flex-wrap items-center gap-3 text-xs text-charcoal-500">
              <div 
                onClick={copyCommand}
                className="terminal-badge inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sandstone-200/80 border border-sandstone-300/80 cursor-pointer font-mono text-charcoal-800 shadow-2xs group"
                title="Click to copy"
              >
                <Terminal className="w-3.5 h-3.5 text-ostraGold-600" />
                <span className="font-semibold">npx ostraops-guard</span>
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

            {/* 3 Value Badges Strip — with hover lift */}
            <div className="animate-text-reveal-delay-5 pt-6 border-t border-[#EAE5DB] grid grid-cols-3 gap-4 text-left">
              <div className="value-badge space-y-1 cursor-default">
                <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 font-display">
                  <div className="value-badge-icon w-5 h-5 rounded-md bg-sandstone-200 flex items-center justify-center text-ostraGold-700">
                    <Layers className="w-3 h-3" />
                  </div>
                  <span>Hard Cap Limits</span>
                </div>
                <p className="text-[11px] text-charcoal-500 leading-tight">Instant circuit break at limit</p>
              </div>

              <div className="value-badge space-y-1 cursor-default">
                <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 font-display">
                  <div className="value-badge-icon w-5 h-5 rounded-md bg-sandstone-200 flex items-center justify-center text-ostraGold-700">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <span>Deterministic</span>
                </div>
                <p className="text-[11px] text-charcoal-500 leading-tight">Zero cross-vendor tool bugs</p>
              </div>

              <div className="value-badge space-y-1 cursor-default">
                <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 font-display">
                  <div className="value-badge-icon w-5 h-5 rounded-md bg-sandstone-200 flex items-center justify-center text-ostraGold-700">
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

        {/* Model Providers Dock — Only logos by default, details revealed on hover */}
        <div className="mt-12 pt-6 border-t border-[#EAE5DB]/60 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-charcoal-500 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-ostraGold-500" />
            <span>Supported LLM Lineages • Hover for Live Gateway Telemetry</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 p-2 sm:p-2.5 rounded-2xl bg-white/85 backdrop-blur-md border border-[#EAE5DB] shadow-sm">
            {providerBadges.map((provider) => (
              <div
                key={provider.name}
                onClick={onNavigateToModels}
                className="relative group flex items-center justify-center cursor-pointer"
                title={`${provider.name} (${provider.status})`}
              >
                {/* Default: Just the clean logo */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 transform group-hover:scale-110 group-hover:shadow-md ${provider.iconBg}`}>
                  <provider.Logo className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>

                {/* Hover Details Popover — exact match for the user's satellite pill */}
                <div className="opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE5DB] shadow-card-3d whitespace-nowrap">
                  <div className={`w-6 h-6 rounded-lg ${provider.iconBg} flex items-center justify-center p-1 shadow-xs shrink-0`}>
                    <provider.Logo className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-charcoal-900 font-display leading-tight">
                      {provider.name}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-mono font-semibold">
                      {provider.status}
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5 shrink-0" />
                  {/* Caret pointing down to the logo */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="hidden md:flex justify-center mt-6">
          <button 
            onClick={scrollToUi}
            className="animate-soft-bounce flex flex-col items-center gap-1 text-charcoal-400 hover:text-charcoal-600 transition-colors cursor-pointer"
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
