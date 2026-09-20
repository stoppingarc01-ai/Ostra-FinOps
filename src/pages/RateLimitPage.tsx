import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  Gauge, 
  Zap, 
  Clock, 
  Compass
} from 'lucide-react';
import { OstraIcon } from '../components/OstraBrand';

interface RateLimitPageProps {
  onNavigateHome?: () => void;
  onNavigateDashboard?: () => void;
  onNavigatePricing?: () => void;
  onRetry?: () => void;
  cooldownSeconds?: number;
}

export const RateLimitPage: React.FC<RateLimitPageProps> = ({
  onNavigateHome = () => { window.location.hash = ''; window.location.pathname = '/'; },
  onNavigateDashboard = () => { window.location.hash = '#dashboard'; },
  onNavigatePricing = () => { window.location.hash = '#pricing'; },
  onRetry = () => { window.location.reload(); },
  cooldownSeconds = 30,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(cooldownSeconds);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const handleManualRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      onRetry();
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07090C] text-[#E8DCC4] flex flex-col justify-between font-sans selection:bg-amber-500/30 selection:text-white overflow-hidden">
      
      {/* 1. Fullscreen Cinematic Background Artwork */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <img
          src="/error-404-bg.jpg"
          alt="Developer waiting for cooldown late night"
          className="w-full h-full object-cover object-[30%_center] md:object-center select-none scale-100"
        />

        {/* Ambient Amber / Cyan Cooldown Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/25 via-black/45 to-black/85 md:to-black/80" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Subtle Cooldown Glow over desk coffee cup */}
        <div className="absolute bottom-[28%] left-[26%] md:left-[22%] pointer-events-none select-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-[10px] font-mono text-amber-300">
          <Clock className="w-3 h-3 animate-spin text-amber-400" />
          <span>Still Loading...</span>
        </div>
      </div>

      {/* 2. Top Header Bar */}
      <header className="relative z-20 px-6 sm:px-12 lg:px-16 py-6 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group backdrop-blur-md bg-black/40 px-3.5 py-1.5 rounded-full border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300" 
          onClick={onNavigateHome}
        >
          <OstraIcon className="w-7 h-7 transition-transform duration-300 group-hover:scale-105" variant="gold" />
          <span className="font-display font-semibold tracking-wider text-white text-sm sm:text-base flex items-center gap-1.5">
            OSTRA <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Rate Governor</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateDashboard}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/20 text-stone-300 hover:text-white transition-all shadow-lg"
          >
            <Compass className="w-3.5 h-3.5 text-ostraGold-400" />
            <span>Console</span>
          </button>
        </div>
      </header>

      {/* 3. Main Center Area: Right-aligned Coded UI */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-end px-6 sm:px-12 lg:px-24 py-8">
        <div className="w-full max-w-lg lg:max-w-xl flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* Speedometer Rate Badge */}
          <div className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <Gauge className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>HTTP 429 • SPEND VELOCITY THROTTLED</span>
          </div>

          {/* Big 429 Heading */}
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-display font-extrabold tracking-tight bg-gradient-to-b from-[#FFF0D4] via-[#F59E0B] to-[#B45309] bg-clip-text text-transparent drop-shadow-[0_6px_30px_rgba(245,158,11,0.4)] select-none">
            429
          </h1>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mt-1 mb-3 tracking-tight drop-shadow-md">
            Rate Limit Exceeded
          </h2>

          {/* Description */}
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6 max-w-md font-sans drop-shadow">
            Whoa, easy there! You've exceeded your token throughput or request burst limit. The governor has engaged a brief cooldown to protect your quota.
          </p>

          {/* Live Cooldown Meter Card */}
          <div className="w-full mb-8 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-stone-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Cooldown Counter:</span>
              </span>
              <span className="font-bold text-amber-300 text-sm">
                {secondsRemaining > 0 ? `${secondsRemaining}s remaining` : 'Ready to resume'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-1000"
                style={{ width: `${Math.max(0, Math.min(100, ((cooldownSeconds - secondsRemaining) / cooldownSeconds) * 100))}%` }}
              />
            </div>

            {/* FinOps Quota Details */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px] font-mono">
              <div>
                <span className="text-stone-500 block">Burst Status</span>
                <span className="text-rose-400 font-medium">Cap Reached (100%)</span>
              </div>
              <div>
                <span className="text-stone-500 block">Governor Rule</span>
                <span className="text-ostraGold-300 font-medium">Auto-Reset Window</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-amber-500/60 hover:border-amber-300 bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-md text-amber-200 hover:text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 group disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
              <span>{secondsRemaining > 0 ? `Retry in ${secondsRemaining}s` : 'Retry Now'}</span>
            </button>

            <button
              onClick={onNavigatePricing}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-ostraGold-500/30 hover:border-ostraGold-500/60 bg-black/40 hover:bg-ostraGold-500/10 backdrop-blur-md text-ostraGold-300 hover:text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Zap className="w-4 h-4 text-ostraGold-400" />
              <span>Upgrade Quota</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-5 py-3.5 rounded-full border border-white/10 hover:border-white/20 bg-black/30 hover:bg-black/50 backdrop-blur-md text-stone-300 hover:text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>

          {/* Bottom telemetry trace link */}
          <div className="mt-8 pt-4 border-t border-white/10 w-full flex items-center justify-between text-xs font-mono text-stone-400">
            <span>Mesh Zone: <strong className="text-stone-300 font-normal">primary-egress</strong></span>
            <span className="text-amber-400/90">X-RateLimit-Reset: {secondsRemaining}s</span>
          </div>

        </div>
      </main>

      {/* 4. Bottom Footer */}
      <footer className="relative z-20 px-6 sm:px-12 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-stone-400 border-t border-white/5 bg-black/30 backdrop-blur-sm">
        <span>Ostra FinOps Deterministic Core • v2.0</span>
        <div className="flex items-center gap-4">
          <button onClick={onNavigateHome} className="hover:text-ostraGold-400 transition-colors">Home</button>
          <button onClick={onNavigatePricing} className="hover:text-ostraGold-400 transition-colors">Pricing & Limits</button>
          <button onClick={onNavigateDashboard} className="hover:text-ostraGold-400 transition-colors">Console</button>
        </div>
      </footer>

    </div>
  );
};
