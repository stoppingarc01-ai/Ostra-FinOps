import React, { useState } from 'react';
import { 
  Zap, 
  Check, 
  Send,
  Shield,
  ArrowUpRight,
  TrendingDown,
  LayoutDashboard,
  Wallet,
  Cpu,
  Cable,
  FolderKanban,
  FileText,
  TrendingUp,
  CreditCard,
  Settings,
  Search,
  Bell,
  ChevronRight
} from 'lucide-react';

interface HeroDashboard3DProps {
  standaloneWindow?: boolean;
  onNavigatePricing?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const HeroDashboard3D: React.FC<HeroDashboard3DProps> = ({
  standaloneWindow = true,
  onNavigatePricing,
  onNavigateTab,
}) => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D'>('24H');
  const [rerouteApplied, setRerouteApplied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [copilotMessage, setCopilotMessage] = useState(
    'Claude Sonnet spike detected on Agent-4. Rerouting 40% of non-code queries to Gemini 1.5 Flash would save $420/month.'
  );
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const handleApplyReroute = () => {
    setRerouteApplied(true);
    setCopilotMessage('Automated reroute activated. Non-code agent traffic successfully redirected to Gemini 1.5 Flash (Rate saved: $420/mo).');
  };

  const handlePromptTag = (prompt: string) => {
    setChatInput(prompt);
    if (prompt === 'Explain spike') {
      setCopilotMessage('Agent-4 triggered 84 recursive token calls in 45s during an unconstrained web search loop. Hard spend breaker halted loop.');
    } else if (prompt === 'Test failover') {
      setCopilotMessage('Simulating upstream timeout on primary model... Fallback to Claude 3.5 Haiku executed in 1.4ms with 0 dropped frames.');
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setCopilotMessage(`Telemetry analysis for "${chatInput}": All systems nominal. Gateway proxy overhead stable at ~1.1ms.`);
    setChatInput('');
  };

  // Node coordinates for the interactive curve
  const chartNodes = [
    { time: '00:00', x: 35, yControlled: 184, yUnmanaged: 184, managed: '$0', unmanaged: '$0' },
    { time: '03:00', x: 95, yControlled: 178, yUnmanaged: 176, managed: '$140', unmanaged: '$190' },
    { time: '06:00', x: 155, yControlled: 172, yUnmanaged: 164, managed: '$320', unmanaged: '$490' },
    { time: '09:00', x: 220, yControlled: 164, yUnmanaged: 144, managed: '$580', unmanaged: '$980' },
    { time: '12:00', x: 285, yControlled: 154, yUnmanaged: 118, managed: '$940', unmanaged: '$1,620' },
    { time: '14:30', x: 350, yControlled: 148, yUnmanaged: 92, managed: '$1,180', unmanaged: '$2,340' },
    { time: '17:00', x: 415, yControlled: 142, yUnmanaged: 76, managed: '$1,380', unmanaged: '$2,860' },
    { time: '20:00', x: 480, yControlled: 136, yUnmanaged: 64, managed: '$1,540', unmanaged: '$3,240' },
    { time: 'Now', x: 550, yControlled: 132, yUnmanaged: 54, managed: '$1,620', unmanaged: '$3,580' },
  ];

  // Heatmap rows
  const heatmapHours = ['12 AM', '6 AM', '12 PM', '6 PM', '11 PM'];
  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Heatmap intensity matrix matching the screenshot exactly
  const heatmapMatrix = [
    [0.08, 0.08, 0.25, 0.25, 0.25, 0.25, 0.08],
    [0.35, 0.35, 0.35, 0.45, 0.65, 0.35, 0.08],
    [0.45, 0.85, 0.95, 0.95, 0.95, 0.45, 0.25],
    [0.55, 0.85, 0.95, 0.55, 0.65, 0.45, 0.25],
    [0.12, 0.12, 0.25, 0.35, 0.35, 0.12, 0.08],
  ];

  const getTileStyle = (val: number) => {
    if (val >= 0.8) return 'bg-[#E5C38D] text-[#07090C] border-[#E5C38D] shadow-[0_0_12px_rgba(229,195,141,0.35)]';
    if (val >= 0.5) return 'bg-[#C59E5F]/75 border-[#C59E5F]/85 text-zinc-100';
    if (val >= 0.3) return 'bg-[#9C7938]/45 border-[#9C7938]/60 text-zinc-300';
    if (val >= 0.15) return 'bg-white/[0.07] border-white/[0.1] text-zinc-400';
    return 'bg-white/[0.025] border-white/[0.05] text-zinc-600';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'spend', label: 'Spend', icon: Wallet },
    { id: 'models', label: 'Models', icon: Cpu },
    { id: 'integrations', label: 'Integrations', icon: Cable },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Core Cockpit Content (5 KPI Cards + Charts + Heatmap + Top Models + Ops Copilot)
  const cockpitContent = (
    <div className="space-y-4">
      {/* ============================================================ */}
      {/* ROW 1: 5 TOP METRIC CARDS                                    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        
        {/* Card 1: Total Spend (This Month) */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#C59E5F]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">Total Spend (This Month)</span>
              <span className="w-5 h-5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-zinc-400 font-bold flex items-center justify-center">
                $
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              $4,328.64
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span>22.4% vs last month</span>
            </span>

            {/* Sparkline Wave */}
            <svg className="w-16 h-5 overflow-visible" viewBox="0 0 60 20" fill="none">
              <path
                d="M 0,16 C 15,16 28,19 40,11 C 48,6 54,4 60,1"
                stroke="#C59E5F"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Tokens Used */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#C59E5F]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">Tokens Used</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-mono text-zinc-400 font-bold">
                TOK
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              312.6M
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#E5C38D]" />
              <span>12.2% vs last month</span>
            </span>

            {/* Segmented Mini Blocks / Audio Equalizer */}
            <div className="flex items-center gap-0.5">
              {[0.2, 0.25, 0.3, 0.4, 0.45, 0.55, 0.65, 0.75, 0.9, 1].map((op, i) => (
                <div
                  key={i}
                  className="w-1 rounded-xs bg-[#C59E5F]"
                  style={{ height: `${(i + 2) * 1.5}px`, opacity: op }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Models Using */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#C59E5F]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">Models Using</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-mono text-zinc-300 font-bold">
                CPU
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              12 Active
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[80px]">
              GPT-4o, Claude 3...
            </span>

            {/* Sparkline curve */}
            <svg className="w-16 h-5 overflow-visible" viewBox="0 0 60 20" fill="none">
              <path
                d="M 0,18 C 15,18 30,16 42,9 C 50,4 55,2 60,1"
                stroke="#C59E5F"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Total Requests */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#C59E5F]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">Total Requests</span>
              <span className="w-5 h-5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-zinc-400 font-bold flex items-center justify-center">
                req
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              89,732
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#E5C38D]" />
              <span>24.1% vs last month</span>
            </span>

            {/* Peak curve */}
            <svg className="w-16 h-5 overflow-visible" viewBox="0 0 60 20" fill="none">
              <path
                d="M 0,16 Q 20,15 35,4 Q 45,1 60,12"
                stroke="#E5C38D"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 5: Error Rate */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#C59E5F]/40 transition-colors col-span-2 sm:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">Error Rate</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-mono text-zinc-400 font-bold">
                ERR
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              0.02%
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingDown className="w-3 h-3 text-emerald-400" />
              <span>6.8% vs last month</span>
            </span>

            {/* Green flat/declining curve */}
            <svg className="w-16 h-5 overflow-visible" viewBox="0 0 60 20" fill="none">
              <path
                d="M 0,5 Q 25,6 40,14 T 60,16"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* ROW 2: SPEND VELOCITY (8 cols) + VELOCITY HARD CAP (4 cols)  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        
        {/* Spend Velocity & Intra-Family Failover Card (8 cols) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between relative overflow-hidden">
          
          {/* Header Controls */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                  Spend Velocity &amp; Intra-Family Failover
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
                  • Active Protection
                </span>
              </div>

              {/* Timeframe & Proxy Status */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 rounded-lg bg-[#07090C] border border-white/[0.08] text-[10px] font-mono">
                  {(['24H', '7D', '30D'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        timeframe === t
                          ? 'bg-[#C59E5F] text-[#07090C] font-bold shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="px-2 py-1 rounded-lg bg-[#07090C] border border-white/[0.08] text-[10px] font-mono text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>PROXY 127.0.0.1:8080</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 mb-5">
              Live token expenditure, showing actual spend vs. unmanaged run-rate.
            </p>

            {/* Stat readout row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 rounded-2xl bg-[#07090C] border border-white/[0.06] mb-5">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">CURRENT MANAGED SPEND</div>
                <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                  $1,620 <span className="text-emerald-400 text-xs font-normal">Controlled</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">UNMANAGED RUN-RATE</div>
                <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">$3,580</div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">CIRCUIT BREAKER SAVINGS</div>
                <div className="text-base sm:text-lg font-bold text-[#E5C38D] font-mono mt-0.5 flex items-center gap-1.5">
                  <span>$1,960</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    -55%
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">ACTIVE ROUTING MODEL</div>
                <div className="text-xs sm:text-sm font-bold text-white font-mono mt-1 flex items-center gap-1">
                  <span className="text-[#C59E5F]">⚡</span>
                  <span>Claude 3.5 Haiku</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic SVG Interactive Chart Canvas */}
          <div className="relative w-full h-[220px] select-none">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 210" preserveAspectRatio="none">
              <defs>
                <linearGradient id="deltaZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.22" />
                  <stop offset="70%" stopColor="#C59E5F" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#C59E5F" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="goldLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C59E5F" />
                  <stop offset="100%" stopColor="#E5C38D" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines & Y-Axis */}
              {[
                { y: 40, label: '$4.5k' },
                { y: 88, label: '$3.0k' },
                { y: 136, label: '$1.5k' },
                { y: 184, label: '$0' },
              ].map((g, i) => (
                <g key={i}>
                  <line
                    x1="35"
                    y1={g.y}
                    x2="590"
                    y2={g.y}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="25"
                    y={g.y + 3.5}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-zinc-500"
                  >
                    {g.label}
                  </text>
                </g>
              ))}

              {/* Failover Event Indicator Line at 14:30 */}
              <line
                x1="350"
                y1="30"
                x2="350"
                y2="184"
                stroke="#C59E5F"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.65"
              />

              {/* Protected Delta Zone (Polygon between curves) */}
              <path
                d="M 35,184 L 95,176 L 155,164 L 220,144 L 285,118 L 350,92 L 415,76 L 480,64 L 550,54 L 550,132 L 480,136 L 415,142 L 350,148 L 285,154 L 220,164 L 155,172 L 95,178 L 35,184 Z"
                fill="url(#deltaZoneGrad)"
              />

              {/* Base Unmanaged Spend (Upper Greenish Dashed Line) */}
              <path
                d="M 35,184 L 95,176 L 155,164 L 220,144 L 285,118 L 350,92 L 415,76 L 480,64 L 550,54"
                fill="none"
                stroke="#34D399"
                strokeWidth="1.8"
                strokeDasharray="5 5"
                opacity="0.8"
              />

              {/* Controlled Run-Rate (Lower Solid Warm Gold Line) */}
              <path
                d="M 35,184 L 95,178 L 155,172 L 220,164 L 285,154 L 350,148 L 415,142 L 480,136 L 550,132"
                fill="none"
                stroke="url(#goldLineGrad)"
                strokeWidth="2.6"
                strokeLinecap="round"
              />

              {/* Interactive Clickable/Hoverable Nodes on Controlled Line */}
              {chartNodes.map((node, i) => {
                const isHovered = hoveredNode === i;
                return (
                  <g
                    key={node.time}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode(i)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.yControlled}
                      r={isHovered ? 6 : 4}
                      fill="#E5C38D"
                      stroke="#07090C"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip on Hover */}
            {hoveredNode !== null && (
              <div 
                className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-[#0B0E14] border border-[#C59E5F] text-[10.5px] font-mono text-white shadow-2xl -translate-x-1/2 -translate-y-12"
                style={{ left: `${(chartNodes[hoveredNode].x / 600) * 100}%`, top: `${chartNodes[hoveredNode].yControlled - 40}px` }}
              >
                <span className="text-[#E5C38D] font-bold">{chartNodes[hoveredNode].time}</span> • Managed: {chartNodes[hoveredNode].managed} vs Unmanaged: {chartNodes[hoveredNode].unmanaged}
              </div>
            )}

            {/* X-Axis Timestamps */}
            <div className="flex justify-between text-[9.5px] font-mono text-zinc-500 mt-2 px-6">
              {chartNodes.map((n, i) => (
                <span
                  key={n.time}
                  onMouseEnter={() => setHoveredNode(i)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`cursor-pointer transition-colors ${
                    hoveredNode === i ? 'text-[#E5C38D] font-bold' : 'hover:text-zinc-300'
                  }`}
                >
                  {n.time}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Legend Row matching the screenshot */}
          <div className="mt-5 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[#C59E5F] rounded-full" />
                <span className="text-zinc-300 font-semibold">Controlled Run-Rate (OstraOps)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 border-t border-dashed border-[#34D399]" />
                <span className="text-zinc-400">Base Unmanaged Spend</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/25 border border-emerald-500/40" />
                <span className="text-zinc-400">Protected Delta Zone</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
              <span className="text-zinc-400 text-[11px]">Protected Savings:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                $1,960
              </span>
            </div>
          </div>

        </div>

        {/* Velocity Hard Cap Card (4 cols) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col justify-between">
          
          {/* Background Radar / Orbit Golden Rings */}
          <div className="absolute right-[-40px] top-[140px] w-[260px] h-[260px] pointer-events-none opacity-20">
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" stroke="#C59E5F" strokeWidth="1" strokeDasharray="4 4" fill="none" />
              <circle cx="100" cy="100" r="65" stroke="#C59E5F" strokeWidth="1" fill="none" />
              <circle cx="100" cy="100" r="40" stroke="#C59E5F" strokeWidth="1" strokeDasharray="3 3" fill="none" />
              <circle cx="100" cy="100" r="6" fill="#C59E5F" />
            </svg>
          </div>

          <div className="relative z-10 space-y-4">
            
            {/* Header Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-[#C59E5F]" />
                <span>LOCAL FINANCIAL GATEWAY</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ARMED</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white font-sans tracking-tight">
                Velocity Hard Cap
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Guarantees infinite loop agent defense. If spend exceeds rate threshold, requests fall back to 100% free local Haiku or fail shut.
              </p>
            </div>

            {/* Inset Velocity Box */}
            <div className="p-3.5 rounded-2xl bg-[#07090C] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 text-[11px]">Current Velocity:</span>
                <span className="font-bold text-white">$0.04 / min</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 text-[11px]">Hard Kill Limit:</span>
                <span className="font-bold text-white">$15.00 / hour</span>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] h-full rounded-full" style={{ width: '16%' }} />
              </div>
            </div>

          </div>

          {/* Daemon Status Footer */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 text-[11px]">Daemon status:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>0 dropped frames</span>
            </span>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* ROW 3: HEATMAP + TOP MODELS + OPS COPILOT (3 cols)          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
        
        {/* Col 1: Weekly Hourly Spend Heatmap */}
        <div className="p-5 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs sm:text-sm font-bold text-white font-sans">
                Weekly Hourly Spend Heatmap
              </h4>
              <span className="text-[9.5px] font-mono text-zinc-500">UTC ▾</span>
            </div>
            <p className="text-[10.5px] text-zinc-400 mb-4">
              Peak token usage across 7 days by operational time window.
            </p>

            {/* Heatmap Grid */}
            <div className="space-y-1.5">
              {/* Column header days */}
              <div className="grid grid-cols-8 gap-1 text-[9px] font-mono text-zinc-500 text-center pl-7">
                {heatmapDays.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              {/* Heatmap Rows */}
              {heatmapHours.map((hour, rowIdx) => (
                <div key={hour} className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-zinc-500 w-7 text-right shrink-0">
                    {hour}
                  </span>
                  <div className="grid grid-cols-7 gap-1 flex-1">
                    {heatmapMatrix[rowIdx].map((val, colIdx) => (
                      <div
                        key={colIdx}
                        className={`h-5 sm:h-6 rounded-md border transition-all duration-150 hover:scale-105 cursor-pointer ${getTileStyle(val)}`}
                        title={`${heatmapDays[colIdx]} ${hour}: ${Math.round(val * 100)}% peak activity`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Low Activity</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.03] border border-white/[0.06]" />
              <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] border border-white/[0.12]" />
              <div className="w-2.5 h-2.5 rounded-xs bg-[#9C7938]/40 border border-[#9C7938]/60" />
              <div className="w-2.5 h-2.5 rounded-xs bg-[#C59E5F]/75 border border-[#C59E5F]" />
              <div className="w-2.5 h-2.5 rounded-xs bg-[#E5C38D] border border-[#E5C38D]" />
            </div>
            <span>Peak Load</span>
          </div>
        </div>

        {/* Col 2: Top Models By Cost */}
        <div className="p-5 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs sm:text-sm font-bold text-white font-sans">
                Top Models By Cost
              </h4>
              <span className="text-[10px] font-mono text-zinc-500">This Month</span>
            </div>

            {/* Progress bars list */}
            <div className="space-y-4 pt-1">
              {/* Claude 3.7 Sonnet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Claude 3.7 Sonnet</span>
                  <span className="font-bold font-mono text-white">48%</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] h-full rounded-full" style={{ width: '48%' }} />
                </div>
              </div>

              {/* GPT-4o */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">GPT-4o</span>
                  <span className="font-bold font-mono text-white">32%</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white/40 h-full rounded-full" style={{ width: '32%' }} />
                </div>
              </div>

              {/* Claude 3.5 Haiku */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Claude 3.5 Haiku</span>
                  <span className="font-bold font-mono text-white">12%</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#C59E5F]/50 h-full rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              {/* Gemini 1.5 Pro */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Gemini 1.5 Pro</span>
                  <span className="font-bold font-mono text-white">8%</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white/20 h-full rounded-full" style={{ width: '8%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Fallback Note Footer */}
          <div className="pt-4 mt-4 border-t border-white/[0.06]">
            <span className="text-[10px] font-mono text-zinc-400 block leading-tight">
              82% of workloads routed via cost-optimized fallbacks
            </span>
          </div>
        </div>

        {/* Col 3: OPS COPILOT (AI Cost Optimization Bot) */}
        <div className="p-5 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between">
          <div className="space-y-3.5">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#E5C38D] uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-[#C59E5F]" />
                <span>OPS COPILOT</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">
                READY
              </span>
            </div>

            {/* Bot Title */}
            <h4 className="text-xs sm:text-sm font-bold text-white font-sans">
              AI Cost Optimization Bot
            </h4>

            {/* Bot Quote */}
            <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed font-sans bg-white/[0.02] border-l-2 border-[#C59E5F] pl-3 py-1.5 rounded-r-xl">
              &ldquo;{copilotMessage}&rdquo;
            </p>

            {/* Primary Action Button */}
            <button
              onClick={handleApplyReroute}
              disabled={rerouteApplied}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                rerouteApplied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#07090C] hover:brightness-110'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{rerouteApplied ? 'Reroute Active (Protected)' : 'Apply Automated Reroute'}</span>
            </button>
          </div>

          {/* Bottom Interactive Prompt Input & Action Pills */}
          <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-2">
            <form onSubmit={handleSendChat} className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything about your proxy spend..."
                className="w-full bg-[#07090C] border border-white/[0.1] rounded-xl pl-3 pr-8 py-2 text-[11px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C59E5F] font-sans"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#E5C38D] transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Prompt Badges */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePromptTag('Explain spike')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[9.5px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Explain spike
              </button>
              <button
                type="button"
                onClick={() => handlePromptTag('Test failover')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[9.5px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Test failover
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

  // If not standalone window (e.g. inside DashboardPage overview), return cockpit directly
  if (!standaloneWindow) {
    return cockpitContent;
  }

  // Standalone Window Chrome (Exact Match to User Screenshot: Full Desktop Frame with Sidebar + Header)
  return (
    <div className="relative w-full rounded-3xl bg-[#07090C] border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row text-white font-sans">
      
      {/* Ambient Radial Aura Behind the Window */}
      <div className="absolute -inset-10 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[80%] bg-gradient-to-tr from-[#C59E5F]/20 via-[#E5C38D]/5 to-transparent blur-[100px] rounded-3xl" />
      </div>

      {/* ============================================================ */}
      {/* LEFT SIDEBAR (Matching Screenshot Exactly)                    */}
      {/* ============================================================ */}
      <aside className="w-full lg:w-56 shrink-0 bg-[#090C10] border-b lg:border-b-0 lg:border-r border-white/[0.08] p-4 flex flex-col justify-between">
        
        {/* Top: Logo & Navigation */}
        <div className="space-y-6">
          
          {/* Ostra Logo & App Name */}
          <div className="px-2 pt-1 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Golden Spiral Icon */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C59E5F] to-[#E5C38D] p-[1.5px] shadow-sm">
                <div className="w-full h-full bg-[#07090C] rounded-[10px] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#E5C38D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeDasharray="3 3" />
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Ostra
              </span>
            </div>

            {/* Desktop window dots */}
            <div className="hidden lg:flex items-center gap-1.5 opacity-60">
              <span className="w-2 h-2 rounded-full bg-red-500/70" />
              <span className="w-2 h-2 rounded-full bg-amber-500/70" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    if (onNavigateTab) onNavigateTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#E5C38D]' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Pro Plan Card */}
        <div className="pt-4 mt-4 border-t border-white/[0.08]">
          <div className="p-3.5 rounded-2xl bg-[#0D1016] border border-white/[0.08] space-y-1">
            <div className="text-xs font-bold text-white">Pro Plan</div>
            <div className="text-[11px] font-mono text-zinc-400">$49 / month</div>
            
            <button
              onClick={onNavigatePricing}
              className="w-full text-left text-[11px] font-bold text-[#E5C38D] hover:text-white flex items-center justify-between pt-2 mt-2 border-t border-white/[0.06] cursor-pointer transition-colors"
            >
              <span>Manage Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>

      {/* ============================================================ */}
      {/* MAIN RIGHT CONTAINER (Top Header Bar + Cockpit Content)     */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#07090C]">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#07090C]/90 backdrop-blur-md border-b border-white/[0.08] px-5 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Search bar with Cmd K */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F131A] border border-white/[0.1] text-xs text-zinc-400 w-60 sm:w-80">
            <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">Search logs, models, commands...</span>
            <kbd className="hidden sm:inline text-[9.5px] font-mono bg-white/[0.08] px-1.5 py-0.5 rounded text-zinc-400 ml-auto border border-white/[0.08]">
              ⌘ K
            </kbd>
          </div>

          {/* Right Header Status & Admin Profile (NO Personal Name) */}
          <div className="flex items-center gap-3">
            
            {/* Gateway Online status pill */}
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-medium flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gateway Online</span>
            </div>

            {/* Notification Bell */}
            <div className="relative p-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-zinc-400 hover:text-white cursor-pointer transition-colors">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute 1 top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C59E5F]" />
            </div>

            {/* User Profile Card — Generic Admin / Owner (NO Personal Name) */}
            <div className="flex items-center gap-2 pl-1 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-[#18181B] border border-[#C59E5F]/40 text-[#E5C38D] text-xs font-bold font-mono flex items-center justify-center shadow-xs">
                EA
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className="font-bold text-white group-hover:text-[#E5C38D] transition-colors">
                  Enterprise Admin
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Owner
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* Cockpit Content Container */}
        <div className="p-4 sm:p-6 space-y-4 overflow-x-hidden">
          {cockpitContent}
        </div>

      </div>

    </div>
  );
};
