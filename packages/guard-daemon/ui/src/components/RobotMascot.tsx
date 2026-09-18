import React from 'react';

interface RobotMascotProps {
  className?: string;
  size?: number;
  withPedestal?: boolean;
}

export const RobotMascot: React.FC<RobotMascotProps> = ({
  className = '',
  size = 120,
  withPedestal = false,
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={withPedestal ? size * 1.25 : size}
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <radialGradient id="glowRings" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f0fdf4" />
            <stop offset="100%" stopColor="#dcfce7" />
          </linearGradient>
          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#062e20" />
            <stop offset="100%" stopColor="#021a12" />
          </linearGradient>
          <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
        </defs>

        {/* Ambient Glowing Energy Rings */}
        <ellipse cx="100" cy="115" rx="85" ry="35" stroke="#10b981" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="6 6" />
        <ellipse cx="100" cy="115" rx="65" ry="25" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Sprout Leaf Antenna */}
        <path
          d="M 98 45 C 96 30, 85 20, 80 16 C 92 18, 98 28, 100 36 C 102 26, 114 18, 122 18 C 118 26, 108 34, 102 45 Z"
          fill="#10b981"
        />
        <circle cx="100" cy="46" r="3.5" fill="#059669" />

        {/* Floating Robot Body & Head */}
        <g className="animate-[bounce_4s_ease-in-out_infinite]">
          {/* Outer Head Shell */}
          <rect
            x="50"
            y="48"
            width="100"
            height="85"
            rx="42"
            fill="url(#bodyGrad)"
            stroke="#bbf7d0"
            strokeWidth="2.5"
          />

          {/* Ears / Side Nodes */}
          <circle cx="48" cy="90" r="7" fill="#dcfce7" stroke="#10b981" strokeWidth="2" />
          <circle cx="152" cy="90" r="7" fill="#dcfce7" stroke="#10b981" strokeWidth="2" />

          {/* Dark Glass Visor */}
          <rect
            x="64"
            y="65"
            width="72"
            height="52"
            rx="26"
            fill="url(#visorGrad)"
            stroke="#10b981"
            strokeWidth="1.5"
          />

          {/* Friendly Glowing Green Eyes */}
          <rect x="78" y="78" width="13" height="22" rx="6.5" fill="#34d399" className="animate-pulse" />
          <rect x="109" y="78" width="13" height="22" rx="6.5" fill="#34d399" className="animate-pulse" />
          {/* Eye glints */}
          <circle cx="82" cy="83" r="2.5" fill="#ffffff" />
          <circle cx="113" cy="83" r="2.5" fill="#ffffff" />

          {/* Lower Floating Torso */}
          <path
            d="M 75 130 C 75 130, 82 160, 100 160 C 118 160, 125 130, 125 130 Z"
            fill="url(#bodyGrad)"
            stroke="#bbf7d0"
            strokeWidth="2"
          />

          {/* Circular Core Target Emblem */}
          <circle cx="100" cy="144" r="8" fill="none" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="100" cy="144" r="3.5" fill="#10b981" />

          {/* Floating Hands */}
          <ellipse cx="60" cy="138" rx="8" ry="12" fill="url(#bodyGrad)" stroke="#bbf7d0" strokeWidth="1.5" />
          <ellipse cx="140" cy="138" rx="8" ry="12" fill="url(#bodyGrad)" stroke="#bbf7d0" strokeWidth="1.5" />
        </g>

        {/* Optional Cylindrical Pedestal */}
        {withPedestal && (
          <g>
            <ellipse cx="100" cy="195" rx="55" ry="14" fill="#047857" opacity="0.3" />
            <path
              d="M 50 195 C 50 195, 50 215, 100 218 C 150 215, 150 195, 150 195 L 150 205 C 150 225, 50 225, 50 205 Z"
              fill="url(#pedestalGrad)"
            />
            <ellipse cx="100" cy="195" rx="50" ry="12" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
};
