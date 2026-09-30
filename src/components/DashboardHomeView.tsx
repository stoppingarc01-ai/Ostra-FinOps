import React, { useState } from 'react';
import {
  ArrowRight,
  Shield,
  Activity,
  Cpu,
  Maximize2,
  TrendingUp,
  DollarSign,
  Zap,
  Network,
  Users,
  Sparkles,
  Server,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


interface DashboardHomeViewProps {
  onGetStarted?: () => void;
  onViewIntegrations?: () => void;
  onViewOverview?: () => void;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  onGetStarted,
  onViewIntegrations,
  onViewOverview,
}) => {
  const { subscription } = useAuth();
  const [activeHoverProvider, setActiveHoverProvider] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  const copyEndpoint = () => {
    navigator.clipboard.writeText('https://gateway.ostraops.com/v1');
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const whyFeatures = [
    {
      title: 'Track Every Request',
      description: 'See real-time usage, token consumption and costs across all providers.',
      icon: TrendingUp,
      color: 'text-[#E5C38D]',
      bgColor: 'bg-[#C59E5F]/15 border-[#C59E5F]/30',
      hoverBorder: 'hover:border-[#C59E5F]',
    },
    {
      title: 'Control Your Spend',
      description: 'Set budgets, enforce limits and get instant alerts for anomalies.',
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15 border-emerald-500/30',
      hoverBorder: 'hover:border-emerald-400',
    },
    {
      title: 'Optimize Performance',
      description: 'Find the best models, reduce costs and improve response times.',
      icon: Zap,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/15 border-blue-500/30',
      hoverBorder: 'hover:border-blue-400',
    },
    {
      title: 'Simplify Operations',
      description: 'Manage keys, integrations, and access — all from a single dashboard.',
      icon: Network,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/15 border-purple-500/30',
      hoverBorder: 'hover:border-purple-400',
    },
    {
      title: 'Built for Teams',
      description: 'Collaborate with secure RBAC, projects and organization-level controls.',
      icon: Users,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/15 border-teal-500/30',
      hoverBorder: 'hover:border-teal-400',
    },
    {
      title: 'Future Ready',
      description: 'Stay ahead with new models, features and continuous improvements.',
      icon: Sparkles,
      color: 'text-[#E5C38D]',
      bgColor: 'bg-[#C59E5F]/15 border-[#C59E5F]/30',
      hoverBorder: 'hover:border-[#C59E5F]',
    },
  ];

  const modernTeamPoints = [
    {
      title: 'Enterprise Security',
      subtitle: 'SOC 2, GDPR, encryption at rest & in transit',
      icon: Shield,
    },
    {
      title: 'Real-time Monitoring',
      subtitle: 'Track usage, detect anomalies, prevent overspend',
      icon: Activity,
    },
    {
      title: 'Multi-Model Support',
      subtitle: 'OpenAI, Anthropic, Gemini, Meta and more',
      icon: Cpu,
    },
    {
      title: 'Flexible & Scalable',
      subtitle: 'From startups to global enterprises',
      icon: Maximize2,
    },
  ];

  const providers = [
    { name: 'OpenAI', badge: 'GPT-4o / o1 / o3', iconType: 'openai' },
    { name: 'Anthropic', badge: 'Claude 3.5 Sonnet', iconType: 'anthropic' },
    { name: 'Google', badge: 'Gemini 1.5 Pro', iconType: 'google' },
    { name: 'Meta', badge: 'Llama 3.3 70B', iconType: 'meta' },
    { name: 'Mistral', badge: 'Mistral Large 2', iconType: 'mistral' },
    { name: 'Cohere', badge: 'Command R+', iconType: 'cohere' },
  ];

  return (
    <div className="space-y-6 text-zinc-100 pb-12 font-sans">
      
      {/* Central Hosted Gateway Cloud Status Ribbon */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0B0E14] via-[#0F131A] to-[#07090C] text-white border border-[#C59E5F]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-[15px] font-bold text-white tracking-tight">Central Hosted Gateway</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Cloud Edge Active
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                • {subscription?.plan_name || 'Team Hosted Gateway'} (5 Seats Included)
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-xs text-zinc-300 flex-wrap">
              <span className="text-zinc-400">Gateway URL:</span>
              <code className="px-2 py-0.5 rounded bg-black/60 font-mono text-[#E5C38D] border border-white/10 text-[11px]">
                https://gateway.ostraops.com/v1
              </code>
              <button
                onClick={copyEndpoint}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] hover:border-white/[0.2]"
              >
                {copiedEndpoint ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEndpoint ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 w-full md:w-auto justify-between md:justify-end">
          <div className="text-left md:text-right">
            <div className="text-[11px] text-zinc-400">Intra-Family Failover</div>
            <div className="font-semibold text-emerald-400 font-mono text-xs">Active (Sonnet → Haiku)</div>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          <div className="text-left md:text-right">
            <div className="text-[11px] text-zinc-400">AES-256 Vault</div>
            <div className="font-semibold text-[#E5C38D] font-mono text-xs">Keys Isolated</div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 1: HERO OVERVIEW + BUILT FOR MODERN TEAMS                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Col (8 cols): Hero Banner with Isometric AI Nexus Graphic */}
        <div className="lg:col-span-8 p-7 sm:p-9 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-white/[0.15] transition-all">
          
          {/* Ambient Warm Golden Aura */}
          <div className="absolute top-1/2 right-12 -translate-y-1/2 w-[380px] h-[380px] bg-gradient-to-br from-[#C59E5F]/15 via-[#E5C38D]/10 to-transparent blur-[90px] pointer-events-none" />

          {/* Grid Layout: Left Content + Right 3D Nexus */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Text */}
            <div className="md:col-span-7 space-y-4">
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#C59E5F] uppercase font-mono block">
                INTRODUCING OSTRAOPS
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-[1.15]">
                Complete Control Over Your AI Infrastructure
              </h1>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg">
                OstraOps is an enterprise-grade platform for AI cost governance and operations. Monitor usage, control spending, optimize performance, and scale with confidence — all in one place.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onGetStarted || onViewOverview}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] hover:opacity-90 text-black font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={onViewIntegrations}
                  className="px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Network className="w-4 h-4 text-[#E5C38D]" />
                  <span>Configure Providers</span>
                </button>
              </div>
            </div>

            {/* Right Graphic: 3D Isometric AI Core Nexus in Dark Obsidian / Gold */}
            <div className="md:col-span-5 flex items-center justify-center relative min-h-[260px]">
              <div className="relative w-64 h-64 flex items-center justify-center">
                
                {/* Concentric Orbital Vector Rings */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 260">
                  <defs>
                    <linearGradient id="warmGoldOrbit" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C59E5F" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#E5C38D" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#B38B42" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* Concentric rings */}
                  <ellipse cx="130" cy="130" rx="115" ry="68" fill="none" stroke="url(#warmGoldOrbit)" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.75" />
                  <ellipse cx="130" cy="130" rx="88" ry="48" fill="none" stroke="#C59E5F" strokeWidth="1.2" opacity="0.85" />
                  <ellipse cx="130" cy="130" rx="55" ry="30" fill="none" stroke="#A67C34" strokeWidth="1" opacity="0.9" />

                  {/* Isometric Base Platter in Dark Obsidian */}
                  <polygon points="130,75 220,130 130,185 40,130" fill="#0E131C" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                  <polygon points="130,95 195,130 130,165 65,130" fill="#141A26" stroke="#C59E5F" strokeWidth="1.2" />

                  {/* Core 3D Glowing Cube (Gold/Obsidian) */}
                  <polygon points="130,105 155,118 130,131 105,118" fill="#E5C38D" stroke="#C59E5F" strokeWidth="1" />
                  <polygon points="105,118 130,131 130,158 105,145" fill="#A88243" stroke="#8E6A29" strokeWidth="1" />
                  <polygon points="130,131 155,118 155,145 130,158" fill="#C59E5F" stroke="#8E6A29" strokeWidth="1" />

                  {/* Connection Rays */}
                  <line x1="130" y1="105" x2="130" y2="40" stroke="#C59E5F" strokeWidth="1" strokeDasharray="2 3" opacity="0.8" />
                  <line x1="155" y1="118" x2="225" y2="78" stroke="#C59E5F" strokeWidth="1" strokeDasharray="2 3" opacity="0.8" />
                  <line x1="105" y1="118" x2="35" y2="120" stroke="#C59E5F" strokeWidth="1" strokeDasharray="2 3" opacity="0.8" />
                  <line x1="155" y1="145" x2="215" y2="175" stroke="#C59E5F" strokeWidth="1" strokeDasharray="2 3" opacity="0.8" />
                </svg>

                {/* Floating Node Badge 1: OpenAI */}
                <div 
                  onMouseEnter={() => setActiveHoverProvider('OpenAI')}
                  onMouseLeave={() => setActiveHoverProvider(null)}
                  className="absolute top-2 right-4 px-2.5 py-1 rounded-xl bg-[#07090C] border border-white/[0.12] hover:border-[#C59E5F] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>OpenAI</span>
                </div>

                {/* Floating Node Badge 2: Anthropic */}
                <div 
                  onMouseEnter={() => setActiveHoverProvider('Anthropic')}
                  onMouseLeave={() => setActiveHoverProvider(null)}
                  className="absolute top-16 right-0 px-2.5 py-1 rounded-xl bg-[#07090C] border border-white/[0.12] hover:border-[#C59E5F] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
                >
                  <span className="w-3.5 h-3.5 rounded bg-[#C59E5F]/20 text-[#E5C38D] font-bold text-[8px] flex items-center justify-center font-mono">
                    AI
                  </span>
                  <span>Anthropic</span>
                </div>

                {/* Floating Node Badge 3: Google */}
                <div 
                  onMouseEnter={() => setActiveHoverProvider('Google')}
                  onMouseLeave={() => setActiveHoverProvider(null)}
                  className="absolute bottom-16 left-0 px-2.5 py-1 rounded-xl bg-[#07090C] border border-white/[0.12] hover:border-[#C59E5F] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
                >
                  <span className="text-[11px] font-bold text-blue-400 font-mono">G</span>
                  <span>Google</span>
                </div>

                {/* Floating Node Badge 4: Meta */}
                <div 
                  onMouseEnter={() => setActiveHoverProvider('Meta')}
                  onMouseLeave={() => setActiveHoverProvider(null)}
                  className="absolute bottom-6 right-8 px-2.5 py-1 rounded-xl bg-[#07090C] border border-white/[0.12] hover:border-[#C59E5F] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
                >
                  <span className="text-blue-400 text-xs font-bold">∞</span>
                  <span>Meta</span>
                </div>

              </div>
            </div>

          </div>

          {/* Optional Hover Callout */}
          {activeHoverProvider && (
            <div className="absolute bottom-3 right-6 text-[11px] font-mono text-zinc-400 animate-in fade-in">
              Active Routing Route → <strong className="text-white">{activeHoverProvider}</strong> Gateway v1
            </div>
          )}

        </div>

        {/* Right Col (4 cols): Built for Modern Teams Card */}
        <div className="lg:col-span-4 p-7 sm:p-8 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xl flex flex-col justify-between hover:border-white/[0.15] transition-all">
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Built for Modern Teams
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Secure. Scalable. Cost-Optimized.
              </p>
            </div>

            {/* 4 Feature Points */}
            <div className="space-y-4">
              {modernTeamPoints.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#E5C38D] flex items-center justify-center shrink-0 group-hover:bg-[#C59E5F]/20 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#E5C38D] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Bottom Card Footer */}
          <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono text-zinc-500">Tier: Enterprise Ready</span>
            <button
              onClick={onViewOverview}
              className="text-[11px] font-bold text-[#E5C38D] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Live Console Stats</span>
              <ArrowRight className="w-3 h-3 text-[#C59E5F]" />
            </button>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* ROW 2: WHY OSTRAOPS GRID + OUR MISSION                       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Col (7 cols): Why OstraOps? 2x3 Grid */}
        <div className="lg:col-span-7 p-7 sm:p-8 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xl space-y-6">
          
          {/* Header */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-zinc-300">
              <span className="text-[#C59E5F] font-bold">—</span>
              <span className="uppercase tracking-wider">Why OstraOps?</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              AI is powerful — but without the right guardrails, it can get expensive, unpredictable and hard to manage. OstraOps gives you full visibility, control and optimization across all your AI usage.
            </p>
          </div>

          {/* 6 Grid Cards (2 cols x 3 rows) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl bg-[#07090C] border border-white/[0.08] hover:border-white/[0.2] transition-all group cursor-pointer ${feat.hoverBorder}`}
                >
                  <div className={`w-8 h-8 rounded-xl ${feat.bgColor} ${feat.color} border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#E5C38D] transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Col (5 cols): Our Mission Card */}
        <div className="lg:col-span-5 p-7 sm:p-8 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xl relative overflow-hidden flex flex-col justify-between">
          
          {/* Background Warm Golden Mountain Ray Vector */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <svg className="w-full h-full" viewBox="0 0 400 450" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sandstoneMountainRays" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#C59E5F" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#E5C38D" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0B0E14" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points="200,40 380,450 20,450" fill="url(#sandstoneMountainRays)" />
              <polygon points="320,180 400,450 240,450" fill="#C59E5F" opacity="0.2" />
              <polygon points="120,220 280,450 0,450" fill="#E5C38D" opacity="0.1" />
            </svg>
          </div>

          <div className="relative z-10 space-y-4">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#C59E5F] uppercase font-mono block">
              OUR MISSION
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              AI for everyone, under your control.
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
              We're building the infrastructure for a future where AI is powerful, accessible and cost-efficient — without the chaos.
            </p>
          </div>

          {/* Bottom 3 Mission Impact Metrics */}
          <div className="relative z-10 pt-8 border-t border-white/[0.08] grid grid-cols-3 gap-3">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                100%
              </div>
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                Visibility
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#E5C38D] font-mono tracking-tight">
                Lower
              </div>
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                Costs
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                Higher
              </div>
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                Productivity
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* ROW 3: SUPPORTED AI PROVIDERS                                */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Label */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-zinc-300">
            <span className="text-[#C59E5F] font-bold">—</span>
            <span>Supported AI Providers</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Works with the industry's leading models and platforms.
          </p>
        </div>

        {/* Provider Pills in Dark Theme */}
        <div className="flex flex-wrap items-center gap-3">
          {providers.map((p, idx) => (
            <div
              key={idx}
              className="px-3.5 py-2 rounded-xl bg-[#07090C] hover:bg-white/[0.06] border border-white/[0.08] hover:border-[#C59E5F]/50 text-xs font-bold text-zinc-200 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {p.iconType === 'openai' && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              )}
              {p.iconType === 'anthropic' && (
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#C59E5F]/20 text-[#E5C38D] font-bold">
                  AI
                </span>
              )}
              {p.iconType === 'google' && (
                <span className="text-[11px] font-mono font-bold text-blue-400">G</span>
              )}
              {p.iconType === 'meta' && (
                <span className="text-blue-400 text-xs font-bold">∞</span>
              )}
              {p.iconType === 'mistral' && (
                <span className="text-orange-400 font-mono font-bold text-xs">M</span>
              )}
              {p.iconType === 'cohere' && (
                <span className="text-zinc-400 font-mono font-bold text-xs">C</span>
              )}
              <span>{p.name}</span>
            </div>
          ))}

          {/* View All Integrations Link */}
          {onViewIntegrations ? (
            <button
              onClick={onViewIntegrations}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#E5C38D] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <span>View all integrations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs text-zinc-500 font-mono">+ More</span>
          )}
        </div>

      </div>


    </div>
  );
};
