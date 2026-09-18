import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  LayoutDashboard, 
  DollarSign, 
  Bot, 
  ShieldCheck, 
  FileText, 
  Workflow, 
  Users, 
  Settings, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Activity,
  Cpu,
  Check
} from 'lucide-react';
import { OstraLogo } from './OstraBrand';

export const HeroDashboard3D: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedDay, setSelectedDay] = useState<number | null>(6);
  const [timeframe, setTimeframe] = useState('Last 7 days');
  const [timeframeOpen, setTimeframeOpen] = useState(false);

  const trendData = [
    { day: 'Sep 1', spend: '$0.20', height: 14 },
    { day: 'Sep 2', spend: '$0.45', height: 22 },
    { day: 'Sep 3', spend: '$0.60', height: 30 },
    { day: 'Sep 4', spend: '$0.85', height: 40 },
    { day: 'Sep 5', spend: '$1.05', height: 50 },
    { day: 'Sep 6', spend: '$1.25', height: 60 },
    { day: 'Sep 7', spend: '$1.42', height: 70 },
  ];

  return (
    <div className="relative w-full max-w-[960px] select-none">
      
      {/* Soft Ambient Warm Glow behind dashboard card */}
      <div className="absolute -inset-4 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[75%] bg-gradient-to-tr from-osterdGold-500/10 via-sandstone-300/20 to-amber-100/15 blur-[60px] rounded-3xl" />
      </div>

      {/* Main Dashboard Card matching the reference screenshot exactly */}
      <div className="relative bg-white rounded-[26px] sm:rounded-[32px] border border-[#E8E3D8] shadow-[0_22px_60px_-15px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200">
        
        {/* ============================================================ */}
        {/* TOP HEADER BAR                                               */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-[#EFEBE3] bg-white">
          
          {/* Logo & Search */}
          <div className="flex items-center gap-5 sm:gap-6">
            <OstraLogo
              iconClassName="w-5 h-5"
              textClassName="text-sm font-bold tracking-tight text-charcoal-900 font-sans"
              variant="charcoal"
              brandName="OsterdOps"
            />

            {/* Search Input Box */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F2EB]/80 rounded-xl text-xs text-charcoal-500 border border-[#EAE4DA] w-44 sm:w-60">
              <Search className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
              <span className="truncate">Search anything...</span>
            </div>
          </div>

          {/* Workspace Badge & User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Example Workspace capsule pill */}
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-charcoal-600 border border-[#EAE4DA] hidden sm:inline-block">
              EXAMPLE WORKSPACE
            </span>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#EAE4DA] text-charcoal-800 font-semibold text-xs flex items-center justify-center border border-[#DDD6C8] font-mono">
                SP
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-charcoal-900 leading-tight">Shaon Prasad</span>
                <span className="text-[10px] text-charcoal-400 leading-tight">Owner</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DASHBOARD BODY: SIDEBAR + MAIN CONTENT                       */}
        {/* ============================================================ */}
        <div className="flex flex-row bg-[#FAF8F5]/30">
          
          {/* Left Navigation Sidebar */}
          <aside className="hidden md:flex flex-col justify-between w-44 shrink-0 py-4 px-3 border-r border-[#EFEBE3] bg-white text-xs font-medium text-charcoal-600">
            <div className="space-y-1">
              {[
                { name: 'Overview', icon: LayoutDashboard },
                { name: 'Usage & Costs', icon: DollarSign },
                { name: 'Agents', icon: Bot },
                { name: 'Governance', icon: ShieldCheck },
                { name: 'Logs', icon: FileText },
                { name: 'Integrations', icon: Workflow },
                { name: 'Teams', icon: Users },
                { name: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = item.name === activeTab;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#F2EDE2] text-charcoal-900 font-bold shadow-2xs'
                        : 'hover:bg-[#FAF7F0] text-charcoal-500 hover:text-charcoal-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-charcoal-800' : 'text-charcoal-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Dashboard Panel */}
          <main className="flex-1 min-w-0 p-4 sm:p-5 space-y-4">
            
            {/* Overview Title Row */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-charcoal-900 leading-tight">Overview</h3>
                <p className="text-xs text-charcoal-500 mt-0.5">Your AI infrastructure at a glance</p>
              </div>

              {/* Timeframe Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setTimeframeOpen((p) => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAE4DA] bg-white text-xs font-semibold text-charcoal-700 shadow-2xs hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <span>{timeframe}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
                </button>
                {timeframeOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-white border border-[#EAE4DA] shadow-lg p-1 z-20 text-xs">
                    {['Today', 'Last 7 days', 'Last 30 days'].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTimeframe(t);
                          setTimeframeOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          timeframe === t ? 'bg-sandstone-200 text-charcoal-900 font-bold' : 'hover:bg-sandstone-100 text-charcoal-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4 Metric Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Card 1: Total Spend */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-charcoal-500">Total Spend</span>
                  <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-osterdGold-700">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="text-xl font-bold text-charcoal-900 font-sans">$1.42</span>
                  <span className="text-xs text-charcoal-400 font-medium">/ $5.00</span>
                </div>
                <div className="mt-2.5">
                  <div className="w-full bg-[#EAE6DD] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#946A2C] h-full rounded-full" style={{ width: '28%' }} />
                  </div>
                  <div className="mt-1 text-right">
                    <span className="text-[10px] text-charcoal-400 font-mono">28% cap</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Tokens Used */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-charcoal-500">Tokens Used</span>
                  <div className="w-6 h-6 rounded-lg bg-sandstone-200/80 flex items-center justify-center text-charcoal-700">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="text-xl font-bold text-charcoal-900 font-sans">142K</span>
                  <span className="text-xs text-charcoal-400 font-medium">/ min</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600">
                    + 12%
                  </span>
                  <svg className="w-16 h-4 text-emerald-500 overflow-visible" viewBox="0 0 50 15" fill="none">
                    <path d="M1 11 Q 12 3, 24 12 T 48 3" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Card 3: Active Models */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-charcoal-500">Active Models</span>
                  <div className="w-6 h-6 rounded-lg bg-amber-50/80 border border-amber-100 flex items-center justify-center text-osterdGold-600">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-sm sm:text-base font-bold text-charcoal-900 truncate my-0.5">
                  Gemini Flash
                </div>
                <div className="mt-2.5">
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Cost Optimized</span>
                  </span>
                </div>
              </div>

              {/* Card 4: Total Requests */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-charcoal-500">Total Requests</span>
                  <div className="w-6 h-6 rounded-lg bg-sandstone-200/80 flex items-center justify-center text-charcoal-700">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-charcoal-900 my-0.5">
                  8,932
                </div>
                <div className="mt-2.5">
                  <span className="text-xs font-bold text-emerald-600">
                    + 18%
                  </span>
                </div>
              </div>

            </div>

            {/* Middle Row: Spend Trend Chart & Top Models by Cost */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              
              {/* Spend Trend Chart (7 cols) */}
              <div className="md:col-span-7 p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-charcoal-900">Spend Trend</span>
                  <span className="text-[10px] font-mono text-charcoal-400 font-medium">USD ($)</span>
                </div>

                {/* SVG Area Chart */}
                <div className="relative h-28 w-full pt-1">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 350 90" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="heroSpendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C59E5F" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#C59E5F" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="12" x2="350" y2="12" stroke="#F4EFE6" strokeDasharray="3 3" />
                    <line x1="0" y1="38" x2="350" y2="38" stroke="#F4EFE6" strokeDasharray="3 3" />
                    <line x1="0" y1="64" x2="350" y2="64" stroke="#F4EFE6" strokeDasharray="3 3" />
                    <line x1="0" y1="85" x2="350" y2="85" stroke="#EAE5DC" />

                    {/* Gradient Area */}
                    <path
                      d="M 15,75 L 65,68 L 115,60 L 165,50 L 215,38 L 265,28 L 315,16 L 315,85 L 15,85 Z"
                      fill="url(#heroSpendGrad)"
                    />

                    {/* Trend Line */}
                    <path
                      d="M 15,75 L 65,68 L 115,60 L 165,50 L 215,38 L 265,28 L 315,16"
                      fill="none"
                      stroke="#C59E5F"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />

                    {/* Interactive Points */}
                    {trendData.map((point, index) => {
                      const cx = 15 + index * 50;
                      const cy = 85 - point.height;
                      const isSelected = selectedDay === index;
                      return (
                        <g key={point.day} className="cursor-pointer" onClick={() => setSelectedDay(index)}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSelected ? 4 : 2.5}
                            fill={isSelected ? '#18181B' : '#FFFFFF'}
                            stroke="#C59E5F"
                            strokeWidth={isSelected ? 2 : 1.5}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* X Axis Labels */}
                  <div className="flex justify-between text-[9px] font-mono text-charcoal-400 mt-2 px-1">
                    {trendData.map((d, i) => (
                      <span 
                        key={d.day} 
                        className={`cursor-pointer transition-colors ${selectedDay === i ? 'font-bold text-charcoal-900' : 'hover:text-charcoal-700'}`}
                        onClick={() => setSelectedDay(i)}
                      >
                        {d.day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Models by Cost (5 cols) */}
              <div className="md:col-span-5 p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
                <span className="text-xs font-bold text-charcoal-900 block mb-2">Top Models by Cost</span>
                
                <div className="space-y-2.5">
                  {/* Gemini Flash */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-charcoal-800">Gemini Flash</span>
                      <span className="text-charcoal-950 font-bold font-mono">62%</span>
                    </div>
                    <div className="w-full bg-[#EAE6DD] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#946A2C] h-full rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>

                  {/* GPT-4o */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-charcoal-800">GPT-4o</span>
                      <span className="text-charcoal-950 font-bold font-mono">23%</span>
                    </div>
                    <div className="w-full bg-[#EAE6DD] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#18181B] h-full rounded-full" style={{ width: '23%' }} />
                    </div>
                  </div>

                  {/* Claude Sonnet */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-charcoal-800">Claude Sonnet</span>
                      <span className="text-charcoal-950 font-bold font-mono">9%</span>
                    </div>
                    <div className="w-full bg-[#EAE6DD] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#C59E5F] h-full rounded-full" style={{ width: '9%' }} />
                    </div>
                  </div>

                  {/* Other */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-charcoal-800">Other</span>
                      <span className="text-charcoal-950 font-bold font-mono">6%</span>
                    </div>
                    <div className="w-full bg-[#EAE6DD] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#D4CEBF] h-full rounded-full" style={{ width: '6%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Recent Alerts + Dark Net Saved Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              
              {/* Recent Alerts (7 cols) */}
              <div className="md:col-span-7 p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
                <span className="text-xs font-bold text-charcoal-900 block mb-2">Recent Alerts</span>
                
                <div className="space-y-2">
                  {/* Alert 1 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFFDF9] border border-[#F8EBD4]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11.5px] font-bold text-charcoal-900 leading-tight">Token spike detected!</div>
                        <div className="text-[10px] text-charcoal-500 mt-0.5">Agent: research-agent • 2m ago</div>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-white border border-[#EAE4DA] text-charcoal-800 hover:bg-[#FAF8F5] cursor-pointer shadow-2xs">
                      View
                    </button>
                  </div>

                  {/* Alert 2 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8FDFB] border border-[#D5F0E4]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11.5px] font-bold text-charcoal-900 leading-tight">Budget cap updated</div>
                        <div className="text-[10px] text-charcoal-500 mt-0.5">New limit: $1.00 → $5.00 • 12m ago</div>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-white border border-[#EAE4DA] text-charcoal-800 hover:bg-[#FAF8F5] cursor-pointer shadow-2xs">
                      View
                    </button>
                  </div>

                  {/* Alert 3 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFD] border border-[#D6E4F8]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800 shrink-0">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11.5px] font-bold text-charcoal-900 leading-tight">Model optimization suggested</div>
                        <div className="text-[10px] text-charcoal-500 mt-0.5">Switch to Gemini Flash (90% cheaper)</div>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-white border border-[#EAE4DA] text-charcoal-800 hover:bg-[#FAF8F5] cursor-pointer shadow-2xs">
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* Net Saved Card (5 cols) */}
              <div className="md:col-span-5 relative p-5 rounded-2xl bg-gradient-to-br from-[#111414] via-[#18181B] to-[#0B0F0F] text-white overflow-hidden shadow-lg border border-charcoal-800 flex flex-col justify-between">
                {/* Generative Gold Topographic Waves in background */}
                <div className="absolute inset-0 opacity-25 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="none">
                    <path d="M0,100 C50,60 100,120 200,70" stroke="#C59E5F" strokeWidth="1" fill="none" />
                    <path d="M0,110 C50,70 120,110 200,80" stroke="#C59E5F" strokeWidth="1" fill="none" />
                    <path d="M0,85 C60,40 140,100 200,60" stroke="#C59E5F" strokeWidth="1.2" fill="none" />
                    <path d="M0,120 C70,90 130,95 200,90" stroke="#C59E5F" strokeWidth="0.8" fill="none" />
                  </svg>
                </div>

                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-white font-sans">$16.58</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/80">
                    -90%
                  </span>
                </div>

                <div className="relative z-10 mt-6">
                  <div className="text-xs font-bold text-zinc-100">Net Saved</div>
                  <div className="text-[10px] text-zinc-400">vs. projected spend</div>
                </div>
              </div>

            </div>

          </main>
        </div>
      </div>
    </div>
  );
};
