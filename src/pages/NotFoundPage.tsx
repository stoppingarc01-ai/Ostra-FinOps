import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { OstraIcon } from '../components/OstraBrand';

interface NotFoundPageProps {
  onNavigateHome?: () => void;
  onNavigateDashboard?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigateHome = () => { window.location.hash = ''; window.location.pathname = '/'; },
  onNavigateDashboard = () => { window.location.hash = '#dashboard'; },
}) => {
  return (
    <div className="relative min-h-screen w-full bg-[#07090C] text-[#E8DCC4] flex flex-col justify-between font-sans selection:bg-[#D4AF7C]/30 selection:text-white overflow-hidden">
      
      {/* 1. Fullscreen Cinematic Background Artwork (No rectangular boxes, 100% full bleed) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <img
          src="/error-404-bg.jpg"
          alt="Developer at desk late night"
          className="w-full h-full object-cover object-[30%_center] md:object-center select-none scale-100 transition-transform duration-1000"
        />

        {/* Cinematic gradient over the right window area to make text and button crystal clear */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/20 via-black/40 to-black/85 md:to-black/75" />
        
        {/* Soft edge ambient vignettes */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Floating animated question marks above character's head on the desk */}
        <div className="absolute top-[28%] md:top-[32%] left-[34%] md:left-[38%] pointer-events-none select-none animate-bounce duration-1000 opacity-70">
          <span className="text-2xl md:text-3xl font-display font-bold text-amber-200/80 drop-shadow-[0_2px_12px_rgba(212,175,124,0.6)]">
            ?
          </span>
        </div>
        <div className="absolute top-[23%] md:top-[27%] left-[38%] md:left-[41%] pointer-events-none select-none animate-pulse opacity-90">
          <span className="text-3xl md:text-4xl font-display font-bold text-ostraGold-300 drop-shadow-[0_2px_16px_rgba(212,175,124,0.8)]">
            ?
          </span>
        </div>
        <div className="absolute top-[30%] md:top-[33%] left-[43%] md:left-[45%] pointer-events-none select-none animate-bounce delay-150 opacity-60">
          <span className="text-xl md:text-2xl font-display font-bold text-amber-200/60 drop-shadow-[0_2px_10px_rgba(212,175,124,0.5)]">
            ?
          </span>
        </div>
      </div>

      {/* 2. Top Header Bar */}
      <header className="relative z-20 px-6 sm:px-12 lg:px-16 py-6 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group backdrop-blur-md bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10 hover:border-ostraGold-500/40 transition-all duration-300" 
          onClick={onNavigateHome}
        >
          <OstraIcon className="w-7 h-7 transition-transform duration-300 group-hover:scale-105" variant="gold" />
          <span className="font-display font-semibold tracking-wider text-white text-sm sm:text-base flex items-center gap-1.5">
            OSTRA <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-ostraGold-300">Ops</span>
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

      {/* 3. Main Center Area: Right-aligned Coded UI floating over the night window, matching inspiration image */}
      <main className="relative z-20 flex-1 flex items-center justify-end px-6 sm:px-12 lg:px-24 py-8">
        <div className="w-full max-w-lg lg:max-w-xl flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* Crown Icon (Exact delicate 3-pointed crown) */}
          <div className="mb-2 sm:mb-3">
            <svg 
              className="w-10 h-10 sm:w-12 sm:h-12 text-ostraGold-400 drop-shadow-[0_2px_16px_rgba(212,175,124,0.6)] animate-pulse" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
              <circle cx="12" cy="4" r="1.3" fill="currentColor" />
              <circle cx="2" cy="4" r="1.3" fill="currentColor" />
              <circle cx="22" cy="4" r="1.3" fill="currentColor" />
            </svg>
          </div>

          {/* Big 404 Heading */}
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-display font-extrabold tracking-tight bg-gradient-to-b from-[#FFF5DE] via-[#E8CA9B] to-[#9F7A3E] bg-clip-text text-transparent drop-shadow-[0_6px_30px_rgba(212,175,124,0.4)] select-none">
            404
          </h1>

          {/* Page Not Found Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mt-1 mb-4 tracking-tight drop-shadow-md">
            Page Not Found
          </h2>

          {/* Description Subtitle */}
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-md font-sans drop-shadow">
            Looks like the page you're trying to reach isn't here. Maybe it moved, got lost, or just doesn't exist (for now).
          </p>

          {/* Action Button: Styled Gold Outline Pill Button matching inspiration */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-ostraGold-500/60 hover:border-ostraGold-300 bg-black/40 hover:bg-ostraGold-500/15 backdrop-blur-md text-ostraGold-300 hover:text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_0_25px_rgba(212,175,124,0.2)] hover:shadow-[0_0_35px_rgba(212,175,124,0.4)] hover:scale-105 active:scale-95 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Go Back Home</span>
            </button>

            <button
              onClick={onNavigateDashboard}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-white/10 hover:border-white/20 bg-black/30 hover:bg-black/50 backdrop-blur-md text-stone-300 hover:text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              <span>Dashboard</span>
            </button>
          </div>

          {/* Route path metadata */}
          <div className="mt-8 pt-4 border-t border-white/10 w-full flex items-center justify-between text-xs font-mono text-stone-400">
            <span>Route Unresolved</span>
            <span className="text-ostraGold-400/80">{window.location.hash || window.location.pathname || '#'}</span>
          </div>
        </div>
      </main>

      {/* 4. Bottom Footer */}
      <footer className="relative z-20 px-6 sm:px-12 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-stone-400 border-t border-white/5 bg-black/30 backdrop-blur-sm">
        <span>Ostra FinOps Deterministic Core • v2.0</span>
        <div className="flex items-center gap-4">
          <button onClick={onNavigateHome} className="hover:text-ostraGold-400 transition-colors">Home</button>
          <button onClick={onNavigateDashboard} className="hover:text-ostraGold-400 transition-colors">Console</button>
        </div>
      </footer>

    </div>
  );
};
