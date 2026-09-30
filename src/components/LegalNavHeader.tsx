import React from 'react';
import { ShieldCheck, FileText, Cookie, RotateCcw, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { OstraLogo } from './OstraBrand';

interface LegalNavHeaderProps {
  currentPage: 'privacy' | 'terms' | 'cookies' | 'refund';
  onNavigate: (route: string) => void;
}

export const LegalNavHeader: React.FC<LegalNavHeaderProps> = ({ currentPage, onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#080A0E]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Back to Home */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
            title="Return to OstraOps Home"
          >
            <OstraLogo
              iconClassName="w-8 h-8 group-hover:scale-105 transition-transform duration-300"
              textClassName="text-lg font-bold tracking-tight text-white font-sans"
              variant="gold"
              showTagline={false}
            />
          </button>

          {/* Quick Legal Switcher Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <button
              onClick={() => onNavigate('privacy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentPage === 'privacy'
                  ? 'bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => onNavigate('terms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentPage === 'terms'
                  ? 'bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
            </button>

            <button
              onClick={() => onNavigate('cookies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentPage === 'cookies'
                  ? 'bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Cookie className="w-3.5 h-3.5" />
              <span>Data &amp; Cookies</span>
            </button>

            <button
              onClick={() => onNavigate('refund')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentPage === 'refund'
                  ? 'bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refund Policy</span>
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => onNavigate('pricing')}
            className="hidden sm:inline-flex text-xs font-medium text-zinc-400 hover:text-[#E5C38D] transition-colors px-2.5 py-1.5 cursor-pointer"
          >
            Pricing &amp; Tiers
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#C59E5F]" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] hover:opacity-95 text-[#080A0E] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Site</span>
          </button>
        </div>
      </div>

      {/* Mobile Tabs Bar */}
      <div className="flex md:hidden items-center justify-between gap-1 mt-3 pt-2.5 border-t border-white/[0.06] overflow-x-auto no-scrollbar">
        <button
          onClick={() => onNavigate('privacy')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center whitespace-nowrap transition-all ${
            currentPage === 'privacy'
              ? 'bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Privacy
        </button>
        <button
          onClick={() => onNavigate('terms')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center whitespace-nowrap transition-all ${
            currentPage === 'terms'
              ? 'bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Terms
        </button>
        <button
          onClick={() => onNavigate('cookies')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center whitespace-nowrap transition-all ${
            currentPage === 'cookies'
              ? 'bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Cookies
        </button>
        <button
          onClick={() => onNavigate('refund')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center whitespace-nowrap transition-all ${
            currentPage === 'refund'
              ? 'bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Refunds
        </button>
      </div>
    </header>
  );
};
