import React from 'react';
import { OstraLogo, OstraIcon, OstraAppIcon } from './OstraBrand';

export const OstraOpsLogoAuth: React.FC<{ className?: string }> = ({
  className = 'w-9 h-9',
}) => (
  <OstraLogo
    iconClassName={className}
    textClassName="text-xl font-bold tracking-tight text-white font-sans"
    variant="gold"
    showTagline={false}
  />
);

export const GoogleAuthIcon: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <svg className={`${className} shrink-0`} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const GitHubAuthIcon: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <svg
    className={`${className} shrink-0 text-charcoal-900`}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

/**
 * High-fidelity 3D Robot & Rocks illustration with golden & emerald glowing ribbons
 * matching the Login left panel in media_1789452015448.jpg
 */
export const LoginRobotScene: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 400 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[300px] select-none"
      >
        <defs>
          {/* Radial Aura Behind Robot */}
          <radialGradient id="loginAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4AF77" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#10B981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#050907" stopOpacity="0" />
          </radialGradient>

          {/* Golden Wave Ribbon Gradients */}
          <linearGradient id="goldRibbon1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF77" stopOpacity="0" />
            <stop offset="30%" stopColor="#E5C287" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#D4AF77" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="goldRibbon2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
            <stop offset="50%" stopColor="#D4AF77" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>

          {/* Ceramic Robot Gradients */}
          <linearGradient id="robotBody" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F5F3ED" />
            <stop offset="100%" stopColor="#DDD8CD" />
          </linearGradient>

          <linearGradient id="robotVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#08140E" />
            <stop offset="100%" stopColor="#020805" />
          </linearGradient>

          <linearGradient id="sproutLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Rock Crag Gradients */}
          <linearGradient id="rockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2F2B" />
            <stop offset="40%" stopColor="#171C18" />
            <stop offset="100%" stopColor="#080C0A" />
          </linearGradient>

          <linearGradient id="rockGoldRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF77" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#E5C287" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#171C18" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient Back Glow */}
        <ellipse cx="200" cy="160" rx="160" ry="120" fill="url(#loginAura)" />

        {/* Glowing Sinuous Ribbons */}
        <path
          d="M 10 200 C 90 120, 160 250, 240 170 C 310 100, 350 210, 390 140"
          stroke="url(#goldRibbon1)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 20 220 C 100 140, 170 270, 250 190 C 320 120, 360 230, 400 160"
          stroke="url(#goldRibbon2)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="4 2"
        />
        <path
          d="M 0 170 C 80 230, 180 130, 280 220 C 340 270, 370 190, 400 210"
          stroke="url(#goldRibbon1)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Dark Craggy Rocks Platform */}
        <path
          d="M 60 280 L 120 215 L 180 235 L 230 205 L 290 230 L 350 285 L 390 320 L 20 320 Z"
          fill="url(#rockGrad)"
        />
        {/* Golden Rim Highlights on Rock Edges */}
        <path
          d="M 60 280 L 120 215 L 180 235 L 230 205 L 290 230 L 350 285"
          stroke="url(#rockGoldRim)"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M 120 215 L 150 250 L 200 240 L 230 205"
          stroke="#34D399"
          strokeWidth="0.8"
          strokeOpacity="0.4"
          fill="none"
        />

        {/* 3D Robot Mascot */}
        <g transform="translate(135, 80)">
          {/* Shadow on rock */}
          <ellipse cx="65" cy="138" rx="45" ry="12" fill="#030604" opacity="0.8" />

          {/* Sprout Leaf Antenna on Head */}
          <path
            d="M 64 22 C 60 8, 48 3, 42 2 C 54 2, 62 10, 65 18 C 68 8, 80 2, 88 3 C 82 8, 72 14, 66 22 Z"
            fill="url(#sproutLeaf)"
            className="drop-shadow-md"
          />
          <circle cx="65" cy="23" r="3" fill="#10B981" />

          {/* Robot Head Outer Shell */}
          <rect
            x="20"
            y="24"
            width="90"
            height="76"
            rx="38"
            fill="url(#robotBody)"
            stroke="#EAE4D8"
            strokeWidth="2"
            className="drop-shadow-lg"
          />

          {/* Robot Side Ears / Audio Nodes */}
          <circle cx="18" cy="62" r="6" fill="#DDD8CD" stroke="#C59E5F" strokeWidth="1.5" />
          <circle cx="112" cy="62" r="6" fill="#DDD8CD" stroke="#C59E5F" strokeWidth="1.5" />

          {/* Glossy Visor Face Screen */}
          <rect
            x="32"
            y="38"
            width="66"
            height="48"
            rx="24"
            fill="url(#robotVisor)"
            stroke="#10B981"
            strokeWidth="1.2"
          />

          {/* Glowing Mint-Green Pill Eyes */}
          <rect
            x="45"
            y="50"
            width="11"
            height="22"
            rx="5.5"
            fill="#34D399"
            className="animate-pulse"
          />
          <rect
            x="74"
            y="50"
            width="11"
            height="22"
            rx="5.5"
            fill="#34D399"
            className="animate-pulse"
          />
          {/* Eye light reflections */}
          <circle cx="48" cy="55" r="2" fill="#FFFFFF" />
          <circle cx="77" cy="55" r="2" fill="#FFFFFF" />

          {/* Lower Body Sitting on Rock */}
          <path
            d="M 40 98 C 40 98, 45 132, 65 132 C 85 132, 90 98, 90 98 Z"
            fill="url(#robotBody)"
            stroke="#DDD8CD"
            strokeWidth="1.8"
          />

          {/* Core Target Ring Emblem on Chest */}
          <circle cx="65" cy="114" r="7" fill="none" stroke="#10B981" strokeWidth="1.8" />
          <circle cx="65" cy="114" r="3" fill="#D4AF77" />

          {/* Left & Right Resting Arms */}
          <ellipse cx="30" cy="108" rx="7" ry="11" fill="url(#robotBody)" stroke="#DDD8CD" strokeWidth="1.2" />
          <ellipse cx="100" cy="108" rx="7" ry="11" fill="url(#robotBody)" stroke="#DDD8CD" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
};

