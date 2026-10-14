import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

interface ModelOrbNode {
  id: string;
  name: string;
  family: string;
  latency: string;
  status: string;
  color: string;
  glowColor: string;
  bgPos: string; // CSS background-position in /models-showcase.jpg (3x3 grid)
  angle: number; // 0 to 360 around the orb
}

/**
 * The 9 official OstraOps models from user-created showcase graphic:
 * Row 0: Anthropic (0% 0%), OpenAI (50% 0%), Gemini (100% 0%)
 * Row 1: DeepSeek (0% 50%), Meta Llama (50% 50%), Mistral AI (100% 50%)
 * Row 2: Cohere (0% 100%), Kimi (50% 100%), NVIDIA Nemotron (100% 100%)
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
    bgPos: '100% 0%', // Col 2, Row 0
    angle: 0,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    family: 'GPT-4o & o3-mini',
    latency: '280ms',
    status: 'Structured Outputs Enforced',
    color: '#10A37F',
    glowColor: 'rgba(16, 163, 127, 0.45)',
    bgPos: '50% 0%', // Col 1, Row 0
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
    bgPos: '0% 0%', // Col 0, Row 0
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
    bgPos: '100% 50%', // Col 2, Row 1
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
    bgPos: '50% 50%', // Col 1, Row 1
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
    bgPos: '100% 100%', // Col 2, Row 2
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
    bgPos: '50% 100%', // Col 1, Row 2
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
    bgPos: '0% 100%', // Col 0, Row 2
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
    bgPos: '0% 50%', // Col 0, Row 1
    angle: 320,
  },
];

/**
 * Modern AI Core Thinking Orb & Multi-Model Constellation
 * Uses the user's graphic for the 9 official OstraOps models.
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

  return (
    <div
      className="relative w-full aspect-square max-w-[460px] sm:max-w-[500px] lg:max-w-[540px] mx-auto flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic Ambient Background Glow matched to active model */}
      <div
        className="absolute inset-0 rounded-full blur-[100px] opacity-40 transition-all duration-1000 pointer-events-none -z-10"
        style={{
          background: `radial-gradient(circle, ${active.glowColor} 0%, rgba(197, 158, 95, 0.15) 45%, transparent 70%)`,
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
      {/* 9 ORBITING MODEL BADGES (User Graphic: /models-showcase.jpg) */}
      {/* ============================================================ */}
      <div className="absolute inset-0 w-full h-full">
        {ORBIT_MODELS.map((model, idx) => {
          const isActive = idx === activeIdx;

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
                className={`group relative flex items-center gap-1.5 p-1 rounded-2xl transition-all duration-300 cursor-pointer ${floatClass} ${
                  isActive
                    ? 'bg-white/10 scale-110 shadow-2xl z-30'
                    : 'bg-[#090C10]/85 hover:bg-white/10 hover:scale-105'
                }`}
                style={{
                  border: isActive
                    ? `1px solid ${model.color}`
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: isActive
                    ? `0 0 24px -2px ${model.glowColor}, 0 8px 18px rgba(0,0,0,0.8)`
                    : '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                {/* Clean White Squircle Tile holding User's Logo */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-md border border-white/30 overflow-hidden flex items-center justify-center p-0.5 shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <div
                    className="w-full h-full bg-no-repeat bg-contain"
                    style={{
                      backgroundImage: "url('/models-showcase.jpg')",
                      backgroundSize: '300% 300%',
                      backgroundPosition: model.bgPos,
                    }}
                  />
                </div>

                {/* Model Name on Desktop/Active */}
                <span
                  className={`text-[11px] font-bold font-display whitespace-nowrap transition-colors duration-200 hidden md:inline-block pr-1.5 ${
                    isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  {model.name}
                </span>

                {/* Active Indicator Pip */}
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse mr-1"
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

          {/* Core HUD Shield Display */}
          <div className="absolute inset-3 rounded-full bg-[#07090C]/85 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center border border-white/10 shadow-inner">
            {/* Active Model Logo Tile from User's Graphic */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-xl overflow-hidden flex items-center justify-center p-1 mb-1 transition-transform duration-300 scale-100 border-2"
              style={{
                borderColor: active.color,
              }}
            >
              <div
                className="w-full h-full bg-no-repeat bg-contain"
                style={{
                  backgroundImage: "url('/models-showcase.jpg')",
                  backgroundSize: '300% 300%',
                  backgroundPosition: active.bgPos,
                }}
              />
            </div>

            {/* Core Model Name */}
            <span className="text-[11px] sm:text-xs font-extrabold text-white font-display tracking-tight leading-tight block">
              {active.name}
            </span>

            {/* Real-time Telemetry Tag */}
            <div className="flex items-center gap-1 mt-0.5 text-[9px] sm:text-[10px] text-emerald-400 font-mono font-semibold">
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
