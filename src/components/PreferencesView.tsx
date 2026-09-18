import React, { useState } from 'react';
import {
  Sliders,
  LayoutDashboard,
  Bell,
  TrendingDown,
  Activity,
  Palette,
  CheckCircle2,
  Check
} from 'lucide-react';

export const PreferencesView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<
    'general' | 'dashboard' | 'notifications' | 'cost' | 'usage' | 'appearance'
  >('general');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. General Preferences State
  const [defaultLandingPage, setDefaultLandingPage] = useState('Dashboard');
  const [defaultDateRange, setDefaultDateRange] = useState('Last 7 days');
  const [timezone, setTimezone] = useState('Asia/Kolkata (GMT +05:30)');
  const [currency, setCurrency] = useState('USD ($)');
  const [language, setLanguage] = useState('English');

  // 2. Dashboard Preferences State
  const [showSpendOverview, setShowSpendOverview] = useState(true);
  const [showTokenUsage, setShowTokenUsage] = useState(true);
  const [showModelPerformance, setShowModelPerformance] = useState(true);
  const [showRecentAlerts, setShowRecentAlerts] = useState(true);
  const [showOptimizationOpportunities, setShowOptimizationOpportunities] = useState(true);
  const [defaultRefreshRate, setDefaultRefreshRate] = useState('30 seconds');
  const [defaultChartPeriod, setDefaultChartPeriod] = useState('7 days');

  // 3. Notifications Preferences State
  const [notifications, setNotifications] = useState([
    { id: 'spend', label: 'Spend threshold reached', email: true, inApp: true },
    { id: 'budget', label: 'Budget exceeded', email: true, inApp: true },
    { id: 'spike', label: 'Token spike detected', email: true, inApp: true },
    { id: 'failure', label: 'Model failure', email: false, inApp: true },
    { id: 'optimization', label: 'Optimization opportunity', email: true, inApp: true },
    { id: 'security', label: 'Security activity', email: true, inApp: true },
    { id: 'weekly', label: 'Weekly usage summary', email: true, inApp: false }
  ]);
  const [weeklyDigest, setWeeklyDigest] = useState('Every Monday');
  const [alertFrequency, setAlertFrequency] = useState<'realtime' | 'batching' | 'daily'>('batching');

  // 4. Cost & Optimization State
  const [optimizationMode, setOptimizationMode] = useState<'balanced' | 'cost_saver' | 'performance'>('balanced');
  const [showDowngradeRecs, setShowDowngradeRecs] = useState(true);
  const [showEstimatedSavings, setShowEstimatedSavings] = useState(true);
  const [suggestFallbacks, setSuggestFallbacks] = useState(true);
  const [savingsThreshold, setSavingsThreshold] = useState('10%');
  const [autoOptimization, setAutoOptimization] = useState(false);

  // 5. Usage & Tracking State
  const [tokenTracking, setTokenTracking] = useState(true);
  const [requestTracking, setRequestTracking] = useState(true);
  const [latencyTracking, setLatencyTracking] = useState(true);
  const [modelCostTracking, setModelCostTracking] = useState(true);
  const [traceContent, setTraceContent] = useState<'full' | 'metadata' | 'disabled'>('metadata');
  const [retentionPeriod, setRetentionPeriod] = useState('30 days');

  // 6. Appearance State
  const [theme, setTheme] = useState<'light' | 'system' | 'dark'>('system');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact');
  const [animations, setAnimations] = useState<'on' | 'reduced'>('on');
  const [chartMotion, setChartMotion] = useState<'on' | 'reduced'>('on');

  const handleSave = () => {
    showToast('Preferences successfully saved.');
  };

  const toggleNotification = (id: string, channel: 'email' | 'inApp') => {
    setNotifications(
      notifications.map((item) =>
        item.id === id ? { ...item, [channel]: !item[channel] } : item
      )
    );
  };

  const navCategories = [
    { id: 'general', label: 'General', icon: Sliders, desc: 'Workspace experience & localization' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Widgets layout & refresh interval' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alert matrix & digest delivery' },
    { id: 'cost', label: 'Cost & Optimization', icon: TrendingDown, desc: 'OsterdOps routing & savings mode' },
    { id: 'usage', label: 'Usage & Tracking', icon: Activity, desc: 'Telemetry collection & retention' },
    { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme, density & motion' }
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#EAE5DC] pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-[#F4EFE6] text-[#9C7938] border border-[#E5DBCA]">
            System Behavior & Display
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-charcoal-900 tracking-tight font-sans">
          Preferences
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1 font-sans">
          Customize how OsterdOps behaves, routes models, displays telemetry, and communicates with your engineering team.
        </p>
      </div>

      {/* Main Two-Column Layout: Left Settings Categories & Right Content Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Category Menu (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-[#EAE5DC] p-3 shadow-subtle space-y-1">
          {navCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full p-3 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'text-charcoal-700 hover:bg-[#FAF8F5] hover:text-charcoal-900'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isActive ? 'bg-white/10 text-[#C59E5F]' : 'bg-[#FAF8F5] text-charcoal-500 border border-[#EAE5DC]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold font-sans block leading-tight">
                    {cat.label}
                  </span>
                  <span
                    className={`text-[11px] block mt-0.5 leading-snug font-sans ${
                      isActive ? 'text-charcoal-300' : 'text-charcoal-400'
                    }`}
                  >
                    {cat.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Content Pane (8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle space-y-6">
          {/* ============================================================ */}
          {/* CATEGORY 1: GENERAL                                         */}
          {/* ============================================================ */}
          {activeCategory === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-[#EAE5DC] pb-4">
                <h2 className="text-base font-bold text-charcoal-900 font-sans">
                  General Preferences
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5 font-sans">
                  Configure default navigation routes, localization, and currency representations.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC]">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block font-sans">
                      Default Landing Page
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-sans">
                      The initial view displayed when opening the OsterdOps application.
                    </span>
                  </div>
                  <select
                    value={defaultLandingPage}
                    onChange={(e) => setDefaultLandingPage(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-sans text-charcoal-900 focus:outline-none focus:border-[#C59E5F] cursor-pointer"
                  >
                    <option>Dashboard</option>
                    <option>Projects</option>
                    <option>Usage & Costs</option>
                    <option>Reports</option>
                    <option>Integrations</option>
                    <option>Team</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC]">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block font-sans">
                      Default Date Range
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-sans">
                      Initial time frame applied to spend charts and latency telemetry.
                    </span>
                  </div>
                  <select
                    value={defaultDateRange}
                    onChange={(e) => setDefaultDateRange(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F] cursor-pointer"
                  >
                    <option>Today</option>
                    <option>Last 7 days</option>
                    <option>Last 14 days</option>
                    <option>Last 30 days</option>
                    <option>This Month</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC]">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block font-sans">
                      Timezone
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-sans">
                      Dates and timestamps across logs and audit events will display in this zone.
                    </span>
                  </div>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F] cursor-pointer"
                  >
                    <option>Asia/Kolkata (GMT +05:30)</option>
                    <option>UTC (GMT +00:00)</option>
                    <option>America/New_York (GMT -05:00)</option>
                    <option>America/Los_Angeles (GMT -08:00)</option>
                    <option>Europe/London (GMT +00:00)</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC]">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block font-sans">
                      Currency
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-sans">
                      Display currency for budget limits, estimated savings, and invoice breakdowns.
                    </span>
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F] cursor-pointer"
                  >
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>INR (₹)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block font-sans">
                      Language
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-sans">
                      Console interface language and system terminology.
                    </span>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-sans text-charcoal-900 focus:outline-none focus:border-[#C59E5F] cursor-pointer"
                  >
                    <option>English</option>
                    <option>Hindi (हिंदी)</option>
                    <option>German (Deutsch)</option>
                    <option>Japanese (日本語)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CATEGORY 2: DASHBOARD                                        */}
          {/* ============================================================ */}
          {activeCategory === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-[#EAE5DC] pb-4">
                <h2 className="text-base font-bold text-charcoal-900 font-sans">
                  Dashboard Preferences
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5 font-sans">
                  Customize visible overview widgets and background polling intervals without altering data pipelines.
                </p>
              </div>

              {/* Checkbox Layout Controls */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-charcoal-700 block uppercase font-mono tracking-wider">
                  Dashboard Layout
                </span>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-2.5 text-xs font-sans text-charcoal-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSpendOverview}
                      onChange={(e) => setShowSpendOverview(e.target.checked)}
                      className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                    />
                    <span>Show spend overview</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTokenUsage}
                      onChange={(e) => setShowTokenUsage(e.target.checked)}
                      className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                    />
                    <span>Show token usage</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showModelPerformance}
                      onChange={(e) => setShowModelPerformance(e.target.checked)}
                      className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                    />
                    <span>Show model performance</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRecentAlerts}
                      onChange={(e) => setShowRecentAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                    />
                    <span>Show recent alerts</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOptimizationOpportunities}
                      onChange={(e) => setShowOptimizationOpportunities(e.target.checked)}
                      className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                    />
                    <span>Show optimization opportunities</span>
                  </label>
                </div>
              </div>

              {/* Refresh rate & Chart period */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC]">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block font-sans">
                      Default Refresh Rate
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-sans">
                      Frequency of background metric synchronization.
                    </span>
                  </div>
                  <select
                    value={defaultRefreshRate}
                    onChange={(e) => setDefaultRefreshRate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F] cursor-pointer"
                  >
                    <option>10 seconds</option>
                    <option>30 seconds</option>
                    <option>1 minute</option>
                    <option>5 minutes</option>
                    <option>Manual only</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block font-sans">
                      Default Chart Period
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-sans">
                      Span of time rendered on dashboard line and area graphs.
                    </span>
                  </div>
                  <select
                    value={defaultChartPeriod}
                    onChange={(e) => setDefaultChartPeriod(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F] cursor-pointer"
                  >
                    <option>24 hours</option>
                    <option>7 days</option>
                    <option>30 days</option>
                    <option>90 days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CATEGORY 3: NOTIFICATIONS                                    */}
          {/* ============================================================ */}
          {activeCategory === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-[#EAE5DC] pb-4">
                <h2 className="text-base font-bold text-charcoal-900 font-sans">
                  Notification Matrix
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5 font-sans">
                  Choose which infrastructure alerts reach your email inbox versus remaining in the in-app notification tray.
                </p>
              </div>

              {/* Matrix Table */}
              <div className="border border-[#EAE5DC] rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#EAE5DC] text-[11px] font-mono text-charcoal-600">
                      <th className="py-2.5 px-4 font-bold">Notification Event</th>
                      <th className="py-2.5 px-4 text-center font-bold w-24">Email</th>
                      <th className="py-2.5 px-4 text-center font-bold w-24">In-app</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5DC]">
                    {notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="py-3 px-4 text-charcoal-900 font-medium">{n.label}</td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={n.email}
                            onChange={() => toggleNotification(n.id, 'email')}
                            className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={n.inApp}
                            onChange={() => toggleNotification(n.id, 'inApp')}
                            className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Weekly Digest & Alert Frequency */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC]">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block font-sans">
                      Weekly Digest
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-sans">
                      Comprehensive summary email covering team spend, token consumption, and anomalies.
                    </span>
                  </div>
                  <select
                    value={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-sans text-charcoal-900 focus:outline-none focus:border-[#C59E5F] cursor-pointer"
                  >
                    <option>Every Monday</option>
                    <option>Every Friday</option>
                    <option>Disabled</option>
                  </select>
                </div>

                <div>
                  <span className="text-xs font-bold text-charcoal-900 block font-sans mb-1">
                    Alert Frequency
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {[
                      { id: 'realtime', title: 'Real-time', desc: 'Dispatch immediately as events trigger.' },
                      { id: 'batching', title: 'Smart Batching', desc: 'Group related spikes into hourly digests.' },
                      { id: 'daily', title: 'Daily Summary', desc: 'Single roll-up delivered once every 24 hours.' }
                    ].map((af) => (
                      <div
                        key={af.id}
                        onClick={() => setAlertFrequency(af.id as any)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          alertFrequency === af.id
                            ? 'bg-[#F4EFE6] border-[#E5DBCA] text-charcoal-900 shadow-2xs'
                            : 'bg-[#FAF8F5] border-[#EAE5DC] text-charcoal-600 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                              alertFrequency === af.id ? 'border-[#C59E5F] bg-[#C59E5F]' : 'border-charcoal-300'
                            }`}
                          >
                            {alertFrequency === af.id && <span className="w-1 h-1 rounded-full bg-white" />}
                          </span>
                          <span className="text-xs font-bold font-sans">{af.title}</span>
                        </div>
                        <p className="text-[11px] text-charcoal-500 font-sans">{af.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CATEGORY 4: COST & OPTIMIZATION                              */}
          {/* ============================================================ */}
          {activeCategory === 'cost' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-[#EAE5DC] pb-4">
                <h2 className="text-base font-bold text-charcoal-900 font-sans">
                  Cost & Optimization Preferences
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5 font-sans">
                  Govern OsterdOps smart routing heuristics, downgrade recommendations, and fallback policies.
                </p>
              </div>

              {/* Optimization Mode Radio Cards */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-charcoal-700 block uppercase font-mono tracking-wider">
                  Optimization Mode
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'balanced',
                      title: 'Balanced',
                      desc: 'Balance cost, latency, and model quality dynamically across requests.'
                    },
                    {
                      id: 'cost_saver',
                      title: 'Cost Saver',
                      desc: 'Prioritize the lowest-cost compatible model family for each request.'
                    },
                    {
                      id: 'performance',
                      title: 'Performance',
                      desc: 'Prioritize raw model quality, benchmark accuracy, and minimal TTFT latency.'
                    }
                  ].map((mode) => (
                    <div
                      key={mode.id}
                      onClick={() => setOptimizationMode(mode.id as any)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        optimizationMode === mode.id
                          ? 'bg-[#F4EFE6] border-[#E5DBCA] text-charcoal-900 shadow-2xs'
                          : 'bg-[#FAF8F5] border-[#EAE5DC] text-charcoal-600 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              optimizationMode === mode.id ? 'border-[#C59E5F] bg-[#C59E5F]' : 'border-charcoal-300'
                            }`}
                          >
                            {optimizationMode === mode.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <span className="text-xs font-bold font-sans">{mode.title}</span>
                        </div>
                        <p className="text-[11px] text-charcoal-500 font-sans leading-relaxed">
                          {mode.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimization Suggestions Checkboxes */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-charcoal-700 block uppercase font-mono tracking-wider">
                  Optimization Suggestions
                </span>
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-2.5 text-xs font-sans text-charcoal-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDowngradeRecs}
                      onChange={(e) => setShowDowngradeRecs(e.target.checked)}
                      className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                    />
                    <span>Show model downgrade recommendations</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showEstimatedSavings}
                      onChange={(e) => setShowEstimatedSavings(e.target.checked)}
                      className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                    />
                    <span>Show estimated savings</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={suggestFallbacks}
                      onChange={(e) => setSuggestFallbacks(e.target.checked)}
                      className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                    />
                    <span>Suggest fallback models</span>
                  </label>
                </div>
              </div>

              {/* Threshold & Auto-Optimization Toggle */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC]">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block font-sans">
                      Minimum Savings Threshold
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-sans">
                      Only suggest model changes when predicted savings exceed this percentage.
                    </span>
                  </div>
                  <select
                    value={savingsThreshold}
                    onChange={(e) => setSavingsThreshold(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F] cursor-pointer"
                  >
                    <option>5%</option>
                    <option>10%</option>
                    <option>15%</option>
                    <option>20%</option>
                    <option>25%</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block font-sans">
                      Auto-Optimization
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-sans">
                      Automatically reroute requests to cheaper equivalent models during downstream provider surges.
                    </span>
                    <span className="text-[10px] text-charcoal-400 font-mono block mt-0.5">
                      Recommendation: Keep OFF by default. Recommendations are safer than silently changing models.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setAutoOptimization(!autoOptimization);
                      showToast(autoOptimization ? 'Auto-optimization turned OFF' : 'Auto-optimization turned ON');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      autoOptimization
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white border border-[#EAE5DC] text-charcoal-700 hover:bg-sandstone-100'
                    }`}
                  >
                    {autoOptimization ? 'ENABLED' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CATEGORY 5: USAGE & TRACKING                                 */}
          {/* ============================================================ */}
          {activeCategory === 'usage' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-[#EAE5DC] pb-4">
                <h2 className="text-base font-bold text-charcoal-900 font-sans">
                  Usage & Telemetry Preferences
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5 font-sans">
                  Configure real-time metric counters, trace retention duration, and telemetry detail levels.
                </p>
              </div>

              {/* 4 Telemetry Preferences Switches */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-charcoal-700 block uppercase font-mono tracking-wider">
                  Telemetry Preferences
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-charcoal-900 block font-sans">Token Tracking</span>
                      <span className="text-[11px] text-charcoal-500 font-sans">Count prompt & completion tokens</span>
                    </div>
                    <button
                      onClick={() => setTokenTracking(!tokenTracking)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        tokenTracking ? 'bg-[#18181B] text-white' : 'bg-white border border-[#EAE5DC] text-charcoal-600'
                      }`}
                    >
                      {tokenTracking ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-charcoal-900 block font-sans">Request Tracking</span>
                      <span className="text-[11px] text-charcoal-500 font-sans">Log throughput & RPS volume</span>
                    </div>
                    <button
                      onClick={() => setRequestTracking(!requestTracking)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        requestTracking ? 'bg-[#18181B] text-white' : 'bg-white border border-[#EAE5DC] text-charcoal-600'
                      }`}
                    >
                      {requestTracking ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-charcoal-900 block font-sans">Latency Tracking</span>
                      <span className="text-[11px] text-charcoal-500 font-sans">Track TTFT and total duration</span>
                    </div>
                    <button
                      onClick={() => setLatencyTracking(!latencyTracking)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        latencyTracking ? 'bg-[#18181B] text-white' : 'bg-white border border-[#EAE5DC] text-charcoal-600'
                      }`}
                    >
                      {latencyTracking ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-charcoal-900 block font-sans">Model Cost Tracking</span>
                      <span className="text-[11px] text-charcoal-500 font-sans">Real-time inference spend tally</span>
                    </div>
                    <button
                      onClick={() => setModelCostTracking(!modelCostTracking)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        modelCostTracking ? 'bg-[#18181B] text-white' : 'bg-white border border-[#EAE5DC] text-charcoal-600'
                      }`}
                    >
                      {modelCostTracking ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Trace Content Radio */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-charcoal-700 block uppercase font-mono tracking-wider">
                  Trace Content
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'full', title: 'Full', desc: 'Record complete request & response payloads.' },
                    { id: 'metadata', title: 'Metadata Only', desc: 'Record model name, tokens, and duration only.' },
                    { id: 'disabled', title: 'Disabled', desc: 'Zero trace storage. Pure stream passthrough.' }
                  ].map((tc) => (
                    <div
                      key={tc.id}
                      onClick={() => setTraceContent(tc.id as any)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        traceContent === tc.id
                          ? 'bg-[#F4EFE6] border-[#E5DBCA] text-charcoal-900 shadow-2xs'
                          : 'bg-[#FAF8F5] border-[#EAE5DC] text-charcoal-600 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                            traceContent === tc.id ? 'border-[#C59E5F] bg-[#C59E5F]' : 'border-charcoal-300'
                          }`}
                        >
                          {traceContent === tc.id && <span className="w-1 h-1 rounded-full bg-white" />}
                        </span>
                        <span className="text-xs font-bold font-sans">{tc.title}</span>
                      </div>
                      <p className="text-[11px] text-charcoal-500 font-sans">{tc.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retention */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <span className="text-xs font-bold text-charcoal-900 block font-sans">
                    Retention
                  </span>
                  <span className="text-[11px] text-charcoal-500 font-sans">
                    Automatically purge older traces and token metrics after the retention period.
                  </span>
                </div>
                <select
                  value={retentionPeriod}
                  onChange={(e) => setRetentionPeriod(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F] cursor-pointer"
                >
                  <option>7 days</option>
                  <option>14 days</option>
                  <option>30 days</option>
                  <option>90 days</option>
                </select>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CATEGORY 6: APPEARANCE                                       */}
          {/* ============================================================ */}
          {activeCategory === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-[#EAE5DC] pb-4">
                <h2 className="text-base font-bold text-charcoal-900 font-sans">
                  Appearance
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5 font-sans">
                  Adjust visual density, system color modes, and rendering motion.
                </p>
              </div>

              {/* Theme Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-charcoal-700 block uppercase font-mono tracking-wider">
                  Theme
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light' },
                    { id: 'system', label: 'System' },
                    { id: 'dark', label: 'Dark' }
                  ].map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th.id as any)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-sans font-bold transition-all cursor-pointer ${
                        theme === th.id
                          ? 'bg-[#18181B] text-white border-[#18181B] shadow-2xs'
                          : 'bg-[#FAF8F5] border-[#EAE5DC] text-charcoal-700 hover:bg-white'
                      }`}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dashboard Density */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-charcoal-700 block uppercase font-mono tracking-wider">
                  Dashboard Density
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'comfortable', label: 'Comfortable', desc: 'Spacious padding & larger charts' },
                    { id: 'compact', label: 'Compact', desc: 'Higher information density & condensed tables' }
                  ].map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setDensity(d.id as any)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        density === d.id
                          ? 'bg-[#F4EFE6] border-[#E5DBCA] text-charcoal-900 shadow-2xs'
                          : 'bg-[#FAF8F5] border-[#EAE5DC] text-charcoal-600 hover:bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold font-sans block">{d.label}</span>
                      <span className="text-[11px] text-charcoal-500 font-sans block mt-0.5">{d.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motion & Chart Animations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-charcoal-700 block uppercase font-mono tracking-wider">
                    Interface Animations
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAnimations('on')}
                      className={`flex-1 py-2 rounded-xl text-xs font-sans font-bold border transition-all ${
                        animations === 'on'
                          ? 'bg-[#18181B] text-white border-[#18181B]'
                          : 'bg-[#FAF8F5] border-[#EAE5DC] text-charcoal-700'
                      }`}
                    >
                      On
                    </button>
                    <button
                      onClick={() => setAnimations('reduced')}
                      className={`flex-1 py-2 rounded-xl text-xs font-sans font-bold border transition-all ${
                        animations === 'reduced'
                          ? 'bg-[#18181B] text-white border-[#18181B]'
                          : 'bg-[#FAF8F5] border-[#EAE5DC] text-charcoal-700'
                      }`}
                    >
                      Reduced
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-charcoal-700 block uppercase font-mono tracking-wider">
                    Chart Motion
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChartMotion('on')}
                      className={`flex-1 py-2 rounded-xl text-xs font-sans font-bold border transition-all ${
                        chartMotion === 'on'
                          ? 'bg-[#18181B] text-white border-[#18181B]'
                          : 'bg-[#FAF8F5] border-[#EAE5DC] text-charcoal-700'
                      }`}
                    >
                      On
                    </button>
                    <button
                      onClick={() => setChartMotion('reduced')}
                      className={`flex-1 py-2 rounded-xl text-xs font-sans font-bold border transition-all ${
                        chartMotion === 'reduced'
                          ? 'bg-[#18181B] text-white border-[#18181B]'
                          : 'bg-[#FAF8F5] border-[#EAE5DC] text-charcoal-700'
                      }`}
                    >
                      Reduced
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* BOTTOM ACTIONS BAR                                           */}
          {/* ============================================================ */}
          <div className="pt-4 border-t border-[#EAE5DC] flex items-center justify-between">
            <span className="text-[11px] font-mono text-charcoal-400">
              Preferences are synced to your organization account.
            </span>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-[#C59E5F]" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
