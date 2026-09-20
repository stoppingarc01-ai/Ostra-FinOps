import React from 'react';

export type OstraLogoVariant = 'gold' | 'charcoal' | 'white' | 'sandstone';

interface OstraIconProps {
  className?: string;
  variant?: OstraLogoVariant;
}

/**
 * Precision SVG implementation of the Ostra orbital mark:
 * - Orbit: outer dynamic crescent ring
 * - Control: inner spherical core
 * - Observation: diagonal slicing orbital ring
 * - Growth: razor-sharp directional taper
 */
export const OstraIcon: React.FC<OstraIconProps> = ({
  className = 'w-8 h-8',
  variant = 'gold',
}) => {
  const gradientId = React.useId();

  // Color configurations based on brand kit
  if (variant === 'charcoal') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} shrink-0`}
        aria-label="Ostra Emblem"
      >
        {/* Core Sphere */}
        <circle cx="50" cy="48" r="11" fill="#0B0F0F" />
        
        {/* Outer Orbital Crescent Ring */}
        <path
          d="M 18,52 
             C 18,34 32,20 50,20 
             C 66,20 78,30 84,42 
             C 76,33 64,28 50,28 
             C 38,28 27,37 26,51 
             Z"
          fill="#0B0F0F"
        />
        <path
          d="M 23,60 
             C 27,74 38,82 52,82 
             C 68,82 81,72 85,57 
             C 83,67 71,75 56,75 
             C 42,75 31,69 27,61 
             Z"
          fill="#0B0F0F"
        />

        {/* Diagonal Slicing Orbital Ring / Blade */}
        <path
          d="M 6,70 
             C 24,62 50,47 88,38 
             C 93,37 96,37 96,38 
             C 96,39 88,43 82,47 
             C 52,58 24,71 6,70 
             Z"
          fill="#0B0F0F"
        />
      </svg>
    );
  }

  if (variant === 'white') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} shrink-0`}
        aria-label="Ostra Emblem"
      >
        <circle cx="50" cy="48" r="11" fill="#FFFFFF" />
        <path
          d="M 18,52 
             C 18,34 32,20 50,20 
             C 66,20 78,30 84,42 
             C 76,33 64,28 50,28 
             C 38,28 27,37 26,51 
             Z"
          fill="#FFFFFF"
        />
        <path
          d="M 23,60 
             C 27,74 38,82 52,82 
             C 68,82 81,72 85,57 
             C 83,67 71,75 56,75 
             C 42,75 31,69 27,61 
             Z"
          fill="#FFFFFF"
        />
        <path
          d="M 6,70 
             C 24,62 50,47 88,38 
             C 93,37 96,37 96,38 
             C 96,39 88,43 82,47 
             C 52,58 24,71 6,70 
             Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Default: Luxe Metallic Gold (Brand `#D4AF7C` with specular highlights)
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-[0_2px_12px_rgba(212,175,124,0.3)]`}
      aria-label="Ostra Emblem"
    >
      <defs>
        {/* Rich Metallic Specular Gold Gradient */}
        <linearGradient id={`${gradientId}-gold`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#FFF4DB" />
          <stop offset="25%" stopColor="#EAD2A8" />
          <stop offset="55%" stopColor="#D4AF7C" />
          <stop offset="85%" stopColor="#AA824B" />
          <stop offset="100%" stopColor="#7E5927" />
        </linearGradient>

        {/* Spherical Core Lighting Gradient */}
        <radialGradient id={`${gradientId}-sphere`} cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="35%" stopColor="#EAD2A8" />
          <stop offset="70%" stopColor="#D4AF7C" />
          <stop offset="100%" stopColor="#765223" />
        </radialGradient>

        {/* Diagonal Slicing Blade Gradient */}
        <linearGradient id={`${gradientId}-blade`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#AA824B" />
          <stop offset="35%" stopColor="#EAD2A8" />
          <stop offset="65%" stopColor="#FFF4DB" />
          <stop offset="90%" stopColor="#D4AF7C" />
          <stop offset="100%" stopColor="#8E6732" />
        </linearGradient>
      </defs>

      {/* Core Sphere */}
      <circle cx="50" cy="48" r="11" fill={`url(#${gradientId}-sphere)`} />

      {/* Outer Orbital Crescent Ring */}
      <path
        d="M 18,52 
           C 18,34 32,20 50,20 
           C 66,20 78,30 84,42 
           C 76,33 64,28 50,28 
           C 38,28 27,37 26,51 
           Z"
        fill={`url(#${gradientId}-gold)`}
      />
      <path
        d="M 23,60 
           C 27,74 38,82 52,82 
           C 68,82 81,72 85,57 
           C 83,67 71,75 56,75 
           C 42,75 31,69 27,61 
           Z"
        fill={`url(#${gradientId}-gold)`}
      />

      {/* Diagonal Slicing Orbital Ring / Blade */}
      <path
        d="M 6,70 
           C 24,62 50,47 88,38 
           C 93,37 96,37 96,38 
           C 96,39 88,43 82,47 
           C 52,58 24,71 6,70 
           Z"
        fill={`url(#${gradientId}-blade)`}
      />
    </svg>
  );
};

interface OstraLogoProps {
  iconClassName?: string;
  textClassName?: string;
  variant?: OstraLogoVariant;
  showTagline?: boolean;
  taglineType?: 'control' | 'infra';
  className?: string;
  brandName?: string;
}

/**
 * Full Ostra Brand Logo (Emblem + Sora Wordmark + Optional Tagline)
 */
export const OstraLogo: React.FC<OstraLogoProps> = ({
  iconClassName = 'w-8 h-8',
  textClassName = '',
  variant = 'gold',
  showTagline = false,
  taglineType = 'control',
  className = '',
  brandName = 'OstraOps',
}) => {
  const isDark = variant === 'gold' || variant === 'white';
  const defaultTextClass = isDark ? 'text-white' : 'text-[#0B0F0F]';

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      <OstraIcon className={iconClassName} variant={variant} />
      <div className="flex flex-col justify-center">
        <span
          className={`font-sans font-bold tracking-tight leading-none text-xl sm:text-2xl ${
            textClassName || defaultTextClass
          }`}
        >
          {brandName}
        </span>
        {showTagline && taglineType === 'control' && (
          <span
            className={`font-mono text-[9px] tracking-[0.24em] uppercase mt-1 font-medium ${
              isDark ? 'text-[#A4AFB3]' : 'text-[#555E61]'
            }`}
          >
            CONTROL / OBSERVE / OPTIMIZE
          </span>
        )}
        {showTagline && taglineType === 'infra' && (
          <span
            className={`text-[10px] tracking-tight font-medium mt-0.5 ${
              isDark ? 'text-[#D4AF7C]' : 'text-[#8E6B2C]'
            }`}
          >
            The AI infrastructure for builders.
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * App Icon Squircle matching the brand guide mock:
 * Deep charcoal square with gold Ostra mark embossed.
 */
export const OstraAppIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-[22%] bg-gradient-to-b from-[#181E20] to-[#0B0F0F] border border-white/10 shadow-2xl flex items-center justify-center p-3 select-none group overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
      <OstraIcon className="w-full h-full" variant="gold" />
    </div>
  );
};
