import React, { useState } from 'react';
import {
  Crown,
  Terminal,
  Activity,
  ArrowRight,
  RotateCw,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight,
  Clock,
  Shield,
  Settings,
  Database,
  Sliders,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDaemonData } from '../lib/daemonClient';

interface DaemonServerViewProps {
  onNavigateTab?: (tab: string) => void;
  onOpenLogs?: () => void;
}

export const DaemonServerView: React.FC<DaemonServerViewProps> = ({
  onNavigateTab,
  onOpenLogs,
}) => {
  const {
    status,
    metrics,
    recentTraces,
    isRefreshing,
    restartDaemon,
    refreshNow,
  } = useDaemonData();

  const [activeConsoleModal, setActiveConsoleModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRestart = async () => {
    showToast('Restarting local daemon server...');
    await restartDaemon();
    showToast('Daemon server restarted successfully on port 8080');
  };

  return (
    <div className="w-full space-y-6 text-[#E6EDF3] font-sans antialiased">
      {/* Toast alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 right-8 z-50 bg-[#161D24] text-[#F3E2C4] px-4 py-2.5 rounded-xl border border-[#D4A359]/40 shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D4A359]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner Section */}
      <div className="relative rounded-[24px] border border-[#262F38] bg-[#0E1318] overflow-hidden shadow-2xl">
        {/* Background character & desk illustration */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-end">
          <div className="relative w-full md:w-[65%] h-full opacity-35 md:opacity-55 lg:opacity-75">
            <img
              src="/daemon_dashboard_ref.jpg"
              alt="Daemon Server Desk Illustration"
              className="w-full h-full object-cover object-right-top filter contrast-[1.05]"
            />
            {/* Smooth gradient blend into the dark left panel */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0E1318] via-[#0E1318]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1318] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E1318]/60 via-transparent to-transparent" />
          </div>
        </div>

        {/* Ambient warm golden glow behind hero text */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4A359]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content Grid */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 min-h-[340px]">
          {/* Left: Text & Action Buttons */}
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241C12]/90 border border-[#D4A359]/30 text-[#D4A359] text-[11px] font-bold tracking-wider uppercase backdrop-blur-xs">
              <Crown className="w-3.5 h-3.5 text-[#E6B466]" />
              <span>DAEMON SERVER</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-[1.15]">
              Your local daemon <br className="hidden sm:inline" />
              is running.
            </h1>

            <p className="text-sm sm:text-base text-[#9DAAB8] leading-relaxed max-w-lg">
              Ostra's daemon gives you local-first telemetry, real-time monitoring and full control over your LLM usage — right from your machine.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => setActiveConsoleModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D9A354] via-[#C99142] to-[#B88034] hover:from-[#E2AD5D] hover:to-[#C68D3F] text-[#0A0E12] text-xs sm:text-sm font-bold shadow-lg shadow-[#D4A359]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Open Daemon Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (onOpenLogs) onOpenLogs();
                  else if (onNavigateTab) onNavigateTab('logs');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141A21]/90 hover:bg-[#1C2530] border border-[#2D3845] text-[#C9D4E0] hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer backdrop-blur-xs"
              >
                <Terminal className="w-4 h-4 text-[#D4A359]" />
                <span>&gt;_ View Logs</span>
              </button>
            </div>
          </div>

          {/* Right: Floating Daemon Status Card */}
          <div className="w-full sm:w-auto lg:min-w-[280px] bg-[#10161C]/90 border border-[#26313C] backdrop-blur-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#212B36]">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#D4A359]" />
                <span className="text-xs font-bold text-white tracking-wide">Daemon Status</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0D2619] border border-[#166534]/50 text-[#4ADE80] text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                {status.online ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[#8E9CA9]">
                <span>Version</span>
                <span className="font-mono font-semibold text-white">{status.version}</span>
              </div>
              <div className="flex items-center justify-between text-[#8E9CA9]">
                <span>Uptime</span>
                <span className="font-mono font-semibold text-white">{metrics.uptimeFormatted}</span>
              </div>
              <div className="flex items-center justify-between text-[#8E9CA9]">
                <span>Local Port</span>
                <span className="font-mono font-semibold text-white">{status.port}</span>
              </div>
              <div className="flex items-center justify-between text-[#8E9CA9]">
                <span>Environment</span>
                <span className="font-medium text-white">{status.environment}</span>
              </div>
            </div>

            {/* Mini Sparkline Chart SVG */}
            <div className="pt-2">
              <svg className="w-full h-9 stroke-[#22C55E] fill-none" viewBox="0 0 100 24">
                <path
                  d="M0,18 Q15,8 30,14 T60,6 T85,15 T100,10"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Restart Daemon Button */}
            <button
              onClick={handleRestart}
              disabled={isRefreshing}
              className="w-full py-2 px-3 rounded-xl bg-[#161E27] hover:bg-[#1E2834] border border-[#2B3644] text-[#C4D0DC] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#D4A359] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Restarting...' : 'Restart Daemon'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Requests */}
        <div className="bg-[#0E1318] border border-[#222B35] hover:border-[#D4A359]/40 rounded-2xl p-5 shadow-lg transition-all space-y-3">
          <div className="flex items-center justify-between text-[#8B98A7]">
            <span className="text-xs font-semibold">Total Requests</span>
            <div className="w-7 h-7 rounded-lg bg-[#182029] border border-[#293441] flex items-center justify-center text-[#D4A359]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-white font-mono">
              {metrics.totalRequests.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[#22C55E] font-semibold">↑ 12%</span>
              <span className="text-[#788594]">vs. previous 24h</span>
            </div>
          </div>
          {/* Green Sparkline */}
          <svg className="w-full h-6 stroke-[#22C55E] fill-none" viewBox="0 0 100 20">
            <path d="M0,16 Q20,6 40,12 T70,5 T100,8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Card 2: Tokens Used */}
        <div className="bg-[#0E1318] border border-[#222B35] hover:border-[#D4A359]/40 rounded-2xl p-5 shadow-lg transition-all space-y-3">
          <div className="flex items-center justify-between text-[#8B98A7]">
            <span className="text-xs font-semibold">Tokens Used</span>
            <div className="w-7 h-7 rounded-lg bg-[#182029] border border-[#293441] flex items-center justify-center text-[#D4A359]">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-white font-mono">
              {(metrics.totalTokens / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[#22C55E] font-semibold">↑ 8%</span>
              <span className="text-[#788594]">vs. previous 24h</span>
            </div>
          </div>
          {/* Gold Sparkline */}
          <svg className="w-full h-6 stroke-[#D4A359] fill-none" viewBox="0 0 100 20">
            <path d="M0,14 Q25,18 50,8 T80,12 T100,6" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Card 3: Active Models */}
        <div className="bg-[#0E1318] border border-[#222B35] hover:border-[#D4A359]/40 rounded-2xl p-5 shadow-lg transition-all space-y-3">
          <div className="flex items-center justify-between text-[#8B98A7]">
            <span className="text-xs font-semibold">Active Models</span>
            <div className="w-7 h-7 rounded-lg bg-[#182029] border border-[#293441] flex items-center justify-center text-[#D4A359]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-white font-mono">
              {metrics.activeModelsCount} <span className="text-sm text-[#788594] font-normal">/ 8</span>
            </div>
            <div className="text-[11px] text-[#788594] font-medium">loaded</div>
          </div>
          {/* Yellow/Gold Sparkline */}
          <svg className="w-full h-6 stroke-[#EAB308] fill-none" viewBox="0 0 100 20">
            <path d="M0,15 Q30,4 60,11 T100,5" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Card 4: Avg. Latency */}
        <div className="bg-[#0E1318] border border-[#222B35] hover:border-[#D4A359]/40 rounded-2xl p-5 shadow-lg transition-all space-y-3">
          <div className="flex items-center justify-between text-[#8B98A7]">
            <span className="text-xs font-semibold">Avg. Latency</span>
            <div className="w-7 h-7 rounded-lg bg-[#182029] border border-[#293441] flex items-center justify-center text-[#D4A359]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-white font-mono">
              {metrics.avgDurationMs} <span className="text-sm font-normal text-[#8B98A7]">ms</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[#22C55E] font-semibold">↑ 18%</span>
              <span className="text-[#788594]">vs. previous 24h</span>
            </div>
          </div>
          {/* Green Sparkline */}
          <svg className="w-full h-6 stroke-[#22C55E] fill-none" viewBox="0 0 100 20">
            <path d="M0,18 Q20,10 40,15 T75,4 T100,12" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Bottom 3-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Recent Activity (5 cols) */}
        <div className="lg:col-span-5 bg-[#0E1318] border border-[#222B35] rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2732]">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="w-4 h-4 text-[#D4A359]" />
              <span>Recent Activity</span>
            </div>
            <button
              onClick={refreshNow}
              className="p-1 rounded-md text-[#788594] hover:text-[#D4A359] transition-colors cursor-pointer"
              title="Refresh live activity"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {recentTraces.slice(0, 5).map((trace) => (
              <div key={trace.id} className="flex items-start justify-between gap-3 text-xs group">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#161D24] border border-[#27323F] flex items-center justify-center shrink-0 mt-0.5">
                    {trace.status === 'failover' ? (
                      <RotateCw className="w-3.5 h-3.5 text-[#F59E0B]" />
                    ) : trace.model === 'health_check' ? (
                      <Shield className="w-3.5 h-3.5 text-[#3B82F6]" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white group-hover:text-[#D4A359] transition-colors">
                      {trace.status === 'failover'
                        ? 'Model switched (cost optimization)'
                        : trace.model === 'health_check'
                        ? 'Daemon health check'
                        : 'Request completed'}
                    </div>
                    <div className="text-[11px] text-[#7B8897] font-mono">
                      {trace.status === 'failover'
                        ? `${trace.model} → ${trace.failoverSibling || 'gemini-1.5-flash'}`
                        : trace.model === 'health_check'
                        ? 'All systems operational'
                        : `${trace.model} · ${trace.totalTokens} tokens · ${(trace.durationMs / 1000).toFixed(1)}s`}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-[#697685] shrink-0 font-mono">
                  {trace.relativeTime}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (onOpenLogs) onOpenLogs();
              else if (onNavigateTab) onNavigateTab('logs');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4A359] hover:text-[#E8BD77] transition-colors pt-2 cursor-pointer"
          >
            <span>View all activity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Column 2: Quick Actions (3 cols) */}
        <div className="lg:col-span-3 bg-[#0E1318] border border-[#222B35] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="text-sm font-bold text-white pb-3 border-b border-[#1E2732]">
            Quick Actions
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => {
                if (onOpenLogs) onOpenLogs();
                else if (onNavigateTab) onNavigateTab('logs');
              }}
              className="w-full p-3 rounded-xl bg-[#131920] hover:bg-[#1A222B] border border-[#242E3A] hover:border-[#D4A359]/40 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1A222B] flex items-center justify-center text-[#D4A359]">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#D4A359] transition-colors">View Logs</div>
                  <div className="text-[10px] text-[#788594]">Real-time daemon logs</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D6B7A] group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('integrations')}
              className="w-full p-3 rounded-xl bg-[#131920] hover:bg-[#1A222B] border border-[#242E3A] hover:border-[#D4A359]/40 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1A222B] flex items-center justify-center text-[#D4A359]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#D4A359] transition-colors">Manage Integrations</div>
                  <div className="text-[10px] text-[#788594]">Connect your providers</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D6B7A] group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('budgets')}
              className="w-full p-3 rounded-xl bg-[#131920] hover:bg-[#1A222B] border border-[#242E3A] hover:border-[#D4A359]/40 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1A222B] flex items-center justify-center text-[#D4A359]">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#D4A359] transition-colors">Configure Limits</div>
                  <div className="text-[10px] text-[#788594]">Set usage caps & alerts</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D6B7A] group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('settings')}
              className="w-full p-3 rounded-xl bg-[#131920] hover:bg-[#1A222B] border border-[#242E3A] hover:border-[#D4A359]/40 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1A222B] flex items-center justify-center text-[#D4A359]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#D4A359] transition-colors">System Settings</div>
                  <div className="text-[10px] text-[#788594]">Daemon preferences</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D6B7A] group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Column 3: Daemon Resources (4 cols) */}
        <div className="lg:col-span-4 bg-[#0E1318] border border-[#222B35] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="text-sm font-bold text-white pb-3 border-b border-[#1E2732]">
            Daemon Resources
          </div>

          {/* 3 Circular Rings Row */}
          <div className="grid grid-cols-3 gap-2 text-center py-2">
            {/* CPU */}
            <div className="space-y-1.5 flex flex-col items-center">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#212C37" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="3"
                    strokeDasharray="88"
                    strokeDashoffset={88 - (88 * metrics.cpuPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-white font-mono">{metrics.cpuPercent}%</span>
              </div>
              <div className="text-[10px] font-bold text-[#8E9CA9]">CPU</div>
              <div className="text-[9px] text-[#697685] font-mono">2.4 / 20%</div>
            </div>

            {/* Memory */}
            <div className="space-y-1.5 flex flex-col items-center">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#212C37" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#D4A359"
                    strokeWidth="3"
                    strokeDasharray="88"
                    strokeDashoffset={88 - (88 * 38) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-white font-mono">38%</span>
              </div>
              <div className="text-[10px] font-bold text-[#8E9CA9]">Memory</div>
              <div className="text-[9px] text-[#697685] font-mono">1.5 / 4.0 GB</div>
            </div>

            {/* Disk */}
            <div className="space-y-1.5 flex flex-col items-center">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#212C37" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeDasharray="88"
                    strokeDashoffset={88 - (88 * metrics.diskPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-white font-mono">{metrics.diskPercent}%</span>
              </div>
              <div className="text-[10px] font-bold text-[#8E9CA9]">Disk</div>
              <div className="text-[9px] text-[#697685] font-mono">5.2 / 25 GB</div>
            </div>
          </div>

          {/* Active Processes */}
          <div className="pt-2 space-y-2 border-t border-[#1E2732]">
            <div className="text-[11px] font-bold text-[#8E9CA9]">Active Processes</div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121820] text-[#8E9CA9]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span className="text-white font-medium">ostradaemon</span>
                </div>
                <div className="text-[10px] space-x-2">
                  <span>PID 2847</span>
                  <span className="text-[#22C55E]">CPU 2.1%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121820] text-[#8E9CA9]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span className="text-white font-medium">node</span>
                </div>
                <div className="text-[10px] space-x-2">
                  <span>PID 3121</span>
                  <span className="text-[#22C55E]">CPU 0.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="flex items-center justify-between text-[11px] text-[#6A7887] pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span>Ostra v1.0.0</span>
          <span>•</span>
          <span>Local execution. Global intelligence.</span>
        </div>
        <div className="flex items-center gap-1 text-[#D4A359]">
          <Crown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Modal: Interactive Daemon Console */}
      <AnimatePresence>
        {activeConsoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0F141A] border border-[#2D3845] rounded-2xl shadow-2xl overflow-hidden font-mono text-xs text-white"
            >
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#161D24] border-b border-[#283340]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#D4A359]" />
                  <span className="font-bold text-sm">OstraOps Guard Daemon Console</span>
                </div>
                <button
                  onClick={() => setActiveConsoleModal(false)}
                  className="px-2 py-1 rounded-md bg-[#242E3A] hover:bg-[#303D4C] text-[#9EAAB7] hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="text-[#22C55E]">
                  [✓] Daemon Gateway connected to http://127.0.0.1:8080 (PID 2847)
                </div>
                <div className="text-[#8E9CA9] space-y-1">
                  <div>- Ingress Proxy: http://127.0.0.1:8080/v1/chat/completions</div>
                  <div>- Anthropic Bridge: http://127.0.0.1:8080/v1/messages</div>
                  <div>- Telemetry Mode: SQLite WAL + In-Memory Circular Ring Buffer (1000 items)</div>
                  <div>- Financial Circuit Breaker: Velocity Cap $2.00/min | Session Cap $5.00</div>
                  <div>- Dynamic Intra-Family Cascade: Enabled (Sonnet -&gt; Haiku, GPT-4o -&gt; Mini)</div>
                </div>

                <div className="p-3 rounded-lg bg-[#070A0D] border border-[#242D37] text-[#D4A359] space-y-1">
                  <div className="font-bold"># Configure Cursor / Cline / AI Agent:</div>
                  <div className="text-white select-all">export OPENAI_BASE_URL="http://127.0.0.1:8080/v1"</div>
                  <div className="text-white select-all">export ANTHROPIC_BASE_URL="http://127.0.0.1:8080"</div>
                </div>
              </div>

              <div className="px-5 py-3 bg-[#131920] border-t border-[#242E3A] flex justify-end">
                <button
                  onClick={() => setActiveConsoleModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#D4A359] hover:bg-[#E5B56D] text-[#0B0F13] font-bold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