/**
 * High-fidelity Tablet Dashboard Mockup with metrics and 3 feature highlights
 * matching the Signup left panel in media_1789452015448.jpg
 */
export const SignupTabletScene: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full flex flex-col items-center justify-center ${className}`}>
      {/* Tablet Device Frame */}
      <div className="w-full max-w-[340px] rounded-2xl bg-[#09110D] border-2 border-[#1E2E25] p-3 shadow-2xl space-y-2.5 relative overflow-hidden backdrop-blur-sm">
        {/* Device camera dot */}
        <div className="flex items-center justify-between px-1 text-[9px] text-[#526359] font-mono pb-1 border-b border-[#1A2920]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#10B981]" />
            </div>
            <span className="font-bold text-white tracking-tight">OstraOps</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#2A3F33]" />
        </div>

        {/* Dashboard Content Inside Tablet */}
        <div className="grid grid-cols-12 gap-2">
          {/* Mini Sidebar */}
          <div className="col-span-3 space-y-1.5 py-1 text-[8px] text-[#718478] font-mono">
            <div className="px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-bold">
              Dashboard
            </div>
            <div className="px-1.5 py-0.5 text-[#5A6D61]">Usage</div>
            <div className="px-1.5 py-0.5 text-[#5A6D61]">Models</div>
            <div className="px-1.5 py-0.5 text-[#5A6D61]">Keys</div>
            <div className="px-1.5 py-0.5 text-[#5A6D61]">Projects</div>
            <div className="px-1.5 py-0.5 text-[#5A6D61]">Settings</div>
          </div>

          {/* Mini Main Dashboard */}
          <div className="col-span-9 bg-[#050C08] rounded-xl p-2.5 border border-[#16251C] space-y-2">
            <div>
              <span className="text-[8px] text-[#718478] font-mono block">Total Spend</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-white">$12.48</span>
                <span className="text-[9px] font-bold text-emerald-400">↓ 42%</span>
              </div>
            </div>

            {/* Mini Sparkline Chart */}
            <div className="h-10 w-full relative">
              <svg viewBox="0 0 160 40" fill="none" className="w-full h-full">
                <path
                  d="M0 32 Q 25 15, 50 25 T 100 8 T 160 20"
                  stroke="#10B981"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M0 32 Q 25 15, 50 25 T 100 8 T 160 20 L 160 40 L 0 40 Z"
                  fill="url(#dashGrad)"
                  opacity="0.25"
                />
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10B981" />
                    <stop offset="1" stopColor="#050C08" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Provider mini pills */}
            <div className="flex items-center gap-1 pt-0.5">
              <span className="text-[7.5px] px-1.5 py-0.5 rounded bg-[#0A1610] text-[#869E90] border border-[#1A2C21]">
                OpenAI
              </span>
              <span className="text-[7.5px] px-1.5 py-0.5 rounded bg-[#0A1610] text-[#869E90] border border-[#1A2C21]">
                Anthropic
              </span>
              <span className="text-[7.5px] px-1.5 py-0.5 rounded bg-[#0A1610] text-[#869E90] border border-[#1A2C21]">
                Gemini
              </span>
            </div>
          </div>
        </div>

        {/* Ambient tablet glow */}
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 3 Feature Highlights Under the Tablet */}
      <div className="grid grid-cols-3 gap-2 w-full pt-4 select-none">
        {/* Feature 1 */}
        <div className="space-y-1 text-center">
          <div className="w-7 h-7 mx-auto rounded-full bg-[#0C1A13] border border-[#1B3526] flex items-center justify-center text-[#10B981]">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="text-[11px] font-bold text-white">Set Budgets</div>
          <p className="text-[9.5px] text-[#8C887B] leading-tight">Control your spend with smart limits.</p>
        </div>

        {/* Feature 2 */}
        <div className="space-y-1 text-center">
          <div className="w-7 h-7 mx-auto rounded-full bg-[#0C1A13] border border-[#1B3526] flex items-center justify-center text-[#10B981]">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div className="text-[11px] font-bold text-white">Track Usage</div>
          <p className="text-[9.5px] text-[#8C887B] leading-tight">See exactly where your tokens go.</p>
        </div>

        {/* Feature 3 */}
        <div className="space-y-1 text-center">
          <div className="w-7 h-7 mx-auto rounded-full bg-[#0C1A13] border border-[#1B3526] flex items-center justify-center text-[#10B981]">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="text-[11px] font-bold text-white">Optimize</div>
          <p className="text-[9.5px] text-[#8C887B] leading-tight">Get AI-powered recommendations.</p>
        </div>
      </div>

      {/* Ambient bottom wave lines */}
      <div className="w-full pt-2 opacity-30 pointer-events-none">
        <svg viewBox="0 0 340 30" fill="none" className="w-full">
          <path d="M0 25 C 90 5, 210 35, 340 15" stroke="#D4AF77" strokeWidth="1.2" />
          <path d="M10 28 C 100 8, 220 38, 350 18" stroke="#10B981" strokeWidth="1" strokeDasharray="3 2" />
        </svg>
      </div>
    </div>
  );
};

/**
 * Modern golden Ostra emblem + wordmark matching the new uploaded mock
 */
export const OstraLogoAuth: React.FC<{
  className?: string;
  textClassName?: string;
  showTagline?: boolean;
  variant?: 'gold' | 'charcoal' | 'white' | 'sandstone';
}> = ({
  className = 'w-8 h-8',
  textClassName = 'text-2xl font-bold tracking-tight text-white font-sans',
  showTagline = true,
  variant = 'gold',
}) => (
  <OstraLogo
    iconClassName={className}
    textClassName={textClassName}
    variant={variant}
    showTagline={showTagline}
    taglineType="control"
  />
);

export { OstraLogo, OstraIcon, OstraAppIcon };


/**
 * Cinematic dark desert & eclipse artwork with vertical light needle
 * matching media_1789696356929.jpg
 */
export const OstraEclipseArtwork: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      {/* 3D Photorealistic Octane Render */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-[#040608]">
        <img
          src="/ostra_eclipse_hero.jpg"
          alt="Ostra 3D Eclipse Architecture"
          className="w-full h-[280px] sm:h-[320px] object-cover object-center transform hover:scale-[1.02] transition-transform duration-700 ease-out"
          loading="eager"
        />

        {/* Soft edge blending gradients */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#070A0D] via-transparent to-[#070A0D]/60 opacity-80" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#070A0D]/70 via-transparent to-[#070A0D]/70 opacity-70" />

        {/* Subtle luminous vertical flare pulse */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#FFE8B5] to-transparent opacity-75 blur-[1px] pointer-events-none" />

        {/* Core eclipse halo glow */}
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#E5C287]/15 blur-2xl pointer-events-none" />
      </div>
    </div>
  );
};

export const MicrosoftAuthIcon: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <svg className={`${className} shrink-0`} viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

/**
 * 3D Animated Pedestal with floating dashboard card for Signup Page
 * matches screenshot 1 with interactive animated motion
 */
export const SignupMovingPedestal: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-[340px] sm:max-w-[400px] aspect-[4/3] flex items-center justify-center select-none ${className}`}>
      {/* Background radial gold aura */}
      <div className="absolute inset-0 bg-radial from-[#D4AF77]/20 via-[#C59E5F]/5 to-transparent blur-3xl pointer-events-none" />

      {/* Orbit Rings (UI moving) */}
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 w-full h-full pointer-events-none"
        fill="none"
      >
        <ellipse
          cx="200"
          cy="185"
          rx="155"
          ry="65"
          stroke="url(#signupOrbitGlow)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          className="opacity-50 animate-[spin_40s_linear_infinite]"
          style={{ transformOrigin: '200px 185px' }}
        />
        <ellipse
          cx="200"
          cy="185"
          rx="125"
          ry="50"
          stroke="#C59E5F"
          strokeWidth="0.8"
          strokeDasharray="2 4"
          className="opacity-30 animate-[spin_25s_linear_infinite_reverse]"
          style={{ transformOrigin: '200px 185px' }}
        />
        <defs>
          <linearGradient id="signupOrbitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5C287" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#C59E5F" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#9E743A" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Glowing Particle on Orbit */}
      <div className="absolute top-[35%] right-[2%] w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#FFE8B5] to-[#C59E5F] shadow-[0_0_16px_#E5C287] animate-pulse" />
      <div className="absolute bottom-[22%] left-[4%] w-2 h-2 rounded-full bg-[#E5C287] shadow-[0_0_12px_#E5C287] animate-ping" />

      {/* Golden Tiered Pedestal */}
      <div className="absolute bottom-4 w-52 sm:w-60 h-16 flex flex-col items-center justify-end">
        {/* Top Rim of Pedestal */}
        <div className="w-48 sm:w-56 h-10 rounded-[100%] bg-gradient-to-b from-[#2A2318] via-[#14120D] to-[#0A0907] border-2 border-[#D4AF77]/60 shadow-[0_0_25px_rgba(212,175,119,0.35)] relative">
          <div className="absolute inset-1 rounded-[100%] border border-[#E5C287]/40 bg-radial from-[#453620] via-[#1F1911] to-[#0C0B08]" />
        </div>
        {/* Base Rim */}
        <div className="w-52 sm:w-60 h-10 -mt-5 rounded-[100%] bg-gradient-to-b from-[#3E311F] via-[#1A150E] to-[#090806] border-2 border-[#9E743A]/80 shadow-2xl" />
      </div>

      {/* Floating 3D Dashboard Card (Tilted Perspective with Float Animation) */}
      <div className="relative -top-4 w-56 sm:w-64 rounded-2xl bg-[#090C10]/95 backdrop-blur-xl border border-white/[0.12] p-3.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.9),0_0_25px_rgba(197,158,95,0.2)] animate-float-1 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
        {/* Dashboard Card Top Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-300 font-semibold tracking-wide">Live Gateway</span>
          </div>
          <span className="text-[9px] font-mono text-[#E5C38D] bg-[#E5C38D]/10 px-1.5 py-0.5 rounded border border-[#E5C38D]/20">99.99%</span>
        </div>

        {/* Dashboard Visuals: Spline Curve + Donut */}
        <div className="grid grid-cols-12 gap-2 items-center">
          {/* Left: Trend Sparkline */}
          <div className="col-span-8 space-y-1">
            <div className="text-[9px] text-zinc-400 font-mono">Token Burn</div>
            <svg viewBox="0 0 120 40" className="w-full h-9 overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C59E5F" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#C59E5F" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 Q 25 15, 50 25 T 100 8 T 120 12 L 120 40 L 0 40 Z"
                fill="url(#chartGrad)"
              />
              <path
                d="M 0 35 Q 25 15, 50 25 T 100 8 T 120 12"
                fill="none"
                stroke="#E5C38D"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="100" cy="8" r="2.5" fill="#FFE8B5" className="animate-ping" />
              <circle cx="100" cy="8" r="2.5" fill="#FFE8B5" />
            </svg>
          </div>

          {/* Right: Circular Donut Gauge */}
          <div className="col-span-4 flex flex-col items-center justify-center">
            <div className="relative w-9 h-9">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1A202C"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5C38D"
                  strokeWidth="3.5"
                  strokeDasharray="74, 100"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white">74%</span>
            </div>
            <span className="text-[8px] text-zinc-400 font-mono mt-0.5">Quota</span>
          </div>
        </div>

        {/* Bottom Mini Metrics Bar */}
        <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono text-zinc-400">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>2.4M tok</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>140ms</span>
          </div>
          <div className="flex items-center gap-1 text-[#E5C38D]">
            <span>$0.0028</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3D Animated Pedestal with Golden Security Shield & Orbiting Badges for Login Page
 * matches screenshot 2 with dynamic floating elements
 */
