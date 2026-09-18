import React, { useState } from 'react';
import { Search, Bell, Moon, ChevronDown, LogOut, User, Settings as SettingsIcon, Shield } from 'lucide-react';
import type { ConnectionState } from '../types';

interface TopNavProps {
  connectionState: ConnectionState;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  placeholder?: string;
  onNavigateTab?: (tab: string) => void;
  onOpenCommandPalette?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search models, providers, or capabilities...',
  onNavigateTab,
  onOpenCommandPalette,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 border-b border-[#EAE4D8] bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-20 px-6 sm:px-8 flex items-center justify-between gap-6 font-sans">
      {/* Search Input Bar with Command shortcut */}
      <div className="relative flex-1 max-w-xl lg:max-w-2xl">
        <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ paddingLeft: '2.6rem', paddingRight: '3.75rem' }}
          className="w-full bg-[#FFFFFF] border border-[#EAE4D8] rounded-xl py-2.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] focus:ring-1 focus:ring-[#0C2419]/20 transition-all font-sans shadow-2xs"
        />
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-2 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E2D5] text-[10px] font-mono text-charcoal-500 hover:bg-[#F0ECE1] cursor-pointer transition-colors z-10"
          title="Open Command Palette (⌘K / Ctrl+K)"
        >
          <span>⌘</span>
          <span>K</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 hover:bg-[#F5F2EB] border border-[#EAE4D8] bg-white transition-colors cursor-pointer relative shadow-2xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#EAE4D8] rounded-xl shadow-xl z-30 p-3 text-xs space-y-2 animate-in fade-in duration-150">
              <div className="font-bold text-charcoal-900 flex items-center justify-between">
                <span>Notifications</span>
                <span className="text-[10px] text-emerald-700 bg-[#E5F2EB] px-1.5 py-0.5 rounded">
                  All systems live
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Guard Sentinel daemon running on port 4040. Telemetry streaming active.
              </p>
            </div>
          )}
        </div>

        {/* Dark Mode Moon Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 hover:bg-[#F5F2EB] border border-[#EAE4D8] bg-white transition-colors cursor-pointer shadow-2xs"
          title="Toggle theme"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* User Pill: Shaan Prasad / solo@osterdops.com */}
        <div className="relative">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-3 border-l border-[#EAE4D8] cursor-pointer hover:opacity-90 transition-opacity select-none"
          >
            {/* Portrait Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-100 border border-amber-300 shadow-2xs shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                <rect width="36" height="36" fill="#FDE68A" />
                <circle cx="18" cy="14" r="7" fill="#78350F" />
                <path d="M7 32 C7 25 12 22 18 22 C24 22 29 25 29 32" fill="#1E293B" />
                <circle cx="18" cy="15" r="5" fill="#FCD34D" />
                <path d="M15 15 Q18 18 21 15" stroke="#78350F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-charcoal-900 leading-tight">
                Shaan Prasad
              </div>
              <div className="text-[10.5px] text-charcoal-500">
                solo@osterdops.com
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 hidden sm:block ml-0.5" />
          </div>

          {/* User Menu Popover */}
          {showUserMenu && onNavigateTab && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-[#EAE4D8] rounded-xl shadow-xl z-30 py-1 text-xs animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-[#F2EDE4]">
                <div className="font-bold text-charcoal-900">Shaan Prasad</div>
                <div className="text-[10.5px] text-charcoal-400 font-mono">solo@osterdops.com</div>
              </div>
              <button
                onClick={() => {
                  onNavigateTab('account');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-charcoal-800 hover:bg-[#FAF8F5] cursor-pointer font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span>Account & Gateway</span>
              </button>
              <button
                onClick={() => {
                  onNavigateTab('settings');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-charcoal-700 hover:bg-[#FAF8F5] cursor-pointer"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Daemon Settings</span>
              </button>
              <button
                onClick={() => {
                  onNavigateTab('models');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-charcoal-700 hover:bg-[#FAF8F5] cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Models Catalog</span>
              </button>
              <div className="border-t border-[#F2EDE4] my-1" />
              <button
                onClick={() => {
                  onNavigateTab('auth');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Reset Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
