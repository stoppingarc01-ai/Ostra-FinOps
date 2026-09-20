import React from 'react';
import { SoloGuardView } from '../components/SoloGuardView';
import { OstraLogo } from '../components/OstraBrand';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ArrowLeft, Terminal, LayoutDashboard } from 'lucide-react';

interface SoloGuardPageProps {
  onNavigateHome: () => void;
  onNavigateDashboard?: () => void;
  onNavigatePricing: () => void;
}

export const SoloGuardPage: React.FC<SoloGuardPageProps> = ({
  onNavigateHome,
  onNavigateDashboard,
  onNavigatePricing,
}) => {
  const { user, profile, signOut } = useAuth();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Developer';
  const displayEmail = profile?.email || user?.email || '';

  return (
    <div className="min-h-screen bg-[#0C1519] text-[#F5EFEB] font-sans flex flex-col antialiased selection:bg-[#724B39]/40 selection:text-[#CF9D7B]">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#162127]/90 backdrop-blur-md border-b border-[#3A3534] px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Logo & Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <OstraLogo
              iconClassName="w-8 h-8 group-hover:scale-105 transition-transform duration-200"
              textClassName="text-xl font-bold tracking-tight text-white font-sans"
              variant="gold"
              showTagline={true}
              taglineType="control"
            />
          </button>
        </div>

        {/* Right Actions: Switch to Hosted Gateway, Solo Developer Plan Badge & Profile */}
        <div className="flex items-center gap-3">
          {onNavigateDashboard && (
            <button
              onClick={onNavigateDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C1519] border border-[#3A3534] text-[#CF9D7B] hover:text-white hover:bg-[#3A3534]/50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Open Cloud Hosted Gateway Console"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#CF9D7B]" />
              <span>Hosted Gateway</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#724B39]/30 border border-[#724B39] text-[#CF9D7B] text-xs font-mono font-bold">
            <Terminal className="w-3.5 h-3.5 text-[#CF9D7B]" />
            <span>Solo Developer Console</span>
          </div>

          {/* User pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#0C1519] border border-[#3A3534]" title={displayEmail}>
            <span className="w-2 h-2 rounded-full bg-[#CF9D7B]" />
            <span className="text-xs font-semibold text-white">{displayName}</span>
          </div>

          <button
            onClick={() => { signOut(); onNavigateHome(); }}
            className="p-1.5 rounded-lg text-[#A69C95] hover:text-[#CF9D7B] hover:bg-[#3A3534]/50 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 pt-8">
        <div className="mb-4">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#CF9D7B] hover:text-[#DBB093] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to OstraOps Home</span>
          </button>
        </div>

        <SoloGuardView
          onNavigateToPricing={onNavigatePricing}
          isHostedGatewayUser={false}
        />
      </main>

    </div>
  );
};
