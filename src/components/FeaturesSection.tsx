import React from 'react';
import { Layers, Eye, ShieldCheck, Zap, ArrowUpRight, Lock, Workflow } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Layers,
      title: 'Hard Budget Limits (Auto-Stop)',
      subtitle: 'Never Get Surprise Bills',
      description: 'Set a daily or monthly dollar limit (e.g. $10/day). If your AI agent gets stuck in a loop and keeps retrying, OstraOps stops it instantly before you waste money.',
      highlight: 'Instant 429 Stop',
      badge: 'Wallet Protection',
    },
    {
      icon: Eye,
      title: 'Live Token & Cost Counter',
      subtitle: 'Know Exact Prices',
      description: 'See how many tokens you use and exactly how much money each prompt costs in real time, instead of waiting for end-of-month surprises.',
      highlight: 'Live Per-Prompt Cost',
      badge: 'Real-Time',
    },
    {
      icon: Lock,
      title: '100% Private Local Guard',
      subtitle: 'Prompts Stay On Your PC',
      description: 'When running npx ostraops-guard, your code and prompts never leave your computer. It only counts token numbers locally to guard your budget.',
      highlight: 'Zero Prompt Upload',
      badge: 'Local First',
    },
    {
      icon: Zap,
      title: 'Team API Dashboard & Gateway',
      subtitle: 'Central Spend Tracking',
      description: 'Need full team oversight? Use our web gateway to track API calls, response times, model breakdown, and team budgets in one clean dashboard.',
      highlight: 'Full API Logs',
      badge: 'Team Gateway',
    },
    {
      icon: ShieldCheck,
      title: 'Works Everywhere (Not Just Cursor)',
      subtitle: 'Universal Drop-In Setup',
      description: 'Available for Cursor, Windsurf, Cline, Aider, Claude Code, Python, LangChain, Next.js, and any app using OpenAI or Anthropic SDKs. Just point your base URL to localhost:8080.',
      highlight: 'Editors, SDKs & Frameworks',
      badge: 'Universal Support',
    },
    {
      icon: Workflow,
      title: 'Smart Model Fallback',
      subtitle: 'Never Let Agents Crash',
      description: 'If your main model is down or rate-limited, OstraOps can automatically route to a cheaper backup model so your work keeps going.',
      highlight: 'Zero Downtime',
      badge: 'Reliable',
    },
  ];

  return (
    <section id="features" className="py-24 border-t border-white/[0.08] bg-[#07090C] relative overflow-hidden">
      {/* Background glow and subtle 3D cyber grid */}
      <div className="absolute inset-0 bg-grid-cyber-3d pointer-events-none opacity-60" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#C59E5F]/10 via-[#C59E5F]/5 to-transparent blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold text-[#E5C38D] uppercase tracking-wider mb-2 font-mono">
            Core Platform Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-[-0.02em] font-display">
            Built For Developers Who{' '}
            <span className="gold-gradient-text block">Demand Real Budget Control.</span>
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Traditional AI cost tools only alert you after the money is already gone. OstraOps protects your account in real time as requests are processed.
          </p>
        </div>

        {/* 6 Feature Cards Grid with 3D Depth */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1200">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="card-3d-interactive group relative p-7 rounded-3xl bg-[#0B0E14]/90 backdrop-blur-md border border-white/[0.08] shadow-xl flex flex-col justify-between overflow-hidden"
              >
                {/* 3D Specular glare highlight */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.04] via-transparent to-[#C59E5F]/[0.02] pointer-events-none group-hover:from-[#C59E5F]/10 transition-all duration-500" />
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-radial from-[#C59E5F]/15 to-transparent blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    {/* 3D Floating Icon Container */}
                    <div className="depth-icon w-12 h-12 rounded-2xl bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D] group-hover:bg-[#C59E5F] group-hover:text-[#07090C] transition-all duration-300 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="depth-badge text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                      {item.badge}
                    </span>
                  </div>

                  <div className="depth-content space-y-2">
                    <span className="text-[11px] font-semibold tracking-wider text-[#E5C38D] uppercase font-mono">
                      {item.subtitle}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-100 font-display group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Tag */}
                <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="font-semibold text-zinc-200">{item.highlight}</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-[#E5C38D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
