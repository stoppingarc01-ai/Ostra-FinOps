import React, { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

interface CookieBannerProps {
  onNavigateToCookies?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigateToCookies }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ostraops_cookie_consent');
    if (!consent) {
      // Delay display slightly so it doesn't jarringly block the initial load
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('ostraops_cookie_consent', 'all');
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('ostraops_cookie_consent', 'essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#0B0E14]/95 backdrop-blur-xl border border-white/[0.1] rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 text-zinc-100">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-tight text-white">
            Cookie &amp; Privacy Preferences
          </span>
        </div>

        <button
          onClick={handleEssentialOnly}
          className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          title="Dismiss (Essential only)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[11.5px] text-zinc-400 leading-relaxed mb-4">
        We use essential cookies for authentication and localized currency detection. We do <strong>not</strong> use third-party advertising cookies or track prompt code across sites.
      </p>

      <div className="flex items-center justify-between gap-2.5 pt-1">
        <button
          onClick={onNavigateToCookies}
          className="text-[11px] font-semibold text-zinc-400 hover:text-[#E5C38D] underline transition-colors cursor-pointer"
        >
          Read Policy
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEssentialOnly}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
          >
            Essential Only
          </button>

          <button
            onClick={handleAcceptAll}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] hover:opacity-95 text-[#07090C] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
