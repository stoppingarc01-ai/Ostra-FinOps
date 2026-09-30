import React, { useState } from 'react';
import { ArrowRight, Terminal, Copy, Check, ShieldCheck, Zap, Layers, ChevronDown } from 'lucide-react';
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
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden select-none">
      {/* 3D Warm Ambient Radial Aura behind Hero */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-br from-[#C59E5F]/15 via-[#E5C38D]/10 to-transparent blur-[160px] pointer-events-none -z-10" />

      {/* Secondary warm glow on the sides */}
      <div className="absolute top-48 left-[5%] w-[450px] h-[450px] bg-gradient-to-tr from-[#C59E5F]/10 via-[#9C7938]/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-48 right-[5%] w-[450px] h-[450px] bg-gradient-to-bl from-[#E5C38D]/10 via-[#C59E5F]/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Floating gold particles */}
      <div className="hero-particle top-[15%] left-[20%]" style={{ animationDelay: '0s' }} />
      <div className="hero-particle top-[30%] left-[12%]" style={{ animationDelay: '1.5s', width: 3, height: 3 }} />
      <div className="hero-particle top-[60%] left-[25%]" style={{ animationDelay: '3s', width: 5, height: 5, opacity: 0.3 }} />
      <div className="hero-particle top-[20%] left-[70%]" style={{ animationDelay: '2s', width: 3, height: 3 }} />
      <div className="hero-particle top-[45%] left-[85%]" style={{ animationDelay: '4s' }} />
      <div className="hero-particle top-[70%] left-[75%]" style={{ animationDelay: '1s', width: 6, height: 6, opacity: 0.25 }} />

      <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Centered Section: Typography & Conversion Core */}
        <div className="max-w-4xl mx-auto text-center space-y-6 z-10 flex flex-col items-center">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[#C59E5F]/30 text-xs font-semibold text-[#E5C38D] uppercase tracking-wider font-mono shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C59E5F] animate-pulse" />
            <span>AI Cost &amp; Budget Management</span>
          </div>

          {/* Main 3D Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold text-white leading-[1.08] tracking-[-0.035em] font-display max-w-4xl">
            <span className="animate-text-reveal block">Control Your AI Spend.</span>
            <span className="gold-gradient-text block font-extrabold animate-text-reveal-delay-1">
              Before The Bill Arrives.
            </span>
          </h1>

          {/* Sub-headline description */}
          <p className="animate-text-reveal-delay-2 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl font-normal">
            OstraOps tracks every token, calculates exact costs in real time, and lets you set hard budget caps so runaway scripts or autonomous loops never drain your credit card.
          </p>

          {/* Primary Action Buttons */}
          <div className="animate-text-reveal-delay-3 flex flex-wrap items-center justify-center gap-3.5 pt-2">
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
          <div className="animate-text-reveal-delay-4 pt-1 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
            <div 
              onClick={copyCommand}
              className="terminal-badge inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:border-[#C59E5F]/40 cursor-pointer font-mono text-zinc-200 transition-colors shadow-2xs group"
              title="Click to copy"
            >
              <Terminal className="w-3.5 h-3.5 text-[#C59E5F]" />
              <span className="font-semibold text-zinc-100">npx ostraops</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-500 ml-1 group-hover:text-zinc-200 transition-colors" />
              )}
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              Run via npx • Zero complex setup
            </span>
          </div>

          {/* 3 Value Badges Strip */}
          <div className="animate-text-reveal-delay-5 pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-left border-t border-white/[0.08] w-full max-w-2xl">
            <div className="value-badge flex items-center gap-2 cursor-default">
              <div className="value-badge-icon w-6 h-6 rounded-lg bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D]">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-100 font-display">Hard Cap Limits</div>
                <div className="text-[10px] text-zinc-400">Immediate HTTP 429 when cap hit</div>
              </div>
            </div>

            <div className="value-badge flex items-center gap-2 cursor-default">
              <div className="value-badge-icon w-6 h-6 rounded-lg bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-100 font-display">Deterministic</div>
                <div className="text-[10px] text-zinc-400">Intra-family tool schema parity</div>
              </div>
            </div>

            <div className="value-badge flex items-center gap-2 cursor-default">
              <div className="value-badge-icon w-6 h-6 rounded-lg bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D]">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-100 font-display">~0.8ms Overhead</div>
                <div className="text-[10px] text-zinc-400">Stream passthrough (p99 &lt; 2.5ms)</div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Full-Width Desktop Dashboard Application Showcase            */}
        {/* ============================================================ */}
        <div className="mt-12 sm:mt-16 w-full max-w-[1440px] mx-auto relative">
          <HeroDashboard3D 
            standaloneWindow={true} 
            onNavigatePricing={onNavigateToPricing} 
          />
        </div>

        {/* Model Providers Dock — Floating 3D Satellite Logos that expand details on hover */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C59E5F] animate-ping" />
            <span>Supported LLM Lineages • Hover Floating Logo for Telemetry</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-5 py-3 perspective-1200">
            {providerBadges.map((provider, idx) => {
              const floatClass = 
                idx % 4 === 0 ? 'animate-float-1' :
                idx % 4 === 1 ? 'animate-float-2' :
                idx % 4 === 2 ? 'animate-float-3' : 'animate-float-4';

              return (
                <div
                  key={provider.name}
                  onClick={onNavigateToModels}
                  className={`${floatClass} hover-pause preserve-3d group relative flex items-center cursor-pointer transition-transform duration-300 hover:scale-105`}
                  style={{ animationDelay: `${idx * 0.4}s` }}
                  title={`${provider.name} (${provider.status})`}
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
                </div>
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
