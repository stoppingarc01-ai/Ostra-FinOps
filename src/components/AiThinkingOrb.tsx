import React, { useState, useEffect } from 'react';
import {
  AnthropicLogo,
  OpenAILogo,
  GeminiLogo,
  DeepSeekLogo,
  MetaLlamaLogo,
  MistralLogo,
  CohereLogo,
  KimiLogo,
  NvidiaLogo
} from './LLMLogos';
import { ShieldCheck, Zap } from 'lucide-react';

interface ModelOrbNode {
  id: string;
  name: string;
  family: string;
  latency: string;
  status: string;
  color: string;
  glowColor: string;
  Logo: React.FC<{ className?: string; size?: number }>;
  angle: number; // 0 to 360 around the orb
}

/**
 * The 9 official OstraOps models with signature brand colors.
 */
const ORBIT_MODELS: ModelOrbNode[] = [
  {
    id: 'gemini',
    name: 'Gemini 2.5',
    family: 'Google DeepMind',
    latency: '190ms',
    status: '2M Long-Context Guard',
    color: '#4285F4',
    glowColor: 'rgba(66, 133, 244, 0.55)',
    Logo: GeminiLogo,
    angle: 0, // Top
  },
  {
    id: 'openai',
    name: 'OpenAI',
    family: 'GPT-4o & o3-mini',
    latency: '280ms',
    status: 'Structured Outputs Enforced',
    color: '#10A37F',
    glowColor: 'rgba(16, 163, 127, 0.55)',
    Logo: OpenAILogo,
    angle: 40,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    family: 'Claude 3.7 Sonnet',
    latency: '310ms',
    status: 'Intra-Family Protected',
    color: '#D97706',
    glowColor: 'rgba(217, 119, 6, 0.55)',
    Logo: AnthropicLogo,
    angle: 80,
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    family: 'Mistral Large 2',
    latency: '240ms',
    status: 'Code & FIM Protected',
    color: '#FA520F',
    glowColor: 'rgba(250, 82, 15, 0.55)',
    Logo: MistralLogo,
    angle: 120,
  },
  {
    id: 'meta',
    name: 'Meta Llama',
    family: 'Llama 3.3 70B & 405B',
    latency: '145ms',
    status: 'Air-Gapped & Local Proxy',
    color: '#0866FF',
    glowColor: 'rgba(8, 102, 255, 0.55)',
    Logo: MetaLlamaLogo,
    angle: 160,
  },
  {
    id: 'nvidia',
    name: 'NVIDIA Nemotron',
    family: 'Nemotron-3 Ultra (550B)',
    latency: '240ms',
    status: 'TensorRT-LLM Armed',
    color: '#76B900',
    glowColor: 'rgba(118, 185, 0, 0.55)',
    Logo: NvidiaLogo,
    angle: 200,
  },
  {
    id: 'kimi',
    name: 'Kimi',
    family: 'Moonshot AI',
    latency: '210ms',
    status: '128K Context Stream',
    color: '#0686FF',
    glowColor: 'rgba(6, 134, 255, 0.55)',
    Logo: KimiLogo,
    angle: 240,
  },
  {
    id: 'cohere',
    name: 'Cohere',
    family: 'Command R+',
    latency: '320ms',
    status: 'RAG Grounding Shield',
    color: '#39594D',
    glowColor: 'rgba(57, 89, 77, 0.55)',
    Logo: CohereLogo,
    angle: 280,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    family: 'DeepSeek R1 & V3',
    latency: '390ms',
    status: 'Zero Egress Shield',
    color: '#1E56F0',
    glowColor: 'rgba(30, 86, 240, 0.55)',
    Logo: DeepSeekLogo,
    angle: 320,
  },
];

/**
 * Modern AI Core Orb & Floating Constellation
 * Clean, futuristic theme: deep cosmic glass, iridescent aurora, zero black smudges.
 */
