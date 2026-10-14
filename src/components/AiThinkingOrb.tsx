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
 * The 9 official OstraOps models (pure transparent vector marks, no background, no text).
 */
const ORBIT_MODELS: ModelOrbNode[] = [
  {
    id: 'gemini',
    name: 'Gemini 2.5',
    family: 'Google DeepMind',
    latency: '190ms',
    status: '2M Long-Context Guard',
    color: '#4285F4',
    glowColor: 'rgba(66, 133, 244, 0.45)',
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
    glowColor: 'rgba(16, 163, 127, 0.45)',
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
    glowColor: 'rgba(217, 119, 6, 0.45)',
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
    glowColor: 'rgba(250, 82, 15, 0.45)',
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
    glowColor: 'rgba(8, 102, 255, 0.45)',
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
    glowColor: 'rgba(118, 185, 0, 0.45)',
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
    glowColor: 'rgba(6, 134, 255, 0.45)',
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
    glowColor: 'rgba(57, 89, 77, 0.45)',
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
    glowColor: 'rgba(30, 86, 240, 0.45)',
    Logo: DeepSeekLogo,
    angle: 320,
  },
];

/**
 * Modern AI Core Thinking Orb & Floating Models Constellation
 * Clean transparent backgrounds, prominent floating logos, zero bloat.
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
      {/* Dynamic Ambient Background Aura matched to active model */}
      <div
        className="absolute inset-0 rounded-full blur-[100px] opacity-40 transition-all duration-1000 pointer-events-none -z-10"
        style={{
          background: `radial-gradient(circle, ${active.glowColor} 0%, rgba(197, 158, 95, 0.15) 45%, transparent 70%)`,
        }}
      />

      {/* Outer Gyroscope Orbital Ring 1 */}
      <div
        className="absolute w-[88%] h-[88%] rounded-full border border-dashed border-white/[0.12] pointer-events-none animate-spin-slow"
        style={{
          transform: 'rotateX(66deg) rotateY(12deg)',
          transformStyle: 'preserve-3d',
        }}
      />

      {/* Counter-rotating Inner Orbital Ring 2 */}
      <div
        className="absolute w-[74%] h-[74%] rounded-full border border-white/[0.08] pointer-events-none"
        style={{
          transform: 'rotateX(58deg) rotateY(-24deg)',
          animation: 'spin-slow 34s linear infinite reverse',
        }}
      >
        {/* Pulsing satellite tracer on ring */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-[0_0_12px_#C59E5F]"
          style={{ backgroundColor: active.color }}
        />
      </div>

      {/* SVG Circular Grid Guide */}
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
                  isActive
                    ? 'scale-115 z-30'
                    : 'hover:scale-110'
                }`}
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(11,14,20,0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(11,14,20,0.75) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isActive
                    ? `1.5px solid ${model.color}`
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: isActive
                    ? `0 0 28px -2px ${model.glowColor}, inset 0 1px 1px rgba(255,255,255,0.2), 0 10px 24px rgba(0,0,0,0.8)`
                    : '0 4px 14px rgba(0,0,0,0.5)',
                }}
              >
                {/* Clean, prominent floating logo icon */}
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
      {/* CENTRAL 3D GLOWING AI THINKING ORB                           */}
      {/* ============================================================ */}
      <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full flex items-center justify-center">
        {/* Deep Radiant Core Aura */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-75 animate-pulse-halo"
          style={{
            background: `radial-gradient(circle, ${active.color} 0%, #C59E5F 50%, transparent 80%)`,
          }}
        />

        {/* Outer Glass Sphere Contour with Specular Edge */}
        <div className="absolute inset-0 rounded-full border border-white/20 shadow-[inset_0_2px_12px_rgba(255,255,255,0.25)] pointer-events-none" />

        {/* Sphere Gradient Body */}
        <div
          className="w-full h-full rounded-full relative overflow-hidden transition-all duration-700 p-0.5"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, rgba(255, 247, 237, 0.95) 0%, rgba(229, 195, 141, 0.8) 25%, rgba(197, 158, 95, 0.9) 55%, #0B0E14 100%)',
            boxShadow: `0 0 35px ${active.glowColor}, inset 0 0 25px rgba(255, 255, 255, 0.3)`,
          }}
        >
          {/* Internal Rotating Light Aura */}
          <div
            className="absolute inset-0 rounded-full opacity-60 animate-spin-slow pointer-events-none"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.4) 90deg, transparent 180deg, rgba(197,158,95,0.6) 270deg, transparent 360deg)',
            }}
          />

          {/* Core HUD Spotlight: Big active logo + telemetry */}
          <div className="absolute inset-3 rounded-full bg-[#07090C]/88 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center border border-white/10 shadow-inner">
            {/* Active Model Logo — Prominent & Transparent */}
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1.5 transition-transform duration-300 scale-100 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              style={{
                color: active.id === 'openai' || active.id === 'anthropic' ? '#FFFFFF' : active.color,
              }}
            >
              <ActiveLogo className="w-full h-full" />
            </div>

            {/* Core Model Name */}
            <span className="text-[11px] sm:text-xs font-extrabold text-white font-display tracking-tight leading-tight block">
              {active.name}
            </span>

            {/* Real-time Telemetry Tag */}
            <div className="flex items-center gap-1 mt-1 text-[9px] sm:text-[10px] text-emerald-400 font-mono font-semibold">
              <Zap className="w-2.5 h-2.5" />
              <span>{active.latency}</span>
            </div>
          </div>

          {/* Specular 3D Glass Light Glint */}
          <div className="absolute top-2 left-6 w-12 h-6 rounded-full bg-white/30 blur-[2px] transform -rotate-25 pointer-events-none" />
        </div>
      </div>

      {/* Floating Bottom Telemetry Pill */}
      <div className="absolute -bottom-3 sm:bottom-0 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0E14]/90 backdrop-blur-md border border-white/10 shadow-lg whitespace-nowrap">
        <ShieldCheck className="w-3.5 h-3.5 text-[#C59E5F]" />
        <span className="text-[10px] sm:text-[11px] font-mono text-zinc-300 font-medium">
          {active.family} • <span className="text-[#E5C38D] font-bold">{active.status}</span>
        </span>
      </div>
    </div>
  );
};
