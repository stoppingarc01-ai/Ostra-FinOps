import React from 'react';

export const OsterdOpsLogoAuth: React.FC<{ className?: string }> = ({
  className = 'w-9 h-9',
}) => (
  <div className="flex items-center gap-2.5">
    <div className={`relative ${className} flex items-center justify-center shrink-0`}>
      <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
        {/* Outer Ring */}
        <ellipse
          cx="18"
          cy="18"
          rx="14"
          ry="14"
          stroke="#EAE4D8"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeDasharray="60 30"
        />
        {/* Inner Arc */}
        <path
          d="M12 7 C 22 12, 22 24, 12 29"
          stroke="#D4AF77"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Core Dot */}
        <circle cx="18" cy="18" r="2.5" fill="#D4AF77" />
      </svg>
    </div>
    <span className="text-xl font-bold tracking-tight text-white font-sans">
      OsterdOps
    </span>
  </div>
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
          <radialGradient id="loginAuraDaemon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4AF77" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#10B981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#050907" stopOpacity="0" />
          </radialGradient>

          {/* Golden Wave Ribbon Gradients */}
          <linearGradient id="goldRibbon1D" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF77" stopOpacity="0" />
            <stop offset="30%" stopColor="#E5C287" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#D4AF77" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="goldRibbon2D" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
            <stop offset="50%" stopColor="#D4AF77" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>

          {/* Ceramic Robot Gradients */}
          <linearGradient id="robotBodyD" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F5F3ED" />
            <stop offset="100%" stopColor="#DDD8CD" />
          </linearGradient>

          <linearGradient id="robotVisorD" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#08140E" />
            <stop offset="100%" stopColor="#020805" />
          </linearGradient>

          <linearGradient id="sproutLeafD" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Rock Crag Gradients */}
          <linearGradient id="rockGradD" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2F2B" />
            <stop offset="40%" stopColor="#171C18" />
            <stop offset="100%" stopColor="#080C0A" />
          </linearGradient>

          <linearGradient id="rockGoldRimD" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF77" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#E5C287" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#171C18" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient Back Glow */}
        <ellipse cx="200" cy="160" rx="160" ry="120" fill="url(#loginAuraDaemon)" />

        {/* Glowing Sinuous Ribbons */}
        <path
          d="M 10 200 C 90 120, 160 250, 240 170 C 310 100, 350 210, 390 140"
          stroke="url(#goldRibbon1D)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 20 220 C 100 140, 170 270, 250 190 C 320 120, 360 230, 400 160"
          stroke="url(#goldRibbon2D)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="4 2"
        />
        <path
          d="M 0 170 C 80 230, 180 130, 280 220 C 340 270, 370 190, 400 210"
          stroke="url(#goldRibbon1D)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Dark Craggy Rocks Platform */}
        <path
          d="M 60 280 L 120 215 L 180 235 L 230 205 L 290 230 L 350 285 L 390 320 L 20 320 Z"
          fill="url(#rockGradD)"
        />
        {/* Golden Rim Highlights on Rock Edges */}
        <path
          d="M 60 280 L 120 215 L 180 235 L 230 205 L 290 230 L 350 285"
          stroke="url(#rockGoldRimD)"
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
            fill="url(#sproutLeafD)"
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
            fill="url(#robotBodyD)"
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
            fill="url(#robotVisorD)"
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
            fill="url(#robotBodyD)"
            stroke="#DDD8CD"
            strokeWidth="1.8"
          />

          {/* Core Target Ring Emblem on Chest */}
          <circle cx="65" cy="114" r="7" fill="none" stroke="#10B981" strokeWidth="1.8" />
          <circle cx="65" cy="114" r="3" fill="#D4AF77" />

          {/* Left & Right Resting Arms */}
          <ellipse cx="30" cy="108" rx="7" ry="11" fill="url(#robotBodyD)" stroke="#DDD8CD" strokeWidth="1.2" />
          <ellipse cx="100" cy="108" rx="7" ry="11" fill="url(#robotBodyD)" stroke="#DDD8CD" strokeWidth="1.2" />
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
            <span className="font-bold text-white tracking-tight">OsterdOps</span>
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
                  fill="url(#dashGradD)"
                  opacity="0.25"
                />
                <defs>
                  <linearGradient id="dashGradD" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
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
