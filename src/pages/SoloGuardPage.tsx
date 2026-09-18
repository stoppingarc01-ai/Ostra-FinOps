import React from 'react';
import { SoloGuardView } from '../components/SoloGuardView';
import { OstraLogo } from '../components/OstraBrand';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ExternalLink, ArrowLeft } from 'lucide-react';

interface SoloGuardPageProps {
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  onNavigatePricing: () => void;
}

export const SoloGuardPage: React.FC<SoloGuardPageProps> = ({
  onNavigateHome,
  onNavigateDashboard,
  onNavigatePricing,
}) => {
  const { user, profile, signOut, subscription } = useAuth();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Developer';
  const displayEmail = profile?.email || user?.email || '';
  const isHostedUser = subscription?.plan_id === 'team_scale' || subscription?.plan_id === 'enterprise';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-charcoal-900 font-sans flex flex-col antialiased selection:bg-osterdGold-500/20 selection:text-charcoal-900">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE5DC] px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Logo & Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <OstraLogo
              iconClassName="w-8 h-8 group-hover:scale-105 transition-transform duration-200"
              textClassName="text-xl font-bold tracking-tight text-[#0B0F0F] font-sans"
              variant="charcoal"
              showTagline={true}
              taglineType="control"
            />
          </button>
        </div>

        {/* Right Actions: User Profile & Controls */}
        <div className="flex items-center gap-3">
          {isHostedUser && (
            <>
              <button
                onClick={onNavigateDashboard}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE5DC] hover:border-charcoal-400 text-charcoal-800 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>Hosted Gateway Console</span>
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-500" />
              </button>
              <div className="h-4 w-px bg-[#EAE5DC] hidden sm:block" />
            </>
          )}

          {/* User pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-sandstone-100 border border-[#EAE4D8]" title={displayEmail}>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-charcoal-900">{displayName}</span>
          </div>

          <button
            onClick={() => { signOut(); onNavigateHome(); }}
            className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-sandstone-200 transition-colors cursor-pointer"
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to OsterdOps Home</span>
          </button>
        </div>

        <SoloGuardView
          onNavigateToTeamGateway={isHostedUser ? onNavigateDashboard : undefined}
          onNavigateToPricing={onNavigatePricing}
          isHostedGatewayUser={isHostedUser}
        />
      </main>

    </div>
  );
};