export const LoginMovingShieldPedestal: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-[340px] sm:max-w-[400px] aspect-[4/3] flex items-center justify-center select-none ${className}`}>
      {/* Background radial gold aura */}
      <div className="absolute inset-0 bg-radial from-[#D4AF77]/25 via-[#C59E5F]/5 to-transparent blur-3xl pointer-events-none" />

      {/* Orbit Rings (UI moving) */}
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 w-full h-full pointer-events-none"
        fill="none"
      >
        <ellipse
          cx="200"
          cy="190"
          rx="150"
          ry="60"
          stroke="url(#loginOrbitGlow)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          className="opacity-50 animate-[spin_35s_linear_infinite]"
          style={{ transformOrigin: '200px 190px' }}
        />
        <ellipse
          cx="200"
          cy="190"
          rx="115"
          ry="45"
          stroke="#C59E5F"
          strokeWidth="0.8"
          strokeDasharray="2 4"
          className="opacity-30 animate-[spin_20s_linear_infinite_reverse]"
          style={{ transformOrigin: '200px 190px' }}
        />
        <defs>
          <linearGradient id="loginOrbitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE8B5" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#C59E5F" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#9E743A" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Orbiting Badges */}
      {/* 1. Top-Left: Glowing Lock Badge */}
      <div className="absolute top-[8%] left-[10%] sm:left-[14%] p-2.5 rounded-2xl bg-[#0E1217]/90 backdrop-blur-md border border-[#E5C287]/30 shadow-[0_8px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(229,194,135,0.2)] animate-float-1">
        <svg className="w-5 h-5 text-[#E5C38D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      {/* 2. Top-Right: Analytics Line Graph Badge */}
      <div className="absolute top-[10%] right-[10%] sm:right-[14%] p-2.5 rounded-2xl bg-[#0E1217]/90 backdrop-blur-md border border-[#E5C287]/30 shadow-[0_8px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(229,194,135,0.2)] animate-float-2">
        <svg className="w-5 h-5 text-[#E5C38D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      </div>

      {/* 3. Bottom-Right: Gold Dollar / Coin Badge */}
      <div className="absolute bottom-[20%] right-[6%] sm:right-[10%] w-9 h-9 rounded-full bg-gradient-to-br from-[#FFE8B5] via-[#E5C287] to-[#9E743A] p-[1.5px] shadow-[0_8px_20px_rgba(0,0,0,0.6),0_0_20px_rgba(229,194,135,0.4)] animate-float-3">
        <div className="w-full h-full rounded-full bg-[#18140E] flex items-center justify-center text-[#E5C38D] font-mono font-bold text-xs">
          $
        </div>
      </div>

      {/* Golden Tiered Pedestal */}
      <div className="absolute bottom-4 w-52 sm:w-60 h-16 flex flex-col items-center justify-end">
        {/* Top Rim */}
        <div className="w-48 sm:w-56 h-10 rounded-[100%] bg-gradient-to-b from-[#2A2318] via-[#14120D] to-[#0A0907] border-2 border-[#D4AF77]/60 shadow-[0_0_25px_rgba(212,175,119,0.35)] relative">
          <div className="absolute inset-1 rounded-[100%] border border-[#E5C287]/40 bg-radial from-[#453620] via-[#1F1911] to-[#0C0B08]" />
        </div>
        {/* Base Rim */}
        <div className="w-52 sm:w-60 h-10 -mt-5 rounded-[100%] bg-gradient-to-b from-[#3E311F] via-[#1A150E] to-[#090806] border-2 border-[#9E743A]/80 shadow-2xl" />
      </div>

      {/* 3D Metallic Golden Shield (Floating Above Pedestal) */}
      <div className="relative -top-5 flex flex-col items-center justify-center animate-float-1">
        <svg
          viewBox="0 0 100 120"
          className="w-24 sm:w-28 h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] drop-shadow-[0_0_25px_rgba(212,175,119,0.5)]"
        >
          <defs>
            <linearGradient id="shieldGoldOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2D6" />
              <stop offset="35%" stopColor="#E5C287" />
              <stop offset="70%" stopColor="#9E743A" />
              <stop offset="100%" stopColor="#5E431E" />
            </linearGradient>
            <linearGradient id="shieldGoldInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3A2C18" />
              <stop offset="50%" stopColor="#1C150B" />
              <stop offset="100%" stopColor="#0B0905" />
            </linearGradient>
            <linearGradient id="shieldCore" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFE8B5" />
              <stop offset="100%" stopColor="#AA824B" />
            </linearGradient>
          </defs>

          {/* Outer Gold Bevel Rim */}
          <path
            d="M 50 5 L 88 22 C 88 70, 50 110, 50 110 C 50 110, 12 70, 12 22 Z"
            fill="url(#shieldGoldOuter)"
            stroke="#FFE8B5"
            strokeWidth="1"
          />

          {/* Inner Dark Metallic Inset */}
          <path
            d="M 50 14 L 80 28 C 80 66, 50 100, 50 100 C 50 100, 20 66, 20 28 Z"
            fill="url(#shieldGoldInner)"
            stroke="#9E743A"
            strokeWidth="1.5"
          />

          {/* Center Glowing Gold Core Shield */}
          <path
            d="M 50 24 L 70 34 C 70 60, 50 86, 50 86 C 50 86, 30 60, 30 34 Z"
            fill="url(#shieldCore)"
            opacity="0.9"
          />
        </svg>
      </div>
    </div>
  );
};


