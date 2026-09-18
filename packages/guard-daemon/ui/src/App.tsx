import React, { useReducer, useState, useEffect } from 'react';
import type { TraceRecord, AuthUser } from './types';
import { dashboardReducer, initialDashboardState } from './state/reducer';
import { useDaemonConnection } from './hooks/useDaemonConnection';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardOverview } from './components/DashboardOverview';
import { TasksPage } from './components/TasksPage';
import { CalendarPage } from './components/Calendar/CalendarPage';
import { AnalyticsView } from './components/AnalyticsView';
import { ModelsView } from './components/ModelsView';
import { AccountView } from './components/AccountView';
import { SettingsView } from './components/SettingsView';
import { BottomBar } from './components/BottomBar';
import { TraceDetailModal } from './components/TraceDetailModal';
import { AlertQueue } from './components/AlertQueue';
import { CommandPalette } from './components/CommandPalette';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

const DEFAULT_LOCAL_USER: AuthUser = {
  id: 'usr_local_dev',
  name: 'Local Developer',
  email: 'solo@osterdops.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const App: React.FC = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);
  const [selectedTrace, setSelectedTrace] = useState<TraceRecord | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Auth session: In local daemon mode, default to local workstation identity
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem('osterdops_user');
      return saved ? JSON.parse(saved) : DEFAULT_LOCAL_USER;
    } catch {
      return DEFAULT_LOCAL_USER;
    }
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { reconnect } = useDaemonConnection({ state, dispatch });

  // Global ⌘K / Ctrl+K hotkey for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global mouse position tracking for smooth custom green cursor follower
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('osterdops_user');
    setCurrentUser(DEFAULT_LOCAL_USER);
  };

  // 2. Authenticated: Render Full Dashboard Workspace
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-charcoal-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-[#0C2419] antialiased">
      <div className="flex flex-1">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            if (tab === 'auth' || tab === 'logout') {
              handleLogout();
            } else {
              setCurrentTab(tab);
            }
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar with Search & Profile */}
          <TopNav
            connectionState={state.connectionState}
            onRefresh={reconnect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNavigateTab={(tab) => {
              if (tab === 'auth' || tab === 'logout') {
                handleLogout();
              } else {
                setCurrentTab(tab);
              }
            }}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            placeholder={
              currentTab === 'models'
                ? 'Search models, providers, or capabilities...'
                : currentTab === 'calendar' || currentTab === 'tasks'
                ? 'Search tasks, deadlines, or budgets...'
                : 'Search analytics, projects, or metrics...'
            }
          />

          <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
            {/* Connection Error Banner (if any) */}
            {state.lastError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3.5 flex items-center justify-between text-xs text-rose-900 shadow-subtle">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{state.lastError}</span>
                </div>
                <button
                  onClick={reconnect}
                  className="flex items-center gap-1.5 font-bold text-rose-950 underline hover:no-underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Connection</span>
                </button>
              </div>
            )}

            {/* Dynamic System Alerts */}
            <AlertQueue
              alerts={state.alerts}
              onDismiss={(id) => dispatch({ type: 'DISMISS_ALERT', payload: id })}
              onClearAll={() => dispatch({ type: 'CLEAR_ALERTS' })}
            />

            {/* Tab Dispatch: Dashboard vs Models vs Calendar & Tasks vs Account vs Settings vs Analytics */}
            {currentTab === 'dashboard' ? (
              <DashboardOverview
                summary={state.summary}
                traces={state.traces}
                alerts={state.alerts}
                onSelectTrace={(t) => setSelectedTrace(t)}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            ) : currentTab === 'models' ? (
              <ModelsView />
            ) : currentTab === 'tasks' ? (
              <TasksPage onNavigateTab={(tab) => setCurrentTab(tab)} />
            ) : currentTab === 'calendar' ? (
              <CalendarPage />
            ) : currentTab === 'analytics' ? (
              <AnalyticsView
                summary={state.summary}
                traces={state.traces}
                onSelectTrace={(t) => setSelectedTrace(t)}
                onRefresh={reconnect}
              />
            ) : currentTab === 'account' ? (
              <AccountView />
            ) : currentTab === 'settings' ? (
              <SettingsView />
            ) : (
              /* Fallback view for other tabs */
              <div className="bg-white border border-[#EAE4D8] rounded-2xl p-12 text-center shadow-subtle space-y-4 max-w-lg mx-auto mt-12">
                <div className="w-12 h-12 rounded-2xl bg-[#E5F2EB] flex items-center justify-center text-[#0C2419] mx-auto">
                  <Sparkles className="w-6 h-6 text-emerald-800" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 capitalize">
                  {currentTab} Workspace
                </h3>
                <p className="text-xs text-charcoal-500">
                  Select any section from the sidebar to inspect telemetry, manage tasks, or configure guardrails.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0C2419] hover:bg-[#143B2A] text-white transition-all shadow-xs cursor-pointer"
                  >
                    View Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentTab('analytics')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F5] border border-[#EAE4D8] text-charcoal-700 hover:bg-[#F5F2EB] transition-all cursor-pointer"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Bottom Daemon Status Bar */}
          <BottomBar connectionState={state.connectionState} port={4040} />
        </div>
      </div>

      {/* Trace Inspector Modal */}
      {selectedTrace && (
        <TraceDetailModal
          trace={selectedTrace}
          onClose={() => setSelectedTrace(null)}
        />
      )}

      {/* Global ⌘K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
        onFilterProvider={(prov) => {
          setSearchQuery(prov);
          setCurrentTab('models');
        }}
        onReconnect={reconnect}
      />

      {/* Global Sleek Emerald Green Gradient Cursor Follower (Vivid Emerald Green) */}
      {mousePos && (
        <div
          className="fixed pointer-events-none z-[99999] select-none will-change-transform"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translate(-3px, -3px)',
          }}
        >
          <img
            src="/custom-cursor-emerald-32.png"
            alt="Pointer"
            className="w-7 h-7 filter drop-shadow-[0_2px_12px_rgba(16,185,129,0.85)]"
          />
        </div>
      )}
    </div>
  );
};

export default App;
