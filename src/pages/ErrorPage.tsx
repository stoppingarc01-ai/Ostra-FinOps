import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Home, 
  RefreshCw, 
  AlertTriangle, 
  Terminal, 
  Copy, 
  Check, 
  ShieldAlert, 
  Compass, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers
} from 'lucide-react';
import { OstraIcon } from '../components/OstraBrand';

export type ErrorType = 404 | 500 | 403 | 'build';

export interface ErrorPageProps {
  code?: ErrorType | number | string;
  title?: string;
  message?: string;
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
  onNavigateHome?: () => void;
  onNavigateDashboard?: () => void;
  onRetry?: () => void;
  showDevSwitcher?: boolean;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  code: initialCode = 404,
  title: customTitle,
  message: customMessage,
  error,
  errorInfo,
  onNavigateHome = () => { window.location.hash = ''; window.location.pathname = '/'; },
  onNavigateDashboard = () => { window.location.hash = '#dashboard'; },
  onRetry = () => { window.location.reload(); },
  showDevSwitcher = true,
}) => {
  const [activeCode, setActiveCode] = useState<ErrorType>(() => {
    if (typeof initialCode === 'number' && [404, 500, 403].includes(initialCode)) {
      return initialCode as ErrorType;
    }
    if (initialCode === 'build' || initialCode === 'BUILD_ERROR') return 'build';
    return 404;
  });

  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Configuration for each error flavor
  const errorConfigs: Record<ErrorType, {
    statusBadge: string;
    headline: string;
    subtext: string;
    accentColor: string;
    glowColor: string;
  }> = {
    404: {
      statusBadge: 'HTTP 404 • ROUTE UNRESOLVED',
      headline: 'Page Not Found',
      subtext: "Looks like the page you're trying to reach isn't here. Maybe it moved, got lost, or just doesn't exist (for now).",
      accentColor: '#D4AF7C',
      glowColor: 'rgba(212, 175, 124, 0.15)',
    },
    500: {
      statusBadge: 'HTTP 500 • INTERNAL SYSTEM DISRUPTION',
      headline: 'Execution Engine Fault',
      subtext: "An unexpected runtime anomaly halted the execution pipeline. Deterministic telemetry guards prevented state corruption.",
      accentColor: '#F87171',
      glowColor: 'rgba(248, 113, 113, 0.15)',
    },
    build: {
      statusBadge: 'BUILD PIPELINE • COMPILATION EXCEPTION',
      headline: 'Build Process Interrupted',
      subtext: "A compilation or asset bundle dependency failed validation during artifact hydration. Review the diagnostic trace below.",
      accentColor: '#FB923C',
      glowColor: 'rgba(251, 146, 60, 0.15)',
    },
    403: {
      statusBadge: 'HTTP 403 • CREDENTIAL ENCLAVE RESTRICTED',
      headline: 'Access Restricted',
      subtext: "This enclave or gateway cluster requires elevated operational credentials. Verify your token permissions or account tier.",
      accentColor: '#A78BFA',
      glowColor: 'rgba(167, 139, 250, 0.15)',
    },
  };

  const currentConfig = errorConfigs[activeCode] || errorConfigs[404];
  const displayTitle = customTitle || currentConfig.headline;
  const displayMessage = customMessage || currentConfig.subtext;

  const handleCopyDiagnostics = () => {
    const diagnosticPayload = {
      code: activeCode,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorMessage: error?.message || 'N/A',
      errorStack: error?.stack || 'N/A',
      componentStack: errorInfo?.componentStack || 'N/A',
    };

    navigator.clipboard.writeText(JSON.stringify(diagnosticPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-[#E8DCC4] flex flex-col font-sans selection:bg-[#D4AF7C]/25 selection:text-white relative overflow-hidden">
      {/* Ambient background lighting matching the artwork aesthetic */}
      <div 
        className="absolute top-0 left-1/4 w-[600px] h-[500px] rounded-full blur-[140px] pointer-events-none -translate-y-1/2 opacity-30"
        style={{ background: 'radial-gradient(circle, #D4AF7C 0%, #AA824B 35%, transparent 70%)' }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none translate-y-1/3 opacity-20"
        style={{ background: 'radial-gradient(circle, #1E3A8A 0%, #0F172A 50%, transparent 75%)' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-white/5 bg-[#07090C]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onNavigateHome}>
          <OstraIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-105" variant="gold" />
          <div className="flex flex-col">
            <span className="font-display font-semibold tracking-wider text-white text-base flex items-center gap-2">
              OSTRA <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-ostraGold-300 tracking-normal">Ops</span>
            </span>
            <span className="text-[11px] font-mono text-charcoal-400">Intelligent FinOps Mesh</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">

          <button
            onClick={onNavigateDashboard}
            className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-ostraGold-400" />
            <span>Console</span>
          </button>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* If 404: Render the artwork in full glory with interactive hot-zones and precision fallback */}
        <div className="w-full flex flex-col items-center">
          {/* Main Cinematic Visual Card */}
          <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] bg-[#0B0F13] group">
            
            {/* Crown ambient badge watermark */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-ostraGold-300">
              <svg className="w-3.5 h-3.5 text-ostraGold-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
              </svg>
              <span>{currentConfig.statusBadge}</span>
            </div>

            {/* High-Resolution Artwork */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#0A0D10]">
              <img
                src="/ostra-404.jpg"
                alt="Ostra Developer Working at Desk Late Night"
                className="w-full h-full object-cover object-center select-none transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              />

              {/* Dynamic Non-404 Overlay (If switched to 500, Build Error, or 403, it overlays a dark atmospheric panel over the right side) */}
              {activeCode !== 404 && (
                <div className="absolute inset-0 bg-[#07090C]/85 backdrop-blur-sm flex flex-col justify-center items-center text-center p-6 md:p-12 animate-fadeIn">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border"
                    style={{ 
                      backgroundColor: currentConfig.glowColor,
                      borderColor: `${currentConfig.accentColor}40`
                    }}
                  >
                    {activeCode === 500 && <AlertTriangle className="w-8 h-8 text-rose-400" />}
                    {activeCode === 'build' && <Cpu className="w-8 h-8 text-amber-400" />}
                    {activeCode === 403 && <ShieldAlert className="w-8 h-8 text-purple-400" />}
                  </div>

                  <span className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight mb-2" style={{ color: currentConfig.accentColor }}>
                    {activeCode === 'build' ? 'BUILD ERROR' : activeCode}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
                    {displayTitle}
                  </h1>
                  <p className="text-stone-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-8">
                    {displayMessage}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={onRetry}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-charcoal-950 font-semibold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Retry Pipeline</span>
                    </button>
                    <button
                      onClick={onNavigateHome}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-sm flex items-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <Home className="w-4 h-4 text-ostraGold-400" />
                      <span>Return Home</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Seamless Interactive Hotspot on the original artwork's "Go Back Home" button (Active on 404) */}
              {activeCode === 404 && (
                <div 
                  className="absolute bottom-[32%] sm:bottom-[34%] right-[11%] sm:right-[12%] w-[28%] sm:w-[22%] h-[8%] sm:h-[8%] z-30 cursor-pointer rounded-full border border-transparent hover:border-ostraGold-400/50 hover:bg-ostraGold-400/10 transition-all duration-300 flex items-center justify-center group/btn"
                  onClick={onNavigateHome}
                  title="Click to go back home"
                >
                  <span className="sr-only">Go Back Home</span>
                  <span className="hidden group-hover/btn:inline-block text-[10px] font-mono text-ostraGold-300 bg-black/80 px-2 py-0.5 rounded-full border border-ostraGold-500/30">
                    ← Return Home
                  </span>
                </div>
              )}

              {/* Bottom Subtle Vignette Gradient */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07090C] via-[#07090C]/40 to-transparent pointer-events-none" />
            </div>

            {/* Bottom Interactive Command Dock */}
            <div className="bg-[#0B0F13] px-6 py-5 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-ostraGold-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Lost in the mesh? Telemetry is active.</p>
                  <p className="text-xs text-stone-400">Route: <span className="font-mono text-ostraGold-300">{window.location.hash || window.location.pathname}</span></p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-center">
                <button
                  onClick={onNavigateHome}
                  className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-ostraGold-500 to-ostraGold-600 hover:from-ostraGold-600 hover:to-ostraGold-700 text-charcoal-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-ostraGold-500/20 transition-all hover:scale-[1.02]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back Home</span>
                </button>

                <button
                  onClick={onNavigateDashboard}
                  className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Home className="w-4 h-4 text-ostraGold-400" />
                  <span>Dashboard Console</span>
                </button>

                <button
                  onClick={onRetry}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                  title="Reload Page"
                >
                  <RefreshCw className="w-4 h-4 text-stone-400" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {(error || errorInfo) && (
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span>Logs</span>
                    {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostic Trace Section (Visible if an error occurred or toggled) */}
          {(showDetails || error) && (
            <div className="w-full max-w-5xl mt-6 rounded-2xl bg-[#0B0F13] border border-white/10 p-5 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-medium text-white uppercase tracking-wider">
                    Build & Runtime Stack Diagnostics
                  </span>
                </div>
                <button
                  onClick={handleCopyDiagnostics}
                  className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                      <span>Copy Log</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#06080A] rounded-xl p-4 font-mono text-xs text-stone-300 overflow-x-auto border border-white/5 max-h-64 space-y-2">
                {error?.message && (
                  <p className="text-rose-400 font-semibold">
                    Error: {error.message}
                  </p>
                )}
                {error?.stack && (
                  <pre className="text-stone-400 whitespace-pre-wrap leading-relaxed text-[11px]">
                    {error.stack}
                  </pre>
                )}
                {errorInfo?.componentStack && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-amber-400 font-semibold mb-1">Component Hierarchy:</p>
                    <pre className="text-stone-500 whitespace-pre-wrap text-[11px]">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
                {!error && (
                  <p className="text-stone-500 italic">
                    No active runtime exception registered. Current route failed router match.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Interactive Mode / Error Selector for testing & preview */}
          {showDevSwitcher && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <span className="text-[11px] font-mono text-stone-400 px-3">Simulate Error:</span>
              <button
                onClick={() => setActiveCode(404)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  activeCode === 404
                    ? 'bg-ostraGold-500/20 border border-ostraGold-400/40 text-ostraGold-300 font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                404 Not Found
              </button>
              <button
                onClick={() => setActiveCode(500)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  activeCode === 500
                    ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300 font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                500 Server Error
              </button>
              <button
                onClick={() => setActiveCode('build')}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  activeCode === 'build'
                    ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300 font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Build Error
              </button>
              <button
                onClick={() => setActiveCode(403)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  activeCode === 403
                    ? 'bg-purple-500/20 border border-purple-400/40 text-purple-300 font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                403 Forbidden
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-4 px-6 text-center text-xs font-mono text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>Ostra FinOps Deterministic Core</span>
          <span>•</span>
          <span>Build v2.0-stable</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onNavigateHome} className="hover:text-ostraGold-400 transition-colors">Home</button>
          <button onClick={onNavigateDashboard} className="hover:text-ostraGold-400 transition-colors">Console</button>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-ostraGold-400 transition-colors flex items-center gap-1">
            <span>Status</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
};
