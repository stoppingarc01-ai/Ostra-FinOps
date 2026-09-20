import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  AlertTriangle, 
  Terminal, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Compass 
} from 'lucide-react';
import { OstraIcon } from '../components/OstraBrand';

interface BuildErrorPageProps {
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
  onNavigateHome?: () => void;
  onNavigateDashboard?: () => void;
  onRetry?: () => void;
}

export const BuildErrorPage: React.FC<BuildErrorPageProps> = ({
  error,
  errorInfo,
  onNavigateHome = () => { window.location.hash = ''; window.location.pathname = '/'; },
  onNavigateDashboard = () => { window.location.hash = '#dashboard'; },
  onRetry = () => { window.location.reload(); },
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const data = {
      type: 'BUILD_COMPILATION_EXCEPTION',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      message: error?.message || 'Build compilation or hydration failed',
      stack: error?.stack || 'No stack trace available',
      componentStack: errorInfo?.componentStack || 'No component stack',
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07090C] text-[#E8DCC4] flex flex-col justify-between font-sans selection:bg-rose-500/30 selection:text-white overflow-hidden">
      
      {/* 1. Fullscreen Background Artwork */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <img
          src="/error-build-bg.jpg"
          alt="Developer facing build failure at night"
          className="w-full h-full object-cover object-[30%_center] md:object-center select-none scale-100"
        />

        {/* Ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/30 via-black/50 to-black/90 md:to-black/80" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* 2. Top Header Bar */}
      <header className="relative z-20 px-6 sm:px-12 lg:px-16 py-6 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group backdrop-blur-md bg-black/40 px-3.5 py-1.5 rounded-full border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300" 
          onClick={onNavigateHome}
        >
          <OstraIcon className="w-7 h-7 transition-transform duration-300 group-hover:scale-105" variant="gold" />
          <span className="font-display font-semibold tracking-wider text-white text-sm sm:text-base flex items-center gap-1.5">
            OSTRA <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">Build Disruption</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateDashboard}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/20 text-stone-300 hover:text-white transition-all shadow-lg"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Console</span>
          </button>
        </div>
      </header>

      {/* 3. Main Center Area: Right-aligned Coded UI */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-end px-6 sm:px-12 lg:px-24 py-8">
        <div className="w-full max-w-lg lg:max-w-xl flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* Glowing Warning Badge */}
          <div className="mb-3 w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>

          {/* Heading */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-extrabold tracking-tight bg-gradient-to-b from-rose-200 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_6px_30px_rgba(244,63,94,0.4)] select-none">
            BUILD ERROR
          </h1>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mt-1 mb-4 tracking-tight drop-shadow-md">
            Pipeline Interrupted
          </h2>

          {/* Description */}
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-md font-sans drop-shadow">
            The execution engine encountered an unhandled syntax or module bundling exception. State was frozen to safeguard data consistency.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={onRetry}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-amber-500/60 hover:border-amber-400 bg-black/40 hover:bg-amber-500/15 backdrop-blur-md text-amber-300 hover:text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 group"
            >
              <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180" />
              <span>Retry Build</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-white/10 hover:border-white/20 bg-black/30 hover:bg-black/50 backdrop-blur-md text-stone-300 hover:text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return Home</span>
            </button>
          </div>

          {/* Diagnostics toggle */}
          <div className="mt-8 pt-4 border-t border-white/10 w-full">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="flex items-center justify-between w-full text-xs font-mono text-stone-400 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Inspect Diagnostic Trace</span>
              </span>
              {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Trace */}
          {showLogs && (
            <div className="w-full mt-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 p-4 text-left shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="text-[11px] font-mono text-rose-400">Stack Output</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-stone-300 hover:text-white"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-stone-300 text-[11px] font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                {error?.message || 'Error: Vite build / runtime hydration halted by caught exception.'}
                {'\n\n'}
                {error?.stack || 'at renderComponent (src/main.tsx:10:1)'}
              </pre>
            </div>
          )}

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