export const AiThinkingOrb: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Soft auto-cycle when user is not hovering
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % ORBIT_MODELS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isHovered]);

  const active = ORBIT_MODELS[activeIdx];
  const ActiveLogo = active.Logo;

  return (
    <div
      className="relative w-full aspect-square max-w-[480px] sm:max-w-[520px] lg:max-w-[560px] mx-auto flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic Ambient Background Nebula matched to active model */}
      <div
        className="absolute inset-0 rounded-full blur-[110px] opacity-45 transition-all duration-1000 pointer-events-none -z-10"
        style={{
          background: `radial-gradient(circle, ${active.glowColor} 0%, rgba(197, 158, 95, 0.18) 45%, transparent 75%)`,
        }}
      />

      {/* Gyroscope Orbital Ring 1: Outer Celestial Band */}
      <div
        className="absolute w-[88%] h-[88%] rounded-full border border-dashed border-white/[0.14] pointer-events-none animate-spin-slow"
        style={{
          transform: 'rotateX(66deg) rotateY(12deg)',
          transformStyle: 'preserve-3d',
        }}
      />

      {/* Gyroscope Orbital Ring 2: Counter-rotating Inner Band */}
      <div
        className="absolute w-[74%] h-[74%] rounded-full border border-white/[0.1] pointer-events-none"
        style={{
          transform: 'rotateX(58deg) rotateY(-24deg)',
          animation: 'spin-slow 32s linear infinite reverse',
        }}
      >
        {/* Pulsing satellite photon on ring */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-[0_0_12px_#C59E5F]"
          style={{ backgroundColor: active.color }}
        />
      </div>

      {/* Subtle Circular Grid Guide */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <circle
          cx="50%"
          cy="50%"
          r="41%"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
      </svg>

      {/* ============================================================ */}
      {/* 9 FLOATING MODEL LOGOS (Prominent, Transparent, Floating)     */}
      {/* ============================================================ */}
      <div className="absolute inset-0 w-full h-full">
        {ORBIT_MODELS.map((model, idx) => {
          const isActive = idx === activeIdx;
          const NodeLogo = model.Logo;

          // Trigonometric orbit placement (Radius ~41% from center)
          const rad = (model.angle - 90) * (Math.PI / 180);
          const orbitRadiusPercent = 41;
          const leftPercent = 50 + orbitRadiusPercent * Math.cos(rad);
          const topPercent = 50 + orbitRadiusPercent * Math.sin(rad);

          // Staggered floating motion
          const floatClass =
            idx % 4 === 0
              ? 'animate-float-1'
              : idx % 4 === 1
              ? 'animate-float-2'
              : idx % 4 === 2
              ? 'animate-float-3'
              : 'animate-float-4';

          return (
            <div
              key={model.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => setActiveIdx(idx)}
                aria-label={`Inspect ${model.name} (${model.latency})`}
                className={`group relative flex items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all duration-300 cursor-pointer ${floatClass} ${
                  isActive ? 'scale-115 z-30' : 'hover:scale-110'
                }`}
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(14,18,26,0.92) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(10,13,18,0.78) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isActive
                    ? `1.5px solid ${model.color}`
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: isActive
                    ? `0 0 28px -2px ${model.glowColor}, inset 0 1px 1px rgba(255,255,255,0.2), 0 8px 20px rgba(0,0,0,0.7)`
                    : '0 4px 14px rgba(0,0,0,0.4)',
                }}
              >
                {/* Clean, prominent floating vector logo */}
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    color: model.id === 'openai' || model.id === 'anthropic' ? '#FFFFFF' : model.color,
                  }}
                >
                  <NodeLogo className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
                </div>

                {/* Subtle active glow dot */}
                {isActive && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#0B0E14] animate-pulse"
                    style={{ backgroundColor: model.color }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* CENTRAL 3D GLOWING AI THINKING ORB (Futuristic Cosmic Theme) */}
      {/* ============================================================ */}
      <div className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full flex items-center justify-center">
        {/* Ambient Soft Outer Glow Halo */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse-halo pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${active.color} 0%, #C59E5F 45%, transparent 75%)`,
          }}
        />

        {/* Outer Glowing Precision Rim */}
        <div
          className="absolute inset-0 rounded-full border border-white/25 shadow-[inset_0_1px_8px_rgba(255,255,255,0.3)] pointer-events-none"
          style={{
            boxShadow: `0 0 35px ${active.glowColor}, inset 0 0 20px rgba(255, 255, 255, 0.15)`,
          }}
        />

        {/* Sphere Glass Body: Cosmic Dark Gradient with Iridescent Gold/Blue Edge */}
        <div
          className="w-full h-full rounded-full relative overflow-hidden transition-all duration-700 flex items-center justify-center p-3"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(25, 32, 48, 0.95) 0%, rgba(15, 19, 28, 0.98) 55%, #07090C 100%)',
          }}
        >
          {/* Subtle Rotating Auroral Conic Shimmer */}
          <div
            className="absolute inset-0 rounded-full opacity-35 animate-spin-slow pointer-events-none"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(197,158,95,0.35) 90deg, transparent 180deg, rgba(66,133,244,0.35) 270deg, transparent 360deg)',
            }}
          />

          {/* Smooth Specular Light Curve at the Top (No hard divs or dark smudges) */}
          <div
            className="absolute top-0 inset-x-0 h-1/2 rounded-t-full pointer-events-none opacity-40"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.4) 0%, transparent 70%)',
            }}
          />

          {/* Central AI Nexus Core: Active Model Spotlight */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            {/* Active Model Logo — Prominent & Clean */}
            <div
              className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 flex items-center justify-center mb-1.5 transition-transform duration-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
              style={{
                color: active.id === 'openai' || active.id === 'anthropic' ? '#FFFFFF' : active.color,
              }}
            >
              <ActiveLogo className="w-full h-full" />
            </div>

            {/* Core Model Name */}
            <span className="text-xs sm:text-[13px] font-extrabold text-white font-display tracking-tight leading-tight block">
              {active.name}
            </span>

            {/* Real-time Telemetry Tag */}
            <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] text-emerald-400 font-mono font-semibold">
              <Zap className="w-3 h-3" />
              <span>{active.latency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Telemetry Pill */}
      <div className="absolute -bottom-3 sm:bottom-0 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B0E14]/90 backdrop-blur-md border border-white/10 shadow-xl whitespace-nowrap">
        <ShieldCheck className="w-3.5 h-3.5 text-[#C59E5F]" />
        <span className="text-[10px] sm:text-[11px] font-mono text-zinc-300 font-medium">
          {active.family} • <span className="text-[#E5C38D] font-bold">{active.status}</span>
        </span>
      </div>
    </div>
  );
};
