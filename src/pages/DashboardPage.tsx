import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
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
  TrendingUp,
  Shield,
  ArrowRight,
  Send,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Menu,
  X,
  LogOut,
  Terminal
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
import { SoloGuardView } from '../components/SoloGuardView';
import { DashboardHomeView } from '../components/DashboardHomeView';
import { SpendVelocityChart } from '../components/SpendVelocityChart';
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
  const isSoloPlan = subscription?.plan_id === 'solo_pro';
  const [activeTab, setActiveTab] = useState(initialTab || (isSoloPlan ? 'solo-guard' : 'dashboard'));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');

  // Sync activeTab when initialTab or plan changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else {
      setActiveTab(isSoloPlan ? 'solo-guard' : 'dashboard');
    }
  }, [initialTab, isSoloPlan]);

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
  const [appliedRec, setAppliedRec] = useState(false);

  // Keep date updated in real time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRange((prev) => (prev.includes('-') ? formatRange(6) : prev));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const firstName = displayName.split(' ')[0];

  const sidebarNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'solo-guard', label: 'Solo CLI & Local Guard', icon: Terminal, badge: 'Included' },
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'calendar', label: 'Calendar & Tasks', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'usage', label: 'Usage & Costs', icon: Receipt },
    { id: 'budgets', label: 'Budgets & Limits', icon: Wallet },
    { id: 'models', label: 'Models', icon: Cpu },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: '3' },
    { id: 'optimization', label: 'Optimization', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: FileBarChart2 },
    { id: 'integrations', label: 'Integrations', icon: Cable },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Heatmap intensity matrix (7 days x 5 time slots) in pure OsterdOps sandstone & gold palette
  const heatmapData = [
    // 12 AM
    [0.1, 0.15, 0.2, 0.25, 0.35, 0.2, 0.1],
    // 6 AM
    [0.2, 0.35, 0.45, 0.5, 0.6, 0.3, 0.15],
    // 12 PM
    [0.45, 0.75, 0.88, 0.95, 0.85, 0.4, 0.25],
    // 6 PM
    [0.55, 0.8, 0.85, 0.7, 0.75, 0.5, 0.3],
    // 12 AM
    [0.15, 0.25, 0.35, 0.4, 0.5, 0.2, 0.1],
  ];

  const getHeatmapColor = (val: number) => {
    if (val < 0.2) return 'bg-[#F4EFE6]';
    if (val < 0.4) return 'bg-[#E8DFC8]';
    if (val < 0.6) return 'bg-[#D6BA84]';
    if (val < 0.8) return 'bg-[#C59E5F]';
    return 'bg-[#9C7938]';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-charcoal-900 font-sans flex antialiased selection:bg-osterdGold-500/20 selection:text-charcoal-900">
      
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ============================================================ */}
      {/* LEFT SIDEBAR                                                 */}
      {/* ============================================================ */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#F5F2EB] border-r border-[#E8E2D5] flex flex-col justify-between py-5 px-4 transition-transform duration-300 ease-in-out ${
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
                textClassName="text-xl font-bold tracking-tight text-[#0B0F0F] font-sans"
                variant="charcoal"
                showTagline={true}
                taglineType="control"
              />
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-charcoal-500 hover:bg-sandstone-300"
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#EAE3D2] text-charcoal-900 font-semibold shadow-xs'
                      : 'text-charcoal-600 hover:bg-[#EFEAE0] hover:text-charcoal-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-charcoal-900' : 'text-charcoal-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#E8DCC4] text-charcoal-800 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Current Plan + User Profile */}
        <div className="space-y-3 pt-3 border-t border-[#E8E2D5]">
          {/* Current Plan Box */}
          <div className="p-3.5 rounded-2xl bg-[#FCFAF7] border border-[#EAE4D8] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider font-mono">
                {subscription?.plan_name || 'Free Tier'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>

            {/* Quota Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-charcoal-500 font-medium">Monthly Proxy Quota</span>
                <span className="font-bold text-charcoal-800 font-mono">
                  {subscription?.quota_usage_percent ?? 74}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#EAE4D8] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-osterdGold-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, subscription?.quota_usage_percent ?? 74)}%` }}
                />
              </div>
            </div>

            <button
              onClick={onNavigatePricing}
              className="w-full text-center py-1 text-[11px] font-bold text-charcoal-800 hover:text-charcoal-950 flex items-center justify-center gap-1 group cursor-pointer"
            >
              <span>Manage Plan</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#EFEAE0] transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#18181B] text-white text-xs font-bold flex items-center justify-center font-mono">
                {initials}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-charcoal-900 leading-tight">
                  {displayName}
                </div>
                <div className="text-[10px] text-charcoal-500 font-mono truncate max-w-[110px]">
                  {displayEmail}
                </div>
              </div>
            </div>
            <button
              onClick={() => { signOut(); onNavigateHome(); }}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-sandstone-300 transition-colors"
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
        <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE5DC] px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Greeting */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-charcoal-600 hover:bg-sandstone-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg lg:text-xl font-extrabold text-charcoal-900 tracking-tight leading-snug flex items-center gap-2">
                <span>Good morning, {firstName}</span>
              </h1>
              <p className="text-xs text-charcoal-500 hidden sm:block">
                Here's your proxy spend intelligence for today.
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search anything... ⌘K"
                className="w-44 lg:w-56 pl-8 pr-3 py-1.5 text-xs bg-white border border-[#EAE5DC] rounded-xl text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-osterdGold-500 transition-colors"
              />
            </div>

            {/* Real-time Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => setDateDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-medium text-charcoal-700 hover:bg-sandstone-100 transition-colors shadow-xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
                <span className="hidden sm:inline font-mono">{timeRange}</span>
                <ChevronDown className={`w-3 h-3 text-charcoal-400 transition-transform duration-200 ${dateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dateDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-[#EAE5DC] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 font-sans">
                  <div className="text-[10px] font-mono text-charcoal-400 uppercase tracking-wider px-2.5 py-1">
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
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-sandstone-100 text-charcoal-800 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="font-semibold">{opt.label}</span>
                      <span className="text-[10px] font-mono text-charcoal-500">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto refresh */}
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-medium text-charcoal-700 hover:bg-sandstone-100 transition-colors shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 text-charcoal-500" />
              <span>Auto refresh</span>
              <ChevronDown className="w-3 h-3 text-charcoal-400" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`p-2 rounded-xl border text-charcoal-600 hover:text-charcoal-900 shadow-xs relative transition-colors cursor-pointer ${
                activeTab === 'alerts' ? 'bg-charcoal-900 text-white border-transparent' : 'bg-white border-[#EAE5DC]'
              }`}
              title="View System Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white" />
            </button>
            {/* Quick exit to website */}
            <button
              onClick={onNavigateHome}
              className="px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Exit Console</span>
              <ExternalLink className="w-3 h-3 text-osterdGold-400" />
            </button>
          </div>
        </header>

        {/* Dashboard / Content Container */}
        <div className="px-6 lg:px-8 pt-6 space-y-6 max-w-[1600px] mx-auto w-full">
          {activeTab === 'alerts' ? (
            <AlertsView />
          ) : activeTab === 'solo-guard' ? (
            <SoloGuardView
              onNavigateToTeamGateway={() => setActiveTab('dashboard')}
              onNavigateToPricing={onNavigatePricing}
              isHostedGatewayUser={true}
            />
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
          ) : activeTab === 'dashboard' ? (
            <DashboardHomeView
              onGetStarted={() => setActiveTab('solo-guard')}
              onViewIntegrations={() => setActiveTab('integrations')}
              onViewOverview={() => setActiveTab('overview')}
            />
          ) : (
            <>
{/* ========================================================== */}
              {/* ROW 1: TOP 5 METRICS CARDS (Pure OsterdOps palette)        */}
              {/* ========================================================== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Metric 1: Total Spend */}
            <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-charcoal-500">Total Spend (This Month)</span>
                  <div className="w-7 h-7 rounded-xl bg-sandstone-200 text-charcoal-800 flex items-center justify-center text-xs font-mono font-bold">
                    $
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-charcoal-900 tracking-tight font-mono">
                  $4,328.64
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-charcoal-600 mt-1 font-mono">
                  <TrendingUp className="w-3 h-3 text-osterdGold-600" />
                  <span>28.6% vs last month</span>
                </div>
              </div>

              {/* Sparkline curve */}
              <div className="pt-3">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path
                    d="M0,20 Q15,18 30,12 T60,15 T85,6 T100,2"
                    fill="none"
                    stroke="#C59E5F"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,20 Q15,18 30,12 T60,15 T85,6 T100,2 L100,25 L0,25 Z"
                    fill="url(#goldGrad)"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C59E5F" />
                      <stop offset="100%" stopColor="#C59E5F" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Metric 2: Tokens Used */}
            <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-charcoal-500">Tokens Used</span>
                  <div className="w-7 h-7 rounded-xl bg-sandstone-200 text-charcoal-800 flex items-center justify-center text-xs font-mono font-bold">
                    TOK
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-charcoal-900 tracking-tight font-mono">
                  312.6M
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-charcoal-600 mt-1 font-mono">
                  <TrendingUp className="w-3 h-3 text-osterdGold-600" />
                  <span>18.2% vs last month</span>
                </div>
              </div>

              {/* Mini bar chart */}
              <div className="pt-3 flex items-end gap-1.5 h-8">
                {[35, 45, 60, 40, 70, 55, 80, 65, 90, 75, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-charcoal-700 hover:bg-charcoal-900 transition-colors rounded-xs"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Metric 3: Models Using */}
            <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-charcoal-500">Models Using</span>
                  <div className="w-7 h-7 rounded-xl bg-sandstone-200 text-charcoal-800 flex items-center justify-center text-xs font-mono font-bold">
                    CPU
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-charcoal-900 tracking-tight font-mono">
                  12 Active
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-charcoal-600 mt-1 font-mono">
                  <span>GPT-4o, Claude 3.5, Gemini</span>
                </div>
              </div>

              {/* Sparkline curve */}
              <div className="pt-3">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path
                    d="M0,22 Q20,20 40,16 T75,10 T100,3"
                    fill="none"
                    stroke="#8E6B2C"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,22 Q20,20 40,16 T75,10 T100,3 L100,25 L0,25 Z"
                    fill="url(#bronzeGrad)"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="bronzeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8E6B2C" />
                      <stop offset="100%" stopColor="#8E6B2C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Metric 4: Total Requests */}
            <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-charcoal-500">Total Requests</span>
                  <div className="w-7 h-7 rounded-xl bg-sandstone-200 text-charcoal-800 flex items-center justify-center text-xs font-mono font-bold">
                    REQ
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-charcoal-900 tracking-tight font-mono">
                  89,732
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-charcoal-600 mt-1 font-mono">
                  <TrendingUp className="w-3 h-3 text-osterdGold-600" />
                  <span>24.1% vs last month</span>
                </div>
              </div>

              {/* Sparkline curve */}
              <div className="pt-3">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path
                    d="M0,18 Q30,8 60,18 T90,5 T100,2"
                    fill="none"
                    stroke="#946A2C"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,18 Q30,8 60,18 T90,5 T100,2 L100,25 L0,25 Z"
                    fill="url(#goldGrad2)"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#946A2C" />
                      <stop offset="100%" stopColor="#946A2C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Metric 5: Error Rate */}
            <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-charcoal-500">Error Rate</span>
                  <div className="w-7 h-7 rounded-xl bg-sandstone-200 text-charcoal-800 flex items-center justify-center text-xs font-mono font-bold">
                    ERR
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-charcoal-900 tracking-tight font-mono">
                  0.02%
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1 font-mono">
                  <span>- 0.05% vs last month</span>
                </div>
              </div>

              {/* Sparkline curve */}
              <div className="pt-3">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path
                    d="M0,8 Q25,6 50,15 T75,20 T100,22"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,8 Q25,6 50,15 T75,20 T100,22 L100,25 L0,25 Z"
                    fill="url(#greenGrad)"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* ROW 2: SPEND INTELLIGENCE + REAL-TIME FAILOVER SIMULATOR     */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Col (8 cols): Interactive Spend Velocity & Failover Chart */}
            <div className="lg:col-span-8 flex flex-col">
              <SpendVelocityChart />
            </div>

            {/* Right Col (4 cols): Active Financial Firewall Card */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-charcoal-900 text-white shadow-xl flex flex-col justify-between relative overflow-hidden border border-charcoal-800">
              
              {/* Subtle Ambient Gold Vector Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle cx="150" cy="50" r="80" stroke="#C59E5F" strokeWidth="1.5" fill="none" />
                  <circle cx="150" cy="50" r="120" stroke="#C59E5F" strokeWidth="1" fill="none" strokeDasharray="6 6" />
                </svg>
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-charcoal-800 text-osterdGold-400 text-[10px] font-mono font-bold border border-charcoal-700">
                    <Shield className="w-3 h-3 text-osterdGold-400" />
                    <span>LOCAL FINANCIAL FIREWALL</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ARMED
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold tracking-tight text-zinc-100">
                    Velocity Hard Cap
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Guarantees infinite loop agent defense. If spend exceeds rate threshold, requests fall back to 100% free local Haiku or fail shut.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1C1C20] border border-charcoal-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Current Velocity:</span>
                    <span className="font-mono font-bold text-white">$0.04 / min</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Hard Kill Limit:</span>
                    <span className="font-mono font-bold text-osterdGold-400">$15.00 / hour</span>
                  </div>
                  <div className="w-full bg-charcoal-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-osterdGold-500 h-full rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-charcoal-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Daemon status:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">0 dropped frames</span>
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* ROW 3: HEATMAP + MODEL USAGE + ASSISTANT COPILOT            */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Heatmap Card (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">
                      Weekly Hourly Spend Heatmap
                    </h3>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Peak token usage across 7 days by operational time window.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-charcoal-400">UTC-7</span>
                </div>

                {/* Heatmap Grid */}
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-8 gap-1.5 text-center text-[10px] font-mono text-charcoal-400">
                    <span></span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>

                  {['12 AM', '6 AM', '12 PM', '6 PM', '11 PM'].map((slot, rowIdx) => (
                    <div key={slot} className="grid grid-cols-8 gap-1.5 items-center">
                      <span className="text-[10px] font-mono text-charcoal-400 text-right pr-1">
                        {slot}
                      </span>
                      {heatmapData[rowIdx].map((val, colIdx) => (
                        <div
                          key={colIdx}
                          className={`h-7 rounded-lg transition-transform hover:scale-105 cursor-pointer ${getHeatmapColor(val)}`}
                          title={`Intensity: ${Math.round(val * 100)}%`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Heatmap legend */}
              <div className="pt-4 border-t border-[#F0ECE4] flex items-center justify-between text-xs text-charcoal-500">
                <span>Low Activity</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-[#F4EFE6]" />
                  <div className="w-3 h-3 rounded bg-[#E8DFC8]" />
                  <div className="w-3 h-3 rounded bg-[#D6BA84]" />
                  <div className="w-3 h-3 rounded bg-[#C59E5F]" />
                  <div className="w-3 h-3 rounded bg-[#9C7938]" />
                </div>
                <span>Peak Load</span>
              </div>
            </div>

            {/* Top Models Distribution (3 cols) */}
            <div className="lg:col-span-3 p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">
                    Top Models By Cost
                  </h3>
                  <span className="text-xs text-charcoal-400">This Month</span>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Claude 3.7 Sonnet', share: '48%', cost: '$2,077.74', color: 'bg-osterdGold-600' },
                    { name: 'GPT-4o', share: '32%', cost: '$1,385.16', color: 'bg-charcoal-800' },
                    { name: 'Claude 3.5 Haiku', share: '12%', cost: '$519.43', color: 'bg-sandstone-300' },
                    { name: 'Gemini 1.5 Pro', share: '8%', cost: '$346.29', color: 'bg-zinc-400' },
                  ].map((m) => (
                    <div key={m.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-charcoal-800">{m.name}</span>
                        <span className="font-mono text-charcoal-900 font-bold">{m.share}</span>
                      </div>
                      <div className="w-full bg-[#EAE6DD] h-1.5 rounded-full overflow-hidden">
                        <div className={`${m.color} h-full rounded-full`} style={{ width: m.share }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0ECE4] text-[11px] text-charcoal-500">
                82% of workloads routed via cost-optimized fallbacks
              </div>
            </div>

            {/* Quick Copilot spend intelligence box (3 cols) */}
            <div className="lg:col-span-3 p-6 rounded-3xl bg-[#18181B] text-white border border-charcoal-800 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-osterdGold-400 font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>OPS COPILOT</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">READY</span>
                </div>

                <h4 className="text-sm font-bold text-zinc-100">
                  AI Cost Optimization Bot
                </h4>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  "Claude Sonnet spike detected on Agent-4. Rerouting 40% of non-code queries to Gemini 1.5 Flash would save $420/month."
                </p>

                <button
                  onClick={() => setAppliedRec((prev) => !prev)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    appliedRec
                      ? 'bg-emerald-600 text-white'
                      : 'bg-osterdGold-500 hover:bg-osterdGold-600 text-charcoal-950 shadow-xs'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{appliedRec ? 'Rule Applied to Gateway' : 'Apply Automated Reroute'}</span>
                </button>
              </div>

              {/* Chat Input */}
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (assistantInput.trim()) {
                      alert(`Ops Copilot Query: "${assistantInput}"\nAnalyzing telemetry metrics for active workspace...`);
                      setAssistantInput('');
                    }
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    placeholder="Ask anything about your proxy spend..."
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#242427] border border-zinc-700 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-osterdGold-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-osterdGold-400 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[10px] text-zinc-400 font-mono">
                  <span
                    onClick={() => setAssistantInput('Explain Sonnet spike')}
                    className="px-2 py-0.5 rounded-md bg-[#242427] hover:text-white cursor-pointer transition-colors shrink-0"
                  >
                    Explain spike
                  </span>
                  <span
                    onClick={() => setAssistantInput('Simulate haiku failover')}
                    className="px-2 py-0.5 rounded-md bg-[#242427] hover:text-white cursor-pointer transition-colors shrink-0"
                  >
                    Test failover
                  </span>
                </div>
              </div>

            </div>

          </div>
          </>
          )}
        </div>
      </main>
    </div>
  );
};
