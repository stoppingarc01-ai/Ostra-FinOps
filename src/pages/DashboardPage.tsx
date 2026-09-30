import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  Wallet,
  Cpu,
  Bell,
  Sparkles,
  FileBarChart2,
  Cable,
  Users,
  Settings,
  Search,
  Calendar,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProjectsView } from '../components/ProjectsView';
import { UsageCostsView } from '../components/UsageCostsView';
import { ReportsView } from '../components/ReportsView';
import { IntegrationsView } from '../components/IntegrationsView';
import { TeamView } from '../components/TeamView';
import { SettingsView } from '../components/SettingsView';
import { ModelsView } from '../components/ModelsView';
import { OptimizationView } from '../components/OptimizationView';
import { CalendarView } from '../components/CalendarView';
import { AlertsView } from '../components/AlertsView';
import { BudgetsView } from '../components/BudgetsView';
import { DashboardHomeView } from '../components/DashboardHomeView';
import { OverviewView } from '../components/OverviewView';
import { OstraLogo } from '../components/OstraBrand';

interface DashboardPageProps {
  onNavigateHome: () => void;
  onNavigatePricing: () => void;
  initialTab?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateHome,
  onNavigatePricing,
  initialTab,
}) => {
  const { user, profile, subscription, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab || 'dashboard');
  const [tabProgressKey, setTabProgressKey] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync activeTab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab || 'dashboard');
  }, [initialTab]);

  useEffect(() => {
    setTabProgressKey((prev) => prev + 1);
  }, [activeTab]);

  // Calculate real-time live date ranges
  const formatRange = (daysBack = 6) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - daysBack);
    const sMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const sDay = start.getDate();
    const eMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const eDay = end.getDate();
    const year = end.getFullYear();
    return `${sMonth} ${sDay} - ${eMonth} ${eDay}, ${year}`;
  };

  const [timeRange, setTimeRange] = useState<string>(() => formatRange(6));
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<'30s' | '1m' | '5m' | 'off'>('30s');
  const [autoRefreshOpen, setAutoRefreshOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Keep date updated in real time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRange((prev) => (prev.includes('-') ? formatRange(6) : prev));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';
  const displayEmail = profile?.email || user?.email || '';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const firstName = displayName.split(' ')[0];

  const sidebarNavItems = [
    { id: 'dashboard', label: 'Gateway Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'API Keys & Projects', icon: FolderKanban },
    { id: 'integrations', label: 'API Key Vault', icon: Cable },
    { id: 'models', label: 'Models & Routing', icon: Cpu },
    { id: 'usage', label: 'Usage & Costs', icon: Receipt },
    { id: 'budgets', label: 'Budgets & Limits', icon: Wallet },
    { id: 'alerts', label: 'Gateway Alerts', icon: Bell, badge: '3' },
    { id: 'optimization', label: 'Optimization', icon: Sparkles },
    { id: 'reports', label: 'Reports & Export', icon: FileBarChart2 },
    { id: 'team', label: 'Team Seats', icon: Users },
    { id: 'calendar', label: 'Calendar & Tasks', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#07090C] text-white font-sans flex antialiased selection:bg-[#C59E5F]/25 selection:text-white">
      
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ============================================================ */}
      {/* LEFT SIDEBAR                                                 */}
      {/* ============================================================ */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#07090C] border-r border-white/[0.08] flex flex-col justify-between py-5 px-4 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          
          {/* Top Logo & App Header */}
          <div className="flex items-center justify-between px-2">
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

            {/* Mobile close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:bg-white/[0.08]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#E5C38D]' : 'text-zinc-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#C59E5F]/20 text-[#E5C38D] border border-[#C59E5F]/30 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Current Plan + User Profile */}
        <div className="space-y-3 pt-3 border-t border-white/[0.08]">
          {/* Current Plan Box */}
          <div className="p-3.5 rounded-2xl bg-[#0D1016] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                {subscription?.plan_name || 'HOSTED GATEWAY'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Active
              </span>
            </div>

            {/* Quota Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400 font-medium">Monthly Proxy Quota</span>
                <span className="font-bold text-white font-mono">
                  {subscription?.quota_usage_percent ?? 2.4}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, subscription?.quota_usage_percent ?? 2.4)}%` }}
                />
              </div>
            </div>

            <button
              onClick={onNavigatePricing}
              className="w-full text-center py-1 text-[11px] font-bold text-[#E5C38D] hover:text-white flex items-center justify-center gap-1 group cursor-pointer transition-colors"
            >
              <span>Manage Plan</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* User Profile Card */}
          <div 
            onClick={() => setActiveTab('settings')}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover border border-[#C59E5F]/30 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#18181B] border border-[#C59E5F]/30 text-[#E5C38D] text-xs font-bold flex items-center justify-center font-mono">
                  {initials}
                </div>
              )}
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight group-hover:text-[#E5C38D] transition-colors">
                  {displayName}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[110px]">
                  {displayEmail}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); signOut(); onNavigateHome(); }}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA                                            */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col min-w-0 pb-16">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#07090C]/90 backdrop-blur-md border-b border-white/[0.08] px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Greeting */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:bg-white/[0.08]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg lg:text-xl font-extrabold text-white tracking-tight leading-snug flex items-center gap-2">
                <span>Good morning, {firstName}</span>
              </h1>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Here's your proxy spend intelligence for today.
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search anything... ⌘K"
                className="w-44 lg:w-56 pl-8 pr-3 py-1.5 text-xs bg-[#0F131A] border border-white/[0.1] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C59E5F] transition-colors"
              />
            </div>

            {/* Real-time Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => setDateDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-medium text-zinc-200 hover:bg-white/[0.06] transition-colors shadow-xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C59E5F]" />
                <span className="hidden sm:inline font-mono">{timeRange}</span>
                <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${dateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dateDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#0B0E14] border border-white/[0.1] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 font-sans">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-2.5 py-1">
                    Live Time Range
                  </div>
                  {[
                    { label: 'Last 7 Days', sub: formatRange(6), action: () => setTimeRange(formatRange(6)) },
                    {
                      label: 'Today',
                      sub: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      action: () => setTimeRange(`${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${new Date().getFullYear()}`)
                    },
                    { label: 'Last 14 Days', sub: formatRange(13), action: () => setTimeRange(formatRange(13)) },
                    { label: 'Last 30 Days', sub: formatRange(29), action: () => setTimeRange(formatRange(29)) },
                    {
                      label: 'This Month',
                      sub: `${new Date().toLocaleDateString('en-US', { month: 'short' })} 1 - ${new Date().getDate()}, ${new Date().getFullYear()}`,
                      action: () => setTimeRange(`${new Date().toLocaleDateString('en-US', { month: 'short' })} 1 - ${new Date().getDate()}, ${new Date().getFullYear()}`)
                    },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        opt.action();
                        setDateDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-white/[0.06] text-zinc-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="font-semibold">{opt.label}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto refresh */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAutoRefreshOpen(!autoRefreshOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors shadow-xs cursor-pointer"
                title="Telemetry refresh interval"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${autoRefreshInterval !== 'off' ? 'text-[#C59E5F]' : 'text-zinc-500'} ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Auto refresh {autoRefreshInterval !== 'off' ? `(${autoRefreshInterval})` : '(Paused)'}</span>
                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${autoRefreshOpen ? 'rotate-180' : ''}`} />
              </button>

              {autoRefreshOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0B0E14] border border-white/[0.12] shadow-2xl p-1.5 z-50 space-y-1 font-mono text-xs">
                  {[
                    { val: '30s', label: 'Every 30 seconds (Default)' },
                    { val: '1m', label: 'Every 1 minute' },
                    { val: '5m', label: 'Every 5 minutes' },
                    { val: 'off', label: 'Pause auto-refresh' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => {
                        setAutoRefreshInterval(opt.val as any);
                        setAutoRefreshOpen(false);
                        setIsRefreshing(true);
                        setTimeout(() => setIsRefreshing(false), 800);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        autoRefreshInterval === opt.val
                          ? 'bg-[#C59E5F]/20 text-[#E5C38D]'
                          : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <span className="text-[11px] font-semibold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`p-2 rounded-xl border shadow-xs relative transition-colors cursor-pointer ${
                activeTab === 'alerts' 
                  ? 'bg-[#C59E5F]/20 text-[#E5C38D] border-[#C59E5F]/40' 
                  : 'bg-[#0B0E14] border-white/[0.08] text-zinc-400 hover:text-white'
              }`}
              title="View System Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-[#07090C]" />
            </button>

            {/* Quick exit to website */}
            <button
              onClick={onNavigateHome}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium border border-white/[0.08] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Exit Console</span>
              <ExternalLink className="w-3 h-3 text-[#C59E5F]" />
            </button>
          </div>
        </header>

        {/* Top Micro Progress Bar on Tab Transition */}
        <div key={`tab-prog-${tabProgressKey}`} className="route-progress-bar" />

        {/* Dashboard / Content Container */}
        <div key={activeTab} className="tab-transition-enter px-6 lg:px-8 pt-6 space-y-6 max-w-[1600px] mx-auto w-full">
          {activeTab === 'alerts' ? (
            <AlertsView />
          ) : activeTab === 'budgets' ? (
            <BudgetsView />
          ) : activeTab === 'calendar' ? (
            <CalendarView />
          ) : activeTab === 'projects' ? (
            <ProjectsView />
          ) : activeTab === 'models' ? (
            <ModelsView />
          ) : activeTab === 'optimization' ? (
            <OptimizationView />
          ) : activeTab === 'usage' ? (
            <UsageCostsView />
          ) : activeTab === 'reports' ? (
            <ReportsView />
          ) : activeTab === 'integrations' ? (
            <IntegrationsView />
          ) : activeTab === 'team' ? (
            <TeamView />
          ) : activeTab === 'settings' ? (
            <SettingsView onNavigateHome={onNavigateHome} />
          ) : activeTab === 'guide' ? (
            <DashboardHomeView
              onGetStarted={() => setActiveTab('dashboard')}
              onViewIntegrations={() => setActiveTab('integrations')}
              onViewOverview={() => setActiveTab('dashboard')}
            />
          ) : (
            <OverviewView
              onNavigateToUsage={() => setActiveTab('usage')}
              onNavigateToModels={() => setActiveTab('models')}
              onNavigateToAlerts={() => setActiveTab('alerts')}
              onNavigateToBudgets={() => setActiveTab('budgets')}
              onNavigateToBilling={onNavigatePricing}
            />
          )}
        </div>
      </main>
    </div>
  );
};
