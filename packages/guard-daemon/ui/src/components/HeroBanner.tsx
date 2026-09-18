import React from 'react';
import { CheckCircle2, Settings, ArrowRight } from 'lucide-react';
import { RobotMascot } from './RobotMascot';

interface HeroBannerProps {
  onOpenSettings?: () => void;
  isRunning?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenSettings,
  isRunning = true,
}) => {
  const checklist = [
    'Real-time budget guard',
    'Automated failover routing',
    'Local SQLite WAL storage',
    'Zero external data leak',
  ];

  return (
    <div
      style={{
        backgroundColor: '#071510',
        background: 'linear-gradient(135deg, #050D0A 0%, #0C2117 50%, #040907 100%)',
      }}
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-2xl border border-[#1A382A]"
    >
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute -top-12 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-[#C59E5F]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: 3D Cute Robot Mascot */}
        <div className="shrink-0 flex items-center justify-center p-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xs">
          <RobotMascot size={135} />
        </div>

        {/* Center: Details & Checklist */}
        <div className="flex-1 space-y-3.5 text-center md:text-left">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C59E5F]">
                Sentinel Core v2.0
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#032014] text-emerald-300 border border-emerald-700/60 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isRunning ? 'Daemon is Active' : 'Daemon Paused'}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Autonomous AI Gateway Sentinel
            </h2>
            <p className="text-xs text-[#9EBAAC] max-w-xl leading-relaxed">
              Monitoring all local LLM calls on loopback 127.0.0.1:4040. Enforcing strict budget caps, 
              zero-latency model failovers, and tamper-resistant WAL persistence.
            </p>
          </div>

          {/* 4-Item Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {checklist.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-[#E2ECE6] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Action Button */}
        <div className="shrink-0 flex flex-col items-center md:items-end justify-center">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#071510] hover:bg-[#FAF8F5] text-xs font-bold transition-all shadow-md hover:scale-[1.02] cursor-pointer group"
          >
            <Settings className="w-3.5 h-3.5 text-[#071510]" />
            <span>Configure Guard</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#071510] group-hover:translate-x-0.5 transition-transform" />
          </button>
          <span className="text-[10px] font-mono text-emerald-300/70 mt-2">
            Port 4040 • 0% CPU Idle
          </span>
        </div>
      </div>
    </div>
  );
};
