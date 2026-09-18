import React from 'react';
import { Eye, DollarSign, HardDrive, ShieldCheck, Radio } from 'lucide-react';
import type { ConnectionState } from '../types';

interface BottomBarProps {
  connectionState: ConnectionState;
  port?: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  connectionState,
  port = 4040,
}) => {
  const isConnected = connectionState === 'connected' || connectionState === 'LIVE';

  const pills = [
    { label: 'Watching requests', icon: Eye },
    { label: 'Tracking costs', icon: DollarSign },
    { label: 'Local SQLite WAL', icon: HardDrive },
    { label: 'Zero telemetry leak', icon: ShieldCheck },
  ];

  return (
    <footer className="bg-[#F5F2EB] border-t border-[#E8E2D5] px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-20 font-sans">
      {/* Left Daemon Status Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="font-bold text-charcoal-900 font-sans">
            {isConnected ? 'OsterdOps Daemon Active' : 'Connecting to Sentinel...'}
          </span>
        </div>
        <span className="text-charcoal-500 font-mono text-[11px] hidden sm:inline">
          127.0.0.1:{port}
        </span>
      </div>

      {/* Feature Badges with Lucide SVG Icons */}
      <div className="hidden md:flex items-center gap-2">
        {pills.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.label}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAE3D2] text-charcoal-800 text-[11px] font-mono border border-[#DDD6C7]"
            >
              <Icon className="w-3 h-3 text-[#C59E5F]" />
              <span>{p.label}</span>
            </div>
          );
        })}
      </div>

      {/* Version Tag */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-charcoal-500">
        <span>v2.4.1-local</span>
        <span>•</span>
        <span className="text-emerald-700 font-bold">Encrypted Loopback</span>
      </div>
    </footer>
  );
};
