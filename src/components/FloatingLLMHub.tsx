import React, { useState } from 'react';
import { 
  OpenAILogo, 
  AnthropicLogo, 
  GeminiLogo, 
  MetaLlamaLogo, 
  MistralLogo, 
  DeepSeekLogo, 
  CohereLogo, 
  GroqLogo 
} from './LLMLogos';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

interface ModelBadge {
  id: string;
  name: string;
  provider: string;
  flagship: string;
  models: string[];
  context: string;
  inputCost: string;
  outputCost: string;
  avgLatency: string;
  status: 'Zero Egress' | 'Intra-Family Protected' | 'Rate-Limit Shielded' | 'Local VLLM';
  logo: React.FC<{ className?: string; size?: number }>;
  color: string;
  bgGlow: string;
  borderColor: string;
  floatClass: string;
  tag: string;
  toolCallFidelity: string;
}

interface FloatingLLMHubProps {
  onNavigateToModels?: () => void;
}

export const FloatingLLMHub: React.FC<FloatingLLMHubProps> = ({ onNavigateToModels }) => {
  const [activeModelId, setActiveModelId] = useState<string>('anthropic');

  const models: ModelBadge[] = [
    {
      id: 'anthropic',
      name: 'Anthropic',
      provider: 'Claude Family',
      flagship: 'Claude 3.7 Sonnet',
      models: ['claude-3-7-sonnet', 'claude-3-5-sonnet', 'claude-3-5-haiku'],
      context: '200,000 tokens',
      inputCost: '$3.00 / 1M',
      outputCost: '$15.00 / 1M',
      avgLatency: '340ms',
      status: 'Intra-Family Protected',
      logo: AnthropicLogo,
      color: 'text-[#D97706]',
      bgGlow: 'from-amber-500/15 via-orange-500/5 to-transparent',
      borderColor: 'hover:border-amber-500/40',
      floatClass: 'animate-float-1',
      tag: 'Tier 1 Failover Armed',
      toolCallFidelity: '100% Native Tool-Use (No Cross-Vendor Jitter)',
    },
    {
      id: 'openai',
      name: 'OpenAI',
      provider: 'GPT & Reasoning',
      flagship: 'GPT-4o & o3-mini',
      models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'o1-preview'],
      context: '128,000 tokens',
      inputCost: '$2.50 / 1M',
      outputCost: '$10.00 / 1M',
      avgLatency: '280ms',
      status: 'Intra-Family Protected',
      logo: OpenAILogo,
      color: 'text-[#10A37F]',
      bgGlow: 'from-emerald-500/15 via-teal-500/5 to-transparent',
      borderColor: 'hover:border-emerald-500/40',
      floatClass: 'animate-float-2',
      tag: 'Structured Outputs Enforced',
      toolCallFidelity: 'Strict JSON Schema & Function Calling',
    },
    {
      id: 'google',
      name: 'Google Gemini',
      provider: 'DeepMind Multi-Modal',
      flagship: 'Gemini 2.5 Pro',
      models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-1.5-pro'],
      context: '2,000,000 tokens',
      inputCost: '$1.25 / 1M',
      outputCost: '$5.00 / 1M',
      avgLatency: '190ms',
      status: 'Rate-Limit Shielded',
      logo: GeminiLogo,
      color: 'text-[#4285F4]',
      bgGlow: 'from-blue-500/15 via-indigo-500/5 to-transparent',
      borderColor: 'hover:border-blue-500/40',
      floatClass: 'animate-float-3',
      tag: '2M Long-Context Guard',
      toolCallFidelity: 'Native Python Code Execution & Search',
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      provider: 'DeepSeek Reasoning',
      flagship: 'DeepSeek-R1 & V3',
      models: ['deepseek-reasoner', 'deepseek-chat'],
      context: '64,000 tokens',
      inputCost: '$0.55 / 1M',
      outputCost: '$2.19 / 1M',
      avgLatency: '410ms',
      status: 'Zero Egress',
      logo: DeepSeekLogo,
      color: 'text-[#1E56F0]',
      bgGlow: 'from-blue-600/15 via-sky-500/5 to-transparent',
      borderColor: 'hover:border-blue-600/40',
      floatClass: 'animate-float-4',
      tag: 'High Velocity Cost Shield',
      toolCallFidelity: 'CoT Reasoning Stream Intercept',
    },
    {
      id: 'meta',
      name: 'Meta Llama',
      provider: 'Open Weights & VLLM',
      flagship: 'Llama 3.3 70B & 405B',
      models: ['llama-3.3-70b-instruct', 'llama-3.1-405b'],
      context: '128,000 tokens',
      inputCost: '$0.60 / 1M',
      outputCost: '$1.20 / 1M',
      avgLatency: '145ms',
      status: 'Local VLLM',
      logo: MetaLlamaLogo,
      color: 'text-[#0866FF]',
      bgGlow: 'from-sky-500/15 via-blue-500/5 to-transparent',
      borderColor: 'hover:border-sky-500/40',
      floatClass: 'animate-float-2',
      tag: 'Air-Gapped & Local Proxy',
      toolCallFidelity: 'Ollama, vLLM & Localhost Loopback',
    },
    {
      id: 'mistral',
      name: 'Mistral AI',
      provider: 'European Frontier Models',
      flagship: 'Mistral Large 2 & Codestral',
      models: ['mistral-large-latest', 'codestral-2501'],
      context: '128,000 tokens',
      inputCost: '$2.00 / 1M',
      outputCost: '$6.00 / 1M',
      avgLatency: '240ms',
      status: 'Intra-Family Protected',
      logo: MistralLogo,
      color: 'text-[#FA520F]',
      bgGlow: 'from-orange-500/15 via-red-500/5 to-transparent',
      borderColor: 'hover:border-orange-500/40',
      floatClass: 'animate-float-1',
      tag: 'Code Generation Guard',
      toolCallFidelity: 'FIM & Fill-in-Middle Compliant',
    },
    {
      id: 'cohere',
      name: 'Cohere',
      provider: 'Enterprise Command R',
      flagship: 'Command R+ (08-2024)',
      models: ['command-r-plus', 'command-r'],
      context: '128,000 tokens',
      inputCost: '$2.50 / 1M',
      outputCost: '$10.00 / 1M',
      avgLatency: '320ms',
      status: 'Zero Egress',
      logo: CohereLogo,
      color: 'text-[#39594D]',
      bgGlow: 'from-emerald-600/15 via-teal-600/5 to-transparent',
      borderColor: 'hover:border-emerald-600/40',
      floatClass: 'animate-float-3',
      tag: 'RAG Grounding Verified',
      toolCallFidelity: 'Citations & Connector Schemas',
    },
    {
      id: 'groq',
      name: 'Groq LPU',
      provider: 'Ultra-Fast Inference',
      flagship: 'LPU Ultra-Low Latency',
      models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
      context: '128,000 tokens',
      inputCost: '$0.59 / 1M',
      outputCost: '$0.79 / 1M',
      avgLatency: '45ms',
      status: 'Rate-Limit Shielded',
      logo: GroqLogo,
      color: 'text-[#F55036]',
      bgGlow: 'from-rose-500/15 via-amber-500/5 to-transparent',
      borderColor: 'hover:border-rose-500/40',
      floatClass: 'animate-float-4',
      tag: '45ms Sub-Second Tier',
      toolCallFidelity: 'Streaming Token Velocity Regulator',
    },
  ];

  const selected = models.find((m) => m.id === activeModelId) || models[0];
  const SelectedLogo = selected.logo;

  return (
    <section className="relative py-20 bg-[#FAF8F5] border-t border-[#EAE5DB] overflow-hidden">
      {/* 3D Radial Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-ostraGold-300/15 via-sandstone-300/25 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-semibold text-ostraGold-700 uppercase tracking-wider mb-2 font-mono">
            Supported Models &amp; Providers
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-charcoal-900 tracking-[-0.02em] font-display">
            Compare AI Models.{' '}
            <span className="gold-gradient-text block">Track Spend Down to the Cent.</span>
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
            Switch smoothly between Claude, GPT, Gemini, and open-source models without locking into a single vendor. OstraOps tracks your tokens and calculates exact costs in real time.
          </p>
        </div>

        {/* 3D Floating Logos Orbit Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-10 perspective-1200">
          {models.map((m) => {
            const LogoComponent = m.logo;
            const isSelected = m.id === activeModelId;
            return (
              <div
                key={m.id}
                onClick={() => setActiveModelId(m.id)}
                className={`group relative cursor-pointer p-4 rounded-2xl bg-white border transition-all duration-300 transform preserve-3d ${
                  m.floatClass
                } ${
                  isSelected
                    ? 'border-ostraGold-500 shadow-[0_15px_30px_-10px_rgba(212,175,124,0.35),0_0_0_2px_rgba(212,175,124,0.5)] -translate-y-2'
                    : 'border-[#EAE5DB] hover:border-sandstone-400 shadow-subtle hover:shadow-card-3d hover:-translate-y-1'
                }`}
              >
                {/* 3D Glass Light reflection */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

                <div className="flex flex-col items-center text-center gap-2 relative z-10">
                  {/* Floating Logo Squircle */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center p-2.5 transition-transform duration-300 group-hover:scale-110 shadow-xs ${
                      isSelected
                        ? 'bg-charcoal-900 text-white shadow-md'
                        : 'bg-sandstone-200/80 text-charcoal-800'
                    }`}
                  >
                    <LogoComponent className="w-6 h-6" />
                  </div>

                  {/* Brand & Flagship */}
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-charcoal-900 block truncate">
                      {m.name}
                    </span>
                    <span className="text-[10px] text-charcoal-500 font-mono block">
                      {m.avgLatency}
                    </span>
                  </div>

                  {/* Active Indicator */}
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-ostraGold-500 mt-1 shadow-[0_0_8px_#D4AF7C]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Model 3D Deep-Dive Glass Card */}
        <div className="relative rounded-3xl bg-white border border-[#EAE5DB] shadow-dashboard-3d overflow-hidden p-6 sm:p-8 lg:p-10">
          {/* Subtle Ambient Radial Glow */}
          <div className={`absolute top-0 right-0 w-[500px] h-[350px] bg-gradient-to-bl ${selected.bgGlow} blur-[80px] pointer-events-none`} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left: Model Details & Capabilities (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-charcoal-900 text-white flex items-center justify-center p-2.5 shadow-md">
                  <SelectedLogo className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-charcoal-900 font-display">
                      {selected.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-sandstone-200 text-charcoal-700 text-[10px] font-bold font-mono tracking-wide border border-sandstone-300">
                      {selected.status}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 font-mono">
                    Provider: {selected.provider} • Current Flagship: {selected.flagship}
                  </p>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEBE3]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block font-mono">
                    Context Window
                  </span>
                  <span className="text-sm font-extrabold text-charcoal-900 font-mono mt-0.5 block">
                    {selected.context}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block font-mono">
                    Input Cost
                  </span>
                  <span className="text-sm font-extrabold text-charcoal-900 font-mono mt-0.5 block">
                    {selected.inputCost}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block font-mono">
                    Output Cost
                  </span>
                  <span className="text-sm font-extrabold text-charcoal-900 font-mono mt-0.5 block">
                    {selected.outputCost}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block font-mono">
                    Avg Response Time
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600 font-mono mt-0.5 block">
                    {selected.avgLatency}
                  </span>
                </div>
              </div>

              {/* Practical benefits in human language */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-charcoal-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-charcoal-900">Real-Time Cost Tracking: </span>
                    <span>Tokens are tracked per request so you always know your exact spend as calls finish.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-charcoal-700">
                  <ShieldCheck className="w-4 h-4 text-ostraGold-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-charcoal-900">Custom Budget Limits: </span>
                    <span>Set daily or monthly limits to stop runaway scripts before they drain your account balance.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-charcoal-700">
                  <Lock className="w-4 h-4 text-charcoal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-charcoal-900">Zero Prompt Logging: </span>
                    <span>Your source code, prompts, and sensitive answers stay 100% private. We never store them.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Clean Practical Profile Box (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-charcoal-950 text-white border border-charcoal-800 shadow-2xl text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-zinc-200 font-bold font-sans">Model Practical Profile</span>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded bg-charcoal-800 text-ostraGold-400 border border-charcoal-700 font-mono">
                  {selected.tag}
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
                <div className="flex justify-between pb-2 border-b border-charcoal-800/60">
                  <span className="text-zinc-400">Model Name:</span>
                  <span className="text-white font-semibold">{selected.flagship}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-charcoal-800/60">
                  <span className="text-zinc-400">Best Used For:</span>
                  <span className="text-ostraGold-300 font-medium text-right max-w-[200px] truncate">{selected.toolCallFidelity}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-charcoal-800/60">
                  <span className="text-zinc-400">Estimated 100k Tokens Cost:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    ~${((parseFloat(selected.inputCost.replace('$', '').split('/')[0] || '1') * 0.08) + (parseFloat(selected.outputCost.replace('$', '').split('/')[0] || '2') * 0.02)).toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Privacy &amp; Data:</span>
                  <span className="text-emerald-400">Direct Vendor Connection</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-zinc-300 space-y-1.5">
                <p className="text-zinc-400 text-[11px]">How OstraOps protects your calls to this model:</p>
                <p className="text-zinc-200 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> Real-time budget limit check before each call
                </p>
                <p className="text-zinc-200 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> Accurate token counting from official API response
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Explore all 40+ models catalog link button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              if (onNavigateToModels) {
                onNavigateToModels();
              } else {
                window.location.hash = '#models';
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-charcoal-900 hover:bg-black text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <span>Explore Complete Model Directory &amp; Pricing</span>
            <ArrowRight className="w-4 h-4 text-ostraGold-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
