import React, { useState, useEffect } from 'react';
import {
  OpenAILogo,
  AnthropicLogo,
  GeminiLogo,
  DeepSeekLogo,
  GrokLogo,
  KimiLogo,
  QwenLogo,
  GLMLogo
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
  borderColor: string;
  bgGradient: string;
  Logo: React.FC<{ className?: string; size?: number }>;
  // Orbit placement (angle in degrees 0-360, radius in px)
  angle: number;
}

const ORBIT_MODELS: ModelOrbNode[] = [
  {
    id: 'gemini',
    name: 'Gemini 2.5',
    family: 'Google DeepMind',
    latency: '190ms',
    status: '2M Long-Context Guard',
    color: '#4285F4',
    glowColor: 'rgba(66, 133, 244, 0.45)',
    borderColor: 'border-blue-500/40',
    bgGradient: 'from-blue-500/20 to-purple-500/10',
    Logo: GeminiLogo,
    angle: 0, // Top
  },
  {
    id: 'grok',
    name: 'Grok 3',
    family: 'xAI Reasoning',
    latency: '260ms',
    status: 'Real-time Grounded',
    color: '#E4E4E7',
    glowColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'border-zinc-300/40',
    bgGradient: 'from-zinc-400/20 to-zinc-600/10',
    Logo: GrokLogo,
    angle: 45, // Top Right
  },
  {
    id: 'openai',
    name: 'GPT-4o & o3',
    family: 'OpenAI Frontier',
    latency: '280ms',
    status: 'Strict Output Enforced',
    color: '#10A37F',
    glowColor: 'rgba(16, 163, 127, 0.45)',
    borderColor: 'border-emerald-500/40',
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
    Logo: OpenAILogo,
    angle: 90, // Right
  },
  {
    id: 'qwen',
    name: 'Qwen 2.5',
    family: 'Alibaba Cloud',
    latency: '210ms',
    status: 'Code & Math SOTA',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.45)',
    borderColor: 'border-purple-500/40',
    bgGradient: 'from-purple-500/20 to-indigo-500/10',
    Logo: QwenLogo,
    angle: 135, // Bottom Right
  },
  {
    id: 'anthropic',
    name: 'Claude 3.7',
    family: 'Anthropic Sonnet',
    latency: '310ms',
    status: 'Intra-Family Protected',
    color: '#D97706',
    glowColor: 'rgba(217, 119, 6, 0.45)',
    borderColor: 'border-amber-500/40',
    bgGradient: 'from-amber-500/20 to-orange-500/10',
    Logo: AnthropicLogo,
    angle: 180, // Bottom
  },
  {
    id: 'glm',
    name: 'GLM-4',
    family: 'Zhipu AI Frontier',
    latency: '250ms',
    status: 'Bilingual Reasoning',
    color: '#C59E5F',
    glowColor: 'rgba(197, 158, 95, 0.45)',
    borderColor: 'border-[#C59E5F]/40',
    bgGradient: 'from-[#C59E5F]/20 to-amber-600/10',
    Logo: GLMLogo,
    angle: 225, // Bottom Left
  },
  {
    id: 'deepseek',
    name: 'DeepSeek R1',
    family: 'DeepSeek Reasoning',
    latency: '390ms',
    status: 'Zero Egress Shield',
    color: '#1E56F0',
    glowColor: 'rgba(30, 86, 240, 0.45)',
    borderColor: 'border-blue-600/40',
    bgGradient: 'from-blue-600/20 to-sky-500/10',
    Logo: DeepSeekLogo,
    angle: 270, // Left
  },
  {
    id: 'kimi',
    name: 'Kimi k1.5',
    family: 'Moonshot AI',
    latency: '220ms',
    status: '128K Context Stream',
    color: '#0686FF',
    glowColor: 'rgba(6, 134, 255, 0.45)',
    borderColor: 'border-cyan-500/40',
    bgGradient: 'from-cyan-500/20 to-blue-500/10',
    Logo: KimiLogo,
    angle: 315, // Top Left
  },
];

/**
 * Modern AI Core Thinking Orb & Multi-Model Constellation
 * Clean, GPU-accelerated 3D CSS transforms with zero bloat.
 */
export const AiThinkingOrb: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Auto-cycle active model softly every 3.2s when not hovered
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
      className="relative w-full aspect-square max-w-[460px] sm:max-w-[500px] lg:max-w-[540px] mx-auto flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic Ambient Background Glow matched to active model */}
      <div
        className="absolute inset-0 rounded-full blur-[90px] opacity-40 transition-all duration-1000 pointer-events-none -z-10"
        style={{
          background: `radial-gradient(circle, ${active.glowColor} 0%, rgba(197, 158, 95, 0.12) 40%, transparent 70%)`,
        }}
      />

      {/* Outer Gyroscope Orbital Ring 1 */}
      <div
        className="absolute w-[86%] h-[86%] rounded-full border border-dashed border-white/[0.12] pointer-events-none animate-spin-slow"
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
          animation: 'spin-slow 32s linear infinite reverse',
        }}
      >
        {/* Pulsing satellite tracer on ring */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-[0_0_12px_#C59E5F]"
          style={{ backgroundColor: active.color }}
        />
      </div>

      {/* SVG Connecting Ray Beams to Active Model */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <linearGradient id="beam-grad" x1="50%" y1="50%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#C59E5F" stopOpacity="0.6" />
            <stop offset="70%" stopColor={active.color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={active.color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Subtle circular grid guides */}
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
      {/* 8 ORBITING MODEL BADGES (From User's Models Image)            */}
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

          // Staggered float class for breathing motion
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
                className={`group relative flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl transition-all duration-300 cursor-pointer ${floatClass} ${
                  isActive
                    ? 'bg-[#0E121A] scale-110 shadow-2xl z-30'
                    : 'bg-[#090C10]/85 hover:bg-[#0E121A] hover:scale-105'
                }`}
                style={{
                  border: isActive
                    ? `1px solid ${model.color}`
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isActive
                    ? `0 0 24px -2px ${model.glowColor}, 0 10px 20px -5px rgba(0,0,0,0.8)`
                    : '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                {/* Logo icon container */}
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0 shadow-inner"
                  style={{
                    backgroundColor: isActive
                      ? `${model.color}15`
                      : 'rgba(255, 255, 255, 0.05)',
                    color: model.color,
                  }}
                >
                  <NodeLogo className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>

                {/* Model Name Label (visible on active or on tablet/desktop) */}
                <span
                  className={`text-[11px] font-bold font-display whitespace-nowrap transition-colors duration-200 hidden sm:inline-block pr-1 ${
                    isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  {model.name}
                </span>

                {/* Active Indicator pip */}
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse mr-0.5"
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

        {/* Outer Glass Sphere Contour with specular edge */}
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
          {/* Internal rotating light aura */}
          <div
            className="absolute inset-0 rounded-full opacity-60 animate-spin-slow pointer-events-none"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.4) 90deg, transparent 180deg, rgba(197,158,95,0.6) 270deg, transparent 360deg)',
            }}
          />

          {/* Core HUD Shield Display */}
          <div className="absolute inset-3 rounded-full bg-[#07090C]/85 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center border border-white/10 shadow-inner">
            {/* Active Model Logo in Core */}
            <div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center mb-1.5 transition-transform duration-300 scale-100 shadow-md border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: `${active.color}40`,
                color: active.color,
              }}
            >
              <ActiveLogo className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* Core Label */}
            <span className="text-[11px] sm:text-xs font-extrabold text-white font-display tracking-tight leading-tight block">
              {active.name}
            </span>

            {/* Real-time telemetry tag */}
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
