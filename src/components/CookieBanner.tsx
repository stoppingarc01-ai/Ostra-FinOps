import React, { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

interface CookieBannerProps {
  onNavigateToCookies?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigateToCookies }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ostraops_cookie_consent');
    if (consent) return;

    // Show on first user interaction (scroll, touch, click) so it never steals LCP from Hero
    const trigger = () => {
      setVisible(true);
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('scroll', trigger);
      window.removeEventListener('touchstart', trigger);
      window.removeEventListener('click', trigger);
      clearTimeout(fallbackTimer);
    };

    window.addEventListener('scroll', trigger, { passive: true, once: true });
    window.addEventListener('touchstart', trigger, { passive: true, once: true });
    window.addEventListener('click', trigger, { passive: true, once: true });
    const fallbackTimer = setTimeout(trigger, 8000);

    return cleanup;
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
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          title="Dismiss (Essential only)"
          aria-label="Dismiss cookie preferences modal"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11.5px] text-zinc-300 leading-relaxed mb-4">
        We use essential cookies for authentication and localized currency detection. We do <strong>not</strong> use third-party advertising cookies or track prompt code across sites.
      </p>

      <div className="flex items-center justify-between gap-2.5 pt-1">
        <button
          onClick={onNavigateToCookies}
          className="text-[11px] font-semibold text-zinc-300 hover:text-[#E5C38D] underline transition-colors cursor-pointer py-2"
          aria-label="Read full Cookie and Privacy Policy"
        >
          Read Policy
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEssentialOnly}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.1] text-xs font-semibold transition-all cursor-pointer min-h-[44px]"
            aria-label="Allow essential cookies only"
          >
            Essential Only
          </button>

          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] hover:opacity-95 text-[#07090C] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            aria-label="Accept all cookies and continue"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
