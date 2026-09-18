import React, { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

interface CookieBannerProps {
  onNavigateToCookies?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigateToCookies }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('osterdops_cookie_consent');
    if (!consent) {
      // Delay display slightly so it doesn't jarringly block the initial load
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('osterdops_cookie_consent', 'all');
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('osterdops_cookie_consent', 'essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white/95 backdrop-blur-md border border-[#EAE5DC] rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 text-charcoal-900">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-sandstone-200 text-charcoal-800 flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-xs font-bold tracking-tight text-charcoal-900">
            Cookie &amp; Privacy Preferences
          </span>
        </div>

        <button
          onClick={handleEssentialOnly}
          className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-sandstone-200 transition-colors cursor-pointer"
          title="Dismiss (Essential only)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[11.5px] text-charcoal-600 leading-relaxed mb-4">
        We use essential cookies for authentication and localized currency detection. We do <strong>not</strong> use third-party advertising cookies or track prompt code across sites.
      </p>

      <div className="flex items-center justify-between gap-2.5 pt-1">
        <button
          onClick={onNavigateToCookies}
          className="text-[11px] font-semibold text-charcoal-600 hover:text-charcoal-900 underline transition-colors cursor-pointer"
        >
          Read Policy
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEssentialOnly}
            className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EAE0] text-charcoal-800 border border-[#EAE4D8] text-xs font-semibold transition-all cursor-pointer"
          >
            Essential Only
          </button>

          <button
            onClick={handleAcceptAll}
            className="px-3.5 py-1.5 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
