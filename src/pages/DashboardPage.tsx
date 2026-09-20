import React, { useState, useEffect } from 'react';
import {
  Crown,
  Home,
  Terminal,
  Cpu,
  Cable,
  FolderKanban,
  FileText,
  BarChart3,
  CreditCard,
  Settings,
  Calendar as CalendarIcon,
  Search,
  Bell,
  Menu,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ProjectsView } from '../components/ProjectsView';
import { UsageCostsView } from '../components/UsageCostsView';
import { ReportsView } from '../components/ReportsView';
import { IntegrationsView } from '../components/IntegrationsView';
import { SettingsView } from '../components/SettingsView';
import { ModelsView } from '../components/ModelsView';
import { CalendarView } from '../components/CalendarView';
import { AlertsView } from '../components/AlertsView';
import { BudgetsView } from '../components/BudgetsView';
import { DashboardHomeView } from '../components/DashboardHomeView';
import { DaemonServerView } from '../components/DaemonServerView';
import { OstraLogo } from '../components/OstraBrand';
import { useDaemonData } from '../lib/daemonClient';

interface DashboardPageProps {
  onNavigateHome: () => void;
  onNavigatePricing?: () => void;
  onNavigateSoloGuard?: () => void;
  initialTab?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateHome,
  initialTab,
}) => {
  const { user, profile, signOut } = useAuth();
  const { refreshNow } = useDaemonData();

  // Default to 'daemon' tab matching inspiration image
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'daemon');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'dashboard' ? 'daemon' : initialTab);
    }
  }, [initialTab]);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Shaan Prasad';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'S';

  // Navigation Items exactly matching Image 1
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'daemon', label: 'Daemon Server', icon: Terminal, isPrimary: true },
    { id: 'models', label: 'Models', icon: Cpu },
    { id: 'integrations', label: 'Integrations', icon: Cable },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, badge: 'New' },
  ];

  return (
    <div className="min-h-screen bg-[#07090C] text-[#E6EDF3] font-sans flex flex-col antialiased selection:bg-[#D4A359]/30 selection:text-[#F7E7CC]">
      
      {/* ============================================================ */}
      {/* TOP HEADER BAR                                               */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-[#090C0F]/90 backdrop-blur-md border-b border-[#1C2530] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-[#8E9CA9] hover:text-white hover:bg-[#151D26] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <OstraLogo
              iconClassName="w-7 h-7 group-hover:scale-105 transition-transform"
              textClassName="text-lg font-bold tracking-tight text-white font-sans"
              variant="gold"
              showTagline={false}
            />
            <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#20180F] text-[#D4A359] border border-[#D4A359]/30 font-mono">
              OPS
            </span>
          </button>
        </div>

        {/* Center: Search Bar (⌘K) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#5D6D7E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything... (⌘K)"
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#0F141A] border border-[#212C37] focus:border-[#D4A359] text-xs text-white placeholder-[#5D6D7E] outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Notification Bell, Profile Pill & Daemon Online Status */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="p-2 rounded-xl bg-[#0F141A] border border-[#212C37] text-[#8E9CA9] hover:text-[#D4A359] hover:border-[#D4A359]/40 relative transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#D4A359]" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0F141A] border border-[#212C37] cursor-pointer hover:border-[#32404F] transition-colors">
            <div className="w-6 h-6 rounded-full bg-[#20180E] border border-[#D4A359]/40 text-[#D4A359] flex items-center justify-center text-xs font-bold font-mono">
              {initials}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-semibold text-white">{displayName}</div>
              <div className="text-[10px] text-[#71808F] font-mono">Owner</div>
            </div>
          </div>

          {/* Glowing Daemon Online Status Pill */}
          <div
            onClick={refreshNow}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D2619] border border-[#166534]/60 text-[#4ADE80] text-xs font-semibold cursor-pointer hover:border-[#22C55E] transition-all"
            title="Local Daemon Gateway running on 127.0.0.1:8080"
          >
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="hidden sm:inline">Daemon Online</span>
          </div>

          {/* Sign out */}
          <button
            onClick={() => { signOut(); onNavigateHome(); }}
            className="p-2 rounded-xl text-[#71808F] hover:text-[#D4A359] hover:bg-[#141B23] transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN CONTAINER: SIDEBAR + CONTENT                            */}
      {/* ============================================================ */}
      <div className="flex-1 flex w-full max-w-[1720px] mx-auto">
        
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ============================================================ */}
        {/* LEFT SIDEBAR                                                 */}
        {/* ============================================================ */}
        <aside
          className={`fixed lg:sticky top-[61px] left-0 z-50 h-[calc(100vh-61px)] w-60 bg-[#080B0E] border-r border-[#1C2530] flex flex-col justify-between py-5 px-3 transition-transform duration-200 ease-in-out ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-4 overflow-y-auto">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-[#1C1710] border border-[#D4A359]/40 text-[#E5B66F] shadow-sm'
                        : 'text-[#8594A4] hover:bg-[#11171E] hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-[#D4A359]' : 'text-[#6A7888] group-hover:text-[#D4A359]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#281D10] text-[#D4A359] border border-[#D4A359]/30 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom Card: Local. Private. Yours. */}
          <div className="space-y-3 pt-3 border-t border-[#18202A]">
            <div className="p-4 rounded-2xl bg-[#0D1217] border border-[#1E2833] relative overflow-hidden space-y-2">
              <div className="text-xs font-bold text-white tracking-wide">
                Local. Private. Yours.
              </div>
              <p className="text-[11px] text-[#7A8898] leading-relaxed">
                Run the daemon. Keep your infrastructure close.
              </p>
              <button
                onClick={() => setActiveTab('settings')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4A359] hover:text-[#E8BE78] transition-colors pt-1 cursor-pointer"
              >
                <span>View Docs</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="text-[11px] text-[#556372] px-1 flex items-center justify-between">
              <span>Ostra v1.0.0</span>
              <Crown className="w-3 h-3 text-[#D4A359]/70" />
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* MAIN BODY VIEW (WITH FRAMER MOTION TRANSITIONS)              */}
        {/* ============================================================ */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full"
            >
              {activeTab === 'daemon' ? (
                <DaemonServerView
                  onNavigateTab={setActiveTab}
                  onOpenLogs={() => setActiveTab('logs')}
                />
              ) : activeTab === 'calendar' ? (
                <CalendarView />
              ) : activeTab === 'models' ? (
                <ModelsView />
              ) : activeTab === 'integrations' ? (
                <IntegrationsView />
              ) : activeTab === 'projects' ? (
                <ProjectsView />
              ) : activeTab === 'logs' ? (
                <UsageCostsView />
              ) : activeTab === 'analytics' ? (
                <ReportsView />
              ) : activeTab === 'billing' ? (
                <BudgetsView />
              ) : activeTab === 'settings' ? (
                <SettingsView onNavigateHome={onNavigateHome} />
              ) : activeTab === 'alerts' ? (
                <AlertsView />
              ) : (
                /* Fallback to Home / Gateway Overview */
                <DashboardHomeView
                  onGetStarted={() => setActiveTab('daemon')}
                  onViewIntegrations={() => setActiveTab('integrations')}
                  onViewOverview={() => setActiveTab('daemon')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
};
