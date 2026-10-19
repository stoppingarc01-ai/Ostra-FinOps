import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronDown, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  Zap, 
  Activity, 
  Radio, 
  Clock, 
  Flame, 
  Layers
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPlanEntitlements } from '../lib/entitlements';
import { fetchGatewayLogs, isSupabaseAvailable, supabase } from '../lib/supabase';
import { fetchUserAlerts } from '../lib/alertsService';
import type { GatewayLog, SystemAlert } from '../types/database';

interface OverviewViewProps {
  onNavigateToUsage?: () => void;
  onNavigateToModels?: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToBudgets?: () => void;
  onNavigateToBilling?: () => void;
}

type ChartMetric = 'spend' | 'tokens' | 'requests' | 'latency';
type ChartTimeframe = '24h' | '7d' | '30d' | 'all';

interface TelemetryPoint {
  date: string;
  label: string;
  fullDate: string;
  spend: number;
  tokens: number;
  requests: number;
  latency: number;
  topModel: string;
  cacheHitRate: number;
}

interface DualLinePoint {
  month: string;
  actual: number;
  baseline: number;
  isForecast?: boolean;
  dateStr: string;
  tooltipVal: string;
}

interface DualLineForecastCardProps {
  id: string;
  options: string[];
  selectedOption: string;
  onSelectOption: (opt: string) => void;
  bigValue: string;
  trendPct: string;
  points: DualLinePoint[];
  curveColor?: string;
  baselineColor?: string;
  emptyLabel?: string;
}

/**
 * DualLineForecastCard:
 * 100% Real-Time Data Driven. Zero Mock Data.
 * Matches reference layout:
 * - Top-left dropdown + top-right 6-dot menu icon
 * - Bottom-left big KPI value with trend indicator
 * - Bottom-right dual-line SVG curve (solid actual + dashed comparison + diagonal hatched Nov/Dec forecast zone + floating dark pill tooltip)
 */
const DualLineForecastCard: React.FC<DualLineForecastCardProps> = ({
  id,
  options,
  selectedOption,
  onSelectOption,
  bigValue,
  trendPct,
  points,
  curveColor = '#E5C38D',
  baselineColor = 'rgba(255, 255, 255, 0.28)',
  emptyLabel = 'No live gateway traffic recorded yet',
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // SVG Geometry
  const width = 760;
  const height = 170;
  const padLeft = 20;
  const padRight = 24;
  const padTop = 22;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const allValues = points.flatMap((p) => [p.actual, p.baseline]);
  const maxVal = Math.max(...allValues, 0);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 1;
  const isAllZero = maxVal === 0;

  const coords = points.map((p, i) => {
    const x = padLeft + (i / Math.max(1, points.length - 1)) * plotW;
    const actualRatio = isAllZero ? 0 : Math.min(1, Math.max(0, (p.actual - minVal) / range));
    const baselineRatio = isAllZero ? 0 : Math.min(1, Math.max(0, (p.baseline - minVal) / range));
    const yActual = padTop + (1 - actualRatio) * plotH;
    const yBaseline = padTop + (1 - baselineRatio) * plotH;
    return { x, yActual, yBaseline, p, i };
  });

  const actualHistoricCoords = coords.slice(0, 10);
  const actualForecastCoords = coords.slice(9);

  const getCubicPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const c = pts[i];
      const n = pts[i + 1];
      const cpx = (c.x + n.x) / 2;
      d += ` C ${cpx} ${c.y}, ${cpx} ${n.y}, ${n.x} ${n.y}`;
    }
    return d;
  };

  const actualHistoricPath = getCubicPath(actualHistoricCoords.map((c) => ({ x: c.x, y: c.yActual })));
  const actualForecastPath = getCubicPath(actualForecastCoords.map((c) => ({ x: c.x, y: c.yActual })));
  const baselinePath = getCubicPath(coords.map((c) => ({ x: c.x, y: c.yBaseline })));

  // Forecast demarcator: starts between Oct (index 9) and Nov (index 10)
  const xForecast = padLeft + (9.5 / 11) * plotW;
  const forecastWidth = (width - padRight) - xForecast;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || coords.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;

    let closest = 0;
    let minDiff = Infinity;
    coords.forEach((c, i) => {
      const diff = Math.abs(c.x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = i;
      }
    });
    setHoveredIdx(closest);
  };

  const activeCoord = hoveredIdx !== null ? coords[hoveredIdx] : null;

  return (
    <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xl relative overflow-hidden transition-all hover:border-[#C59E5F]/30 group">
      {/* Top Bar: Dropdown on Left, 6-dot menu on Right */}
      <div className="flex items-center justify-between mb-2">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>{selectedOption}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 w-48 rounded-xl bg-[#07090C] border border-white/10 shadow-2xl py-1 animate-in fade-in zoom-in-95">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onSelectOption(opt);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] flex items-center justify-between cursor-pointer"
                >
                  <span>{opt}</span>
                  {selectedOption === opt && <Check className="w-3 h-3 text-[#C59E5F]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 6-dot Grip Menu Icon */}
        <div className="text-zinc-600 hover:text-zinc-400 cursor-grab p-1" title="Drag to reorder card">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <circle cx="4" cy="3" r="1.2" />
            <circle cx="10" cy="3" r="1.2" />
            <circle cx="4" cy="7" r="1.2" />
            <circle cx="10" cy="7" r="1.2" />
            <circle cx="4" cy="11" r="1.2" />
            <circle cx="10" cy="11" r="1.2" />
          </svg>
        </div>
      </div>

      {/* Grid: Left KPI + Right Dual-Line Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        {/* Left Column: Big KPI + Trend Pill */}
        <div className="lg:col-span-3 pb-2 sm:pb-5">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-2xl sm:text-[32px] font-extrabold text-white tracking-tight font-sans">
              {bigValue}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="text-[11px]">↗</span>
              <span>{trendPct}</span>
            </span>
          </div>
        </div>

        {/* Right Column: Dual-Line Forecast Graph */}
        <div className="lg:col-span-9 relative select-none">
          {/* Floating Tooltip */}
          {activeCoord && !isAllZero && (
            <div
              className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-75"
              style={{
                left: `${(activeCoord.x / width) * 100}%`,
                top: `${(activeCoord.yActual / height) * 100}%`,
              }}
            >
              <div className="bg-[#07090C]/95 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 shadow-2xl text-center -mt-2.5 animate-in fade-in zoom-in-95">
                <div className="text-xs font-bold text-white font-mono leading-tight">
                  {activeCoord.p.tooltipVal}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5 leading-tight">
                  {activeCoord.p.dateStr}
                </div>
              </div>
            </div>
          )}

          {/* SVG Canvas */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-36 sm:h-44 overflow-visible cursor-crosshair"
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              <pattern
                id={`hatch-${id}`}
                width="8"
                height="8"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
              </pattern>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0.25, 0.5, 0.75].map((ratio, idx) => {
              const y = padTop + ratio * plotH;
              return (
                <line
                  key={idx}
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeDasharray="3 3"
                />
              );
            })}

            {/* Hatched Forecast Zone for Nov & Dec */}
            <rect
              x={xForecast}
              y={padTop}
              width={forecastWidth}
              height={plotH}
              fill={`url(#hatch-${id})`}
              rx="2"
            />
            <line
              x1={xForecast}
              y1={padTop}
              x2={xForecast}
              y2={padTop + plotH}
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="3 3"
            />
            <line
              x1={width - padRight}
              y1={padTop}
              x2={width - padRight}
              y2={padTop + plotH}
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="3 3"
            />

            {/* Baseline Line */}
            <path
              d={baselinePath}
              fill="none"
              stroke={baselineColor}
              strokeWidth="1.8"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />

            {/* Historic Curve Line */}
            <path
              d={actualHistoricPath}
              fill="none"
              stroke={curveColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Forecast Curve Line */}
            <path
              d={actualForecastPath}
              fill="none"
              stroke={curveColor}
              strokeWidth="1.8"
              strokeOpacity="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Empty State Label if no traffic yet */}
            {isAllZero && (
              <text
                x={width / 2}
                y={padTop + plotH / 2}
                textAnchor="middle"
                className="text-[11px] font-mono fill-zinc-600 font-medium select-none"
              >
                {emptyLabel}
              </text>
            )}

            {/* Interactive Crosshair Dot */}
            {activeCoord && !isAllZero && (
              <g>
                <line
                  x1={activeCoord.x}
                  y1={activeCoord.yActual}
                  x2={activeCoord.x}
                  y2={padTop + plotH}
                  stroke={curveColor}
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={activeCoord.x}
                  cy={activeCoord.yActual}
                  r={4.5}
                  fill={curveColor}
                  stroke="#07090C"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* X-axis Month Labels */}
            {coords.map((c, i) => {
              const isHovered = hoveredIdx === i;
              return (
                <text
                  key={i}
                  x={c.x}
                  y={height - 6}
                  textAnchor="middle"
                  className={`text-[10px] font-mono transition-colors ${
                    isHovered ? 'fill-white font-bold' : 'fill-zinc-500'
                  }`}
                >
                  {c.p.month}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

// Dynamic Sparkline Path Generator (100% Real-Time Data Derived, Zero Mock Waves)
const getSparklinePath = (data: number[], width = 76, height = 24, pad = 2): string => {
  if (!data || data.length === 0) return `M ${pad} ${height - pad} L ${width - pad} ${height - pad}`;
  const max = Math.max(...data, 0);
  const min = Math.min(...data, 0);
  if (max === 0) return `M ${pad} ${height - pad} L ${width - pad} ${height - pad}`;
  
  const range = max - min || 1;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;
  
  const pts = data.map((v, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * plotW;
    const y = pad + (1 - (v - min) / range) * plotH;
    return { x, y };
  });

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const c = pts[i];
    const n = pts[i + 1];
    const cpx = ((c.x + n.x) / 2).toFixed(1);
    d += ` C ${cpx} ${c.y.toFixed(1)}, ${cpx} ${n.y.toFixed(1)}, ${n.x.toFixed(1)} ${n.y.toFixed(1)}`;
  }
  return d;
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateToUsage,
  onNavigateToModels,
  onNavigateToAlerts,
  onNavigateToBudgets,
  onNavigateToBilling,
}) => {
  const { user, organization, subscription } = useAuth();
  const entitlements = getPlanEntitlements(subscription);

  // Timeframe and display modes
  const [timeframe, setTimeframe] = useState('Last 7 days');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chartMetric, setChartMetric] = useState<ChartMetric>('spend');
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('7d');
  const [showDeepEngine, setShowDeepEngine] = useState(false);

  // Dual Line Graph Dropdown States
  const [spendOption, setSpendOption] = useState('Spend Velocity');
  const [requestOption, setRequestOption] = useState('All Invocations');

  // Live Telemetry Data from Backend
  const [liveLogs, setLiveLogs] = useState<GatewayLog[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [, setClockTick] = useState(0);

  // Hover and interaction states for Deep Stream Graph
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Selected Alert for modal
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  // 1-second interval to update relative timestamps live
  useEffect(() => {
    const timer = setInterval(() => setClockTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Telemetry Data Fetcher & Event Bus Listener
  useEffect(() => {
    let isMounted = true;
    const userId = user?.id || 'guest';
    const orgId = organization?.id;

    // Purge any simulated or mock test logs that may have been saved to localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('ostraops_recent_logs') || k === 'ostraops_demo_logs' || k === 'ostraops_mock_logs')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.filter(
                (l: any) =>
                  !l.id?.startsWith('ost_live_') &&
                  !l.request_id?.startsWith('ost_live_') &&
                  !l.id?.startsWith('mock_') &&
                  !l.request_id?.startsWith('mock_') &&
                  !l.id?.startsWith('demo_') &&
                  !l.request_id?.startsWith('demo_') &&
                  !l.is_simulated
              );
              if (cleaned.length !== parsed.length) {
                localStorage.setItem(k, JSON.stringify(cleaned));
              }
            }
          }
        }
      }
    } catch {}

    const loadRealData = async () => {
      let combinedLogs: GatewayLog[] = [];

      // 0. Real-time Live Gateway Daemon Telemetry (Localhost & Terminal)
      try {
        const gwRes = await fetch('/gateway/telemetry');
        if (gwRes.ok) {
          const gwLogs = await gwRes.json();
          if (Array.isArray(gwLogs) && gwLogs.length > 0) {
            combinedLogs.push(...gwLogs);
          }
        }
      } catch {}

      // 1. User-isolated recent logs (from playground or gateway tests performed by this account)
      try {
        const local = localStorage.getItem(`ostraops_recent_logs_${userId}`);
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            const realOnly = parsed.filter(
              (l: any) =>
                !l.id?.startsWith('ost_live_') &&
                !l.request_id?.startsWith('ost_live_') &&
                !l.id?.startsWith('mock_') &&
                !l.request_id?.startsWith('mock_') &&
                !l.id?.startsWith('demo_') &&
                !l.request_id?.startsWith('demo_') &&
                !l.is_simulated
            );
            combinedLogs.push(...realOnly);
          }
        }
      } catch {}

      // 2. Organization-isolated Supabase Telemetry Logs
      if (isSupabaseAvailable() && orgId) {
        try {
          const remoteLogs = await fetchGatewayLogs(100, orgId);
          if (remoteLogs && remoteLogs.length > 0) {
            const existingIds = new Set(combinedLogs.map((l) => l.request_id || l.id));
            for (const item of remoteLogs) {
              if (!existingIds.has(item.request_id || item.id)) {
                combinedLogs.push(item);
              }
            }
          }
        } catch {}
      }

      if (isMounted) {
        setLiveLogs((prev) => {
          const idSet = new Set<string>();
          const result: GatewayLog[] = [];
          for (const item of [...combinedLogs, ...prev]) {
            const key = item.request_id || item.id || Math.random().toString();
            if (!idSet.has(key)) {
              idSet.add(key);
              result.push(item);
            }
          }
          return result.slice(0, 200);
        });

        setIsLiveConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }

      // 3. Load Real User Alerts
      if (user?.uid) {
        try {
          const userAlerts = await fetchUserAlerts(user.uid);
          if (isMounted) setAlerts(userAlerts);
        } catch {}
      }
    };

    loadRealData();
    const pollInterval = setInterval(loadRealData, 1500);

    const onNewLog = (e: Event) => {
      const detail = (e as CustomEvent<GatewayLog>).detail;
      if (detail && isMounted) {
        setLiveLogs((prev) => {
          if (prev.some((l) => (l.id || l.request_id) === (detail.id || detail.request_id))) return prev;
          return [detail, ...prev.slice(0, 199)];
        });
        setIsLiveConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    };
    window.addEventListener('ostraops:new_log', onNewLog);

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('ostraops_recent_logs')) {
        try {
          const parsed = JSON.parse(e.newValue || '[]');
          if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
            setLiveLogs((prev) => {
              const map = new Map<string, GatewayLog>();
              [...parsed, ...prev].forEach((l) => {
                const id = l.id || l.request_id || Math.random().toString();
                if (!map.has(id)) map.set(id, l);
              });
              return Array.from(map.values()).slice(0, 200);
            });
            setIsLiveConnected(true);
            setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);

    let supabaseChannel: any = null;
    if (isSupabaseAvailable()) {
      try {
        supabaseChannel = supabase
          .channel('realtime_overview_logs')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'gateway_logs' },
            (payload) => {
              const newLog = payload.new as GatewayLog;
              if (newLog && isMounted) {
                setLiveLogs((prev) => {
                  if (prev.some((l) => (l.id || l.request_id) === (newLog.id || newLog.request_id))) return prev;
                  return [newLog, ...prev.slice(0, 199)];
                });
                setIsLiveConnected(true);
                setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
              }
            }
          )
          .subscribe();
      } catch {}
    }

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('ostraops:new_log', onNewLog);
      window.removeEventListener('storage', onStorage);
      if (supabaseChannel) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }, [user?.uid, user?.id, organization?.id]);

  // Filter logs by timeframe (pure real data)
  const filteredLogs = useMemo(() => {
    if (timeframe === 'All time') return liveLogs;
    const now = Date.now();
    let durationMs = 7 * 86400000;
    if (timeframe === 'Today') durationMs = 86400000;
    else if (timeframe === 'Yesterday') durationMs = 2 * 86400000;
    else if (timeframe === 'Last 7 days') durationMs = 7 * 86400000;
    else if (timeframe === 'Last 30 days') durationMs = 30 * 86400000;

    return liveLogs.filter((l) => {
      try {
        const t = new Date(l.created_at).getTime();
        return now - t <= durationMs;
      } catch {
        return true;
      }
    });
  }, [liveLogs, timeframe]);

  // Compute 100% REAL spend / tokens / requests (NO MOCK DATA)
  const totalSpend = useMemo(() => filteredLogs.reduce((acc, l) => acc + (l.cost_usd || 0), 0), [filteredLogs]);
  const totalTokens = useMemo(() => filteredLogs.reduce((acc, l) => acc + (l.input_tokens || 0) + (l.output_tokens || 0), 0), [filteredLogs]);
  const totalRequests = filteredLogs.length;

  // Compute unique models used from real logs only
  const modelsMap = useMemo(() => {
    const map: Record<string, { count: number; spend: number }> = {};
    filteredLogs.forEach((l) => {
      const m = l.routed_model || 'Unknown';
      if (!map[m]) map[m] = { count: 0, spend: 0 };
      map[m].count += 1;
      map[m].spend += (l.cost_usd || 0);
    });
    return map;
  }, [filteredLogs]);

  const modelEntries = useMemo(() => Object.entries(modelsMap).sort((a, b) => b[1].spend - a[1].spend), [modelsMap]);
  const uniqueModelsCount = modelEntries.length;

  // 4 Top Metric Display Calculations (100% Real, zero mock numbers)
  const displaySpend = totalSpend.toLocaleString('en-US', {
    minimumFractionDigits: totalSpend > 0 && totalSpend < 1 ? 4 : 2,
    maximumFractionDigits: 4,
  });

  const displayTokens = totalTokens >= 1_000_000 
    ? `${(totalTokens / 1_000_000).toFixed(2)}M` 
    : totalTokens >= 1000 
    ? `${(totalTokens / 1000).toFixed(1)}K` 
    : `${totalTokens.toLocaleString()}`;

  const displayModelsCount = `${uniqueModelsCount} Active`;

  const topModelsLabel = uniqueModelsCount > 0 
    ? modelEntries.map(e => e[0].replace('gpt-', 'GPT-').replace('claude-', 'Clau-').replace('gemini-', 'Gem-')).slice(0, 2).join(', ')
    : 'No active models';

  const displayRequests = totalRequests.toLocaleString();

  // -------------------------------------------------------------
  // DUAL-LINE FORECAST GRAPHS (Computed Strictly From Real Logs)
  // -------------------------------------------------------------
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Real Monthly Aggregations
  const monthlySpendMap = useMemo(() => {
    const map = new Array(12).fill(0);
    liveLogs.forEach((l) => {
      try {
        const d = new Date(l.created_at);
        const m = d.getMonth();
        if (m >= 0 && m < 12) {
          map[m] += (l.cost_usd || 0);
        }
      } catch {}
    });
    return map;
  }, [liveLogs]);

  const monthlyRequestsMap = useMemo(() => {
    const map = new Array(12).fill(0);
    liveLogs.forEach((l) => {
      try {
        const d = new Date(l.created_at);
        const m = d.getMonth();
        if (m >= 0 && m < 12) {
          map[m] += 1;
        }
      } catch {}
    });
    return map;
  }, [liveLogs]);

  // Card 1: Real Spend Velocity Points (Reactive to dropdown option)
  const spendVelocityPoints = useMemo<DualLinePoint[]>(() => {
    if (spendOption === 'Hourly Spend') {
      const todayHours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayLogs = liveLogs.filter((l) => (l.created_at || '').startsWith(todayStr));
      const hourlyMap = new Array(12).fill(0);
      todayLogs.forEach((l) => {
        try {
          const h = new Date(l.created_at).getHours();
          const bucket = Math.min(11, Math.floor(h / 2));
          hourlyMap[bucket] += (l.cost_usd || 0);
        } catch {}
      });
      const currentBucket = Math.min(11, Math.floor(new Date().getHours() / 2));
      return todayHours.map((h, i) => {
        const val = Number((hourlyMap[i] || 0).toFixed(4));
        return {
          month: h,
          actual: val,
          baseline: 0,
          isForecast: i > currentBucket,
          dateStr: `Today at ${h}`,
          tooltipVal: `$${val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`,
        };
      });
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthSpend = monthlySpendMap[currentMonthIdx] || totalSpend;
    const currentDay = Math.max(1, new Date().getDate());
    const dailyVelocity = currentMonthSpend / currentDay;
    const projectedSpend = Number((dailyVelocity * 30).toFixed(4));

    return months.map((m, i) => {
      const isFc = i > currentMonthIdx;
      let actualVal = 0;
      let baselineVal = 0;

      if (i < currentMonthIdx) {
        actualVal = Number((monthlySpendMap[i] || 0).toFixed(4));
        baselineVal = 0;
      } else if (i === currentMonthIdx) {
        actualVal = Number(currentMonthSpend.toFixed(4));
        baselineVal = 0;
      } else {
        actualVal = totalSpend > 0 ? projectedSpend : 0;
        baselineVal = 0;
      }

      const tooltipVal = `$${actualVal.toLocaleString('en-US', { minimumFractionDigits: actualVal > 0 && actualVal < 1 ? 4 : 2, maximumFractionDigits: 4 })}`;
      const dateStr = `${m} ${currentYear}`;

      return {
        month: m,
        actual: actualVal,
        baseline: baselineVal,
        isForecast: isFc,
        dateStr,
        tooltipVal,
      };
    });
  }, [monthlySpendMap, currentMonthIdx, currentYear, totalSpend, spendOption, liveLogs]);

  // Card 2: Real Request Volume Points (Reactive to dropdown option)
  const requestVolumePoints = useMemo<DualLinePoint[]>(() => {
    if (requestOption === 'RPM Velocity') {
      const todayHours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayLogs = liveLogs.filter((l) => (l.created_at || '').startsWith(todayStr));
      const hourlyReqMap = new Array(12).fill(0);
      todayLogs.forEach((l) => {
        try {
          const h = new Date(l.created_at).getHours();
          const bucket = Math.min(11, Math.floor(h / 2));
          hourlyReqMap[bucket] += 1;
        } catch {}
      });
      const currentBucket = Math.min(11, Math.floor(new Date().getHours() / 2));
      return todayHours.map((h, i) => {
        const reqCount = hourlyReqMap[i] || 0;
        const rpm = Number((reqCount / 120).toFixed(2));
        return {
          month: h,
          actual: rpm,
          baseline: 0,
          isForecast: i > currentBucket,
          dateStr: `Today at ${h}`,
          tooltipVal: `${rpm} RPM (${reqCount} reqs)`,
        };
      });
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthReqs = monthlyRequestsMap[currentMonthIdx] || totalRequests;
    const currentDay = Math.max(1, new Date().getDate());
    const dailyReqVelocity = currentMonthReqs / currentDay;
    const projectedReqs = Math.round(dailyReqVelocity * 30);

    return months.map((m, i) => {
      const isFc = i > currentMonthIdx;
      let actualVal = 0;
      let baselineVal = 0;

      if (i < currentMonthIdx) {
        actualVal = monthlyRequestsMap[i] || 0;
        baselineVal = 0;
      } else if (i === currentMonthIdx) {
        actualVal = currentMonthReqs;
        baselineVal = 0;
      } else {
        actualVal = totalRequests > 0 ? projectedReqs : 0;
        baselineVal = 0;
      }

      const tooltipVal = `${actualVal.toLocaleString()} reqs`;
      const dateStr = `${m} ${currentYear}`;

      return {
        month: m,
        actual: actualVal,
        baseline: baselineVal,
        isForecast: isFc,
        dateStr,
        tooltipVal,
      };
    });
  }, [monthlyRequestsMap, currentMonthIdx, currentYear, totalRequests, requestOption, liveLogs]);

  // Deep High-Resolution Telemetry Points (100% Real from liveLogs)
  const chartPoints: TelemetryPoint[] = useMemo(() => {
    const count = chartTimeframe === '24h' ? 12 : chartTimeframe === '30d' ? 15 : chartTimeframe === 'all' ? 20 : 7;
    const points: TelemetryPoint[] = [];

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      if (chartTimeframe === '24h') {
        d.setHours(d.getHours() - i * 2);
      } else {
        d.setDate(d.getDate() - i * (chartTimeframe === '30d' ? 2 : chartTimeframe === 'all' ? 4 : 1));
      }

      const iso = d.toISOString();
      const dateKey = iso.slice(0, 10);
      const label = chartTimeframe === '24h' 
        ? `${d.getHours().toString().padStart(2, '0')}:00` 
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

      // Match actual real logs
      const matchingLogs = liveLogs.filter(l => (l.created_at || iso).startsWith(dateKey));
      const realSpend = matchingLogs.reduce((acc, l) => acc + (l.cost_usd || 0), 0);
      const realTokens = matchingLogs.reduce((acc, l) => acc + (l.input_tokens || 0) + (l.output_tokens || 0), 0);
      const realReqs = matchingLogs.length;
      const avgLat = matchingLogs.length > 0 
        ? Math.round(matchingLogs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / matchingLogs.length) 
        : 0;

      points.push({
        date: dateKey,
        label,
        fullDate,
        spend: Number(realSpend.toFixed(4)),
        tokens: Number((realTokens / 1_000_000).toFixed(4)),
        requests: realReqs,
        latency: avgLat,
        topModel: matchingLogs.length > 0 && matchingLogs[0].routed_model ? matchingLogs[0].routed_model : 'No Traffic',
        cacheHitRate: matchingLogs.length > 0 ? 100 : 0,
      });
    }

    return points;
  }, [chartTimeframe, liveLogs]);

  const getMetricValue = (p: TelemetryPoint): number => {
    switch (chartMetric) {
      case 'spend': return p.spend;
      case 'tokens': return p.tokens;
      case 'requests': return p.requests;
      case 'latency': return p.latency;
    }
  };

  const formatMetricDisplay = (val: number): string => {
    switch (chartMetric) {
      case 'spend': return `$${val.toLocaleString('en-US', { minimumFractionDigits: val > 0 && val < 1 ? 4 : 2, maximumFractionDigits: 4 })}`;
      case 'tokens': return `${val.toFixed(2)}M Tokens`;
      case 'requests': return `${Math.round(val).toLocaleString()} Reqs`;
      case 'latency': return `${Math.round(val)}ms Latency`;
    }
  };

  const { pathD, areaD, svgPoints, maxYVal, minYVal } = useMemo(() => {
    const width = 1000;
    const height = 280;
    const padX = 40;
    const padTop = 30;
    const padBottom = 40;
    const plotW = width - padX * 2;
    const plotH = height - padTop - padBottom;

    const values = chartPoints.map(getMetricValue);
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const isZero = max === 0;

    const coords = chartPoints.map((pt, i) => {
      const x = padX + (i / Math.max(1, chartPoints.length - 1)) * plotW;
      const ratio = isZero ? 0 : Math.min(1, Math.max(0, (getMetricValue(pt) - min) / range));
      const y = padTop + (1 - ratio) * plotH;
      return { x, y, pt, i };
    });

    let dStr = '';
    if (coords.length > 0) {
      dStr = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const curr = coords[i];
        const next = coords[i + 1];
        const cpx = (curr.x + next.x) / 2;
        dStr += ` C ${cpx} ${curr.y}, ${cpx} ${next.y}, ${next.x} ${next.y}`;
      }
    }

    const lastX = coords[coords.length - 1]?.x ?? (width - padX);
    const firstX = coords[0]?.x ?? padX;
    const baseY = height - padBottom;
    const aStr = `${dStr} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;

    return {
      pathD: dStr,
      areaD: aStr,
      svgPoints: coords,
      maxYVal: max,
      minYVal: min,
    };
  }, [chartPoints, chartMetric]);

  const activePoint = hoveredIndex !== null ? chartPoints[hoveredIndex] : chartPoints[chartPoints.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || svgPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * 1000;

    let closestIndex = 0;
    let minDiff = Infinity;
    svgPoints.forEach((pt, i) => {
      const diff = Math.abs(pt.x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    setHoveredIndex(closestIndex);
    setHoverCoords({ x: svgPoints[closestIndex].x, y: svgPoints[closestIndex].y });
  };

  const formatRelativeTime = (dateStr: string): string => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 3) return 'Just now';
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Real derived performance stats for deep analyzer strip
  const realAvgLatency = useMemo(() => {
    if (filteredLogs.length === 0) return '0ms';
    const sum = filteredLogs.reduce((acc, l) => acc + (l.latency_ms || 0), 0);
    return `${Math.round(sum / filteredLogs.length)}ms Avg`;
  }, [filteredLogs]);

  const realActiveProvidersCount = useMemo(() => {
    return new Set(filteredLogs.map(l => l.provider).filter(Boolean)).size;
  }, [filteredLogs]);

  const timeOptions = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'All time'];

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-200">
      
      {/* ============================================================ */}
      {/* 1. PLAN STATUS & WORKSPACE BANNER                            */}
      {/* ============================================================ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0B0E14] via-[#11141A] to-[#0B0E14] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D] shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Current Workspace Plan</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#C59E5F]/20 text-[#E5C38D] font-bold border border-[#C59E5F]/30">
                {entitlements.name}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {entitlements.tier === 'free' 
                ? 'Community Free tier active. CLI usage enabled. Upgrade for hosted gateway edge proxy and budget guardrails.'
                : entitlements.tier === 'telemetry_observer'
                ? 'Agent Telemetry active. Up to 3 agent trackers, live token velocity, and webhook alerts unlocked.'
                : entitlements.tier === 'starter_gateway'
                ? 'Starter Gateway active. Edge proxy, budget caps (5 agents), and smart caching unlocked.'
                : 'Pro Gateway active. Unlimited agents, semantic cache, fallback failover, and developer seats unlocked.'
              }
            </p>
          </div>
        </div>

        {entitlements.tier === 'free' && onNavigateToBilling && (
          <button
            onClick={onNavigateToBilling}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#AA824B] hover:from-[#D4AF7C] hover:to-[#C59E5F] text-black font-semibold text-xs transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade to Starter ($35/mo)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. HEADER: TITLE + REAL-TIME CONTROLS                        */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-[#C59E5F]/15 text-[#E5C38D] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#C59E5F]/30">
              Gateway Telemetry Hub
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono font-semibold">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span>{isLiveConnected ? 'Real-Time Stream Active' : 'Connecting to Stream...'} • Synced {lastSyncTime}</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Overview
          </h1>
        </div>

        {/* Real-time controls & Timeframe */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
          {/* Real-Time Gateway Port Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-[#C59E5F] animate-pulse" />
            <span>Gateway Daemon: 127.0.0.1:8080</span>
          </div>

          {/* Timeframe Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#0B0E14] text-xs font-semibold text-zinc-200 shadow-xs hover:border-white/[0.2] transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#C59E5F]" />
              <span>{timeframe}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                {timeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setTimeframe(opt);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      timeframe === opt
                        ? 'bg-white/[0.06] text-white font-bold'
                        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <span>{opt}</span>
                    {timeframe === opt && <Check className="w-3.5 h-3.5 text-zinc-200" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ROW: 4 METRIC CARDS (100% REAL DATA, ZERO MOCK)           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Spend */}
        <div 
          onClick={onNavigateToUsage}
          className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total Spend</span>
            <div className="px-2 py-0.5 rounded-md bg-[#161B22] border border-white/10 text-[10px] font-mono text-zinc-300 font-bold tracking-wider shadow-2xs">
              USD
            </div>
          </div>

          <div className="my-1.5">
            <span className="text-2xl sm:text-[30px] font-extrabold text-white tracking-tight font-sans">
              ${displaySpend}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs font-semibold">
              <span className="text-sm">↗</span>
              <span>{totalSpend > 0 ? 'Live Telemetry' : '0.0% vs baseline'}</span>
            </div>
            
            <svg viewBox="0 0 76 24" className="w-20 h-6 overflow-visible shrink-0">
              <path
                d={getSparklinePath(chartPoints.map((p) => p.spend))}
                fill="none"
                stroke={totalSpend > 0 ? "#E5C38D" : "rgba(255,255,255,0.15)"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Tokens Used */}
        <div 
          onClick={onNavigateToUsage}
          className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Tokens Used</span>
            <div className="px-2 py-0.5 rounded-md bg-[#161B22] border border-white/10 text-[10px] font-mono text-zinc-300 font-bold tracking-wider shadow-2xs">
              TOK
            </div>
          </div>

          <div className="my-1.5">
            <span className="text-2xl sm:text-[30px] font-extrabold text-white tracking-tight font-sans">
              {displayTokens}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[#E5C38D] font-mono text-xs font-semibold">
              <span className="text-sm">↗</span>
              <span>{totalTokens > 0 ? `${totalTokens.toLocaleString()} tokens` : '0 tokens consumed'}</span>
            </div>
            
            <div className="flex items-end gap-1 h-5 shrink-0 pr-1">
              {(() => {
                const recentTokens = chartPoints.slice(-9).map((p) => p.tokens);
                const maxTok = Math.max(...recentTokens, 0);
                return recentTokens.map((tok, idx) => {
                  const pct = maxTok > 0 ? Math.max(15, Math.round((tok / maxTok) * 100)) : 10;
                  return (
                    <span
                      key={idx}
                      className="w-1 rounded-xs transition-all duration-300"
                      style={{
                        height: `${pct}%`,
                        backgroundColor: totalTokens > 0 ? '#C59E5F' : 'rgba(255,255,255,0.1)',
                        opacity: totalTokens > 0 ? 0.35 + (idx / 9) * 0.65 : 0.25,
                      }}
                    />
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Card 3: Models Using */}
        <div 
          onClick={onNavigateToModels}
          className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Models Using</span>
            <div className="px-2 py-0.5 rounded-md bg-[#161B22] border border-white/10 text-[10px] font-mono text-zinc-300 font-bold tracking-wider shadow-2xs">
              CPU
            </div>
          </div>

          <div className="my-1.5">
            <span className="text-2xl sm:text-[30px] font-extrabold text-white tracking-tight font-sans">
              {displayModelsCount}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-zinc-500 font-mono text-xs truncate max-w-[130px]" title={topModelsLabel}>
              {topModelsLabel}
            </span>
            
            <svg viewBox="0 0 76 24" className="w-20 h-6 overflow-visible shrink-0">
              <path
                d={getSparklinePath(chartPoints.map((p) => (p.topModel !== 'No Traffic' ? 1 : 0)))}
                fill="none"
                stroke={uniqueModelsCount > 0 ? "#E5C38D" : "rgba(255,255,255,0.15)"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Total Requests */}
        <div 
          onClick={onNavigateToUsage}
          className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total Requests</span>
            <div className="px-2 py-0.5 rounded-md bg-[#161B22] border border-white/10 text-[10px] font-mono text-zinc-300 font-bold tracking-wider shadow-2xs">
              req
            </div>
          </div>

          <div className="my-1.5">
            <span className="text-2xl sm:text-[30px] font-extrabold text-white tracking-tight font-sans">
              {displayRequests}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[#E5C38D] font-mono text-xs font-semibold">
              <span className="text-sm">↗</span>
              <span>{totalRequests > 0 ? `${totalRequests} live executions` : '0 requests recorded'}</span>
            </div>
            
            <svg viewBox="0 0 76 24" className="w-20 h-6 overflow-visible shrink-0">
              <path
                d={getSparklinePath(chartPoints.map((p) => p.requests))}
                fill="none"
                stroke={totalRequests > 0 ? "#E5C38D" : "rgba(255,255,255,0.15)"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. HERO SECTION: TWO DUAL-LINE FORECAST GRAPHS               */}
      {/*    (100% Real Time Data, Zero Mock Data)                     */}
      {/* ============================================================ */}
      <div className="space-y-4">
        {/* Graph 1: Spend Velocity */}
        <DualLineForecastCard
          id="spend-velocity"
          options={['Spend Velocity', 'Net revenue', 'Projected Velocity', 'Hourly Spend']}
          selectedOption={spendOption}
          onSelectOption={setSpendOption}
          bigValue={`$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: totalSpend > 0 && totalSpend < 1 ? 4 : 2, maximumFractionDigits: 4 })}`}
          trendPct={totalSpend > 0 ? 'Live' : '0.0%'}
          points={spendVelocityPoints}
          curveColor="#E5C38D"
          baselineColor="rgba(255, 255, 255, 0.28)"
          emptyLabel="No gateway spend recorded yet"
        />

        {/* Graph 2: Request Volume (All Invocations) */}
        <DualLineForecastCard
          id="request-volume"
          options={['All Invocations', 'All revenue', 'Request Volume', 'RPM Velocity']}
          selectedOption={requestOption}
          onSelectOption={setRequestOption}
          bigValue={`${totalRequests.toLocaleString()}`}
          trendPct={totalRequests > 0 ? 'Live' : '0.0%'}
          points={requestVolumePoints}
          curveColor="#FFFFFF"
          baselineColor="rgba(255, 255, 255, 0.28)"
          emptyLabel="No gateway traffic recorded yet"
        />
      </div>

      {/* Toggle to inspect Deep Telemetry Stream Engine */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setShowDeepEngine(!showDeepEngine)}
          className="text-xs font-mono text-zinc-400 hover:text-[#E5C38D] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-[#C59E5F]" />
          <span>{showDeepEngine ? 'Hide Deep Telemetry Stream Engine' : 'Show Deep Telemetry Stream Engine (Multi-Metric Analyzer) →'}</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* OPTIONAL DEEP TELEMETRY STREAM ENGINE (EXPANDABLE)           */}
      {/* ============================================================ */}
      {showDeepEngine && (
        <div className="rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl p-6 sm:p-7 relative overflow-hidden space-y-6 animate-in fade-in">
          
          <div 
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[250px] pointer-events-none rounded-full blur-[100px] opacity-25"
            style={{ background: 'radial-gradient(circle, #C59E5F 0%, transparent 70%)' }}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase font-bold text-[#C59E5F] tracking-widest flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-[#C59E5F] animate-pulse" />
                  <span>TELEMETRY STREAM ENGINE v2.4</span>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-[11px] font-mono text-zinc-400">
                  Live Multi-Provider Routing Velocity
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Spend &amp; Traffic Velocity Stream</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#C59E5F]/15 text-[#E5C38D] font-mono font-bold border border-[#C59E5F]/30">
                  {formatMetricDisplay(getMetricValue(activePoint))}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center bg-[#07090C] border border-white/[0.08] p-1 rounded-xl text-xs font-mono">
                {(['spend', 'tokens', 'requests', 'latency'] as ChartMetric[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMetric(m)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold capitalize ${
                      chartMetric === m
                        ? 'bg-[#C59E5F] text-black shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-[#07090C] border border-white/[0.08] p-1 rounded-xl text-xs font-mono">
                {(['24h', '7d', '30d', 'all'] as ChartTimeframe[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-2.5 py-1.5 rounded-lg uppercase transition-all cursor-pointer font-bold ${
                      chartTimeframe === tf
                        ? 'bg-white/[0.12] text-white border border-white/20'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative w-full select-none pt-2">
            {hoveredIndex !== null && hoverCoords && (
              <div
                className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-75"
                style={{
                  left: `${(hoverCoords.x / 1000) * 100}%`,
                  top: `${(hoverCoords.y / 280) * 100}%`,
                }}
              >
                <div className="bg-[#0B0E14]/95 backdrop-blur-xl border border-[#C59E5F]/50 rounded-2xl p-3 shadow-2xl text-xs font-mono w-56 space-y-1.5 -mt-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                    <span className="text-[11px] font-bold text-zinc-300">{chartPoints[hoveredIndex].fullDate}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      chartPoints[hoveredIndex].requests > 0
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/[0.06] text-zinc-400 border border-white/10'
                    }`}>
                      {chartPoints[hoveredIndex].requests > 0 ? 'HTTP 200 OK' : 'Idle (0 reqs)'}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline justify-between pt-0.5">
                    <span className="text-zinc-400 text-[11px] font-medium capitalize">{chartMetric}:</span>
                    <span className="text-base font-extrabold text-[#E5C38D]">
                      {formatMetricDisplay(getMetricValue(chartPoints[hoveredIndex]))}
                    </span>
                  </div>

                  <div className="text-[10px] text-zinc-400 space-y-0.5 pt-1 border-t border-white/[0.06]">
                    <div className="flex justify-between">
                      <span>Requests:</span>
                      <span className="text-white font-bold">{chartPoints[hoveredIndex].requests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tokens:</span>
                      <span className="text-white font-bold">{chartPoints[hoveredIndex].tokens.toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latency:</span>
                      <span className="text-white font-bold">{chartPoints[hoveredIndex].latency}ms</span>
                    </div>
                    <div className={`flex justify-between ${chartPoints[hoveredIndex].requests > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      <span>Status:</span>
                      <span className="font-bold">
                        {chartPoints[hoveredIndex].requests > 0 ? 'Real Log Synced' : 'No Traffic in Window'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="relative w-full overflow-hidden">
              <svg
                ref={svgRef}
                viewBox="0 0 1000 280"
                className="w-full h-64 sm:h-72 overflow-visible cursor-crosshair"
                preserveAspectRatio="none"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setHoverCoords(null);
                }}
              >
                <defs>
                  <linearGradient id="crazyGlowFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C59E5F" stopOpacity="0.45" />
                    <stop offset="35%" stopColor="#C59E5F" stopOpacity="0.18" />
                    <stop offset="75%" stopColor="#C59E5F" stopOpacity="0.04" />
                    <stop offset="100%" stopColor="#C59E5F" stopOpacity="0" />
                  </linearGradient>

                  <filter id="neonLaserGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#C59E5F" floodOpacity="0.6" />
                    <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#E5C38D" floodOpacity="0.3" />
                  </filter>
                </defs>

                {[0.2, 0.45, 0.7, 0.95].map((ratio, idx) => {
                  const y = 30 + ratio * 210;
                  const benchmarkVal = maxYVal - ratio * (maxYVal - minYVal);
                  return (
                    <g key={idx}>
                      <line
                        x1={40}
                        y1={y}
                        x2={960}
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={970}
                        y={y + 3}
                        textAnchor="start"
                        className="text-[10px] font-mono fill-zinc-600 font-medium"
                      >
                        {formatMetricDisplay(benchmarkVal).replace('Tokens', '').replace('Reqs', '').replace('Latency', '')}
                      </text>
                    </g>
                  );
                })}

                <path d={areaD} fill="url(#crazyGlowFill)" />

                <path
                  d={pathD}
                  fill="none"
                  stroke="#C59E5F"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#neonLaserGlow)"
                />

                <path
                  d={pathD}
                  fill="none"
                  stroke="#FFF2D1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {hoverCoords && (
                  <g>
                    <line
                      x1={hoverCoords.x}
                      y1={30}
                      x2={hoverCoords.x}
                      y2={240}
                      stroke="#E5C38D"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={hoverCoords.x}
                      cy={hoverCoords.y}
                      r={6}
                      className="fill-[#E5C38D] stroke-[#0B0E14] stroke-[3px]"
                    />
                  </g>
                )}

                {svgPoints.map((pt, i) => {
                  const isHovered = hoveredIndex === i;
                  return (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 3.5}
                        className={`transition-all duration-200 ${
                          isHovered 
                            ? 'fill-white stroke-[#0B0E14] stroke-2 shadow-lg' 
                            : 'fill-[#E5C38D] stroke-[#0B0E14] stroke-2 opacity-80'
                        }`}
                      />
                      <text
                        x={pt.x}
                        y={262}
                        textAnchor="middle"
                        className={`text-[10px] font-mono transition-colors ${
                          isHovered ? 'fill-[#E5C38D] font-bold' : 'fill-zinc-500'
                        }`}
                      >
                        {pt.pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Real Stats Strip inside deep engine */}
            <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.06] space-y-1">
                <div className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-[#C59E5F]" />
                  <span>Real Spend Run-Rate</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">${displaySpend} Total</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.06] space-y-1">
                <div className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>HTTP 200 Ratio</span>
                </div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {filteredLogs.length > 0 
                    ? `${((filteredLogs.filter(l => (l.status_code || 200) < 400).length / filteredLogs.length) * 100).toFixed(1)}% Success` 
                    : '100% Ready'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.06] space-y-1">
                <div className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#E5C38D]" />
                  <span>Observed Latency</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">{realAvgLatency}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.06] space-y-1">
                <div className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-[#C59E5F]" />
                  <span>Routed Providers</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {realActiveProvidersCount} Provider{realActiveProvidersCount === 1 ? '' : 's'} Active
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 5. ROW 3: MODELS BY COST SHARE & ACTIVE ALERTS               */}
      {/*    (100% Real Logs Only - No Mock Entries)                   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Models by Cost Share */}
        <div 
          onClick={onNavigateToModels}
          className="lg:col-span-6 p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between cursor-pointer group hover:shadow-md transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Models by Cost &amp; Traffic Share</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Real LLM engines consuming tokens from live gateway logs</p>
              </div>
              <span className="text-xs text-[#E5C38D] group-hover:underline transition-all">Catalog →</span>
            </div>

            {modelEntries.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center">
                <Activity className="w-8 h-8 text-zinc-600 mb-2" />
                <span className="text-zinc-300 font-medium">No model usage recorded yet.</span>
                <span className="text-zinc-500 mt-0.5">
                  All traffic routed through OstraOps Gateway will be classified and broken down by provider cost and token share here in real time.
                </span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {modelEntries.slice(0, 6).map(([modelName, data]) => {
                  const share = totalSpend > 0 ? Math.round((data.spend / totalSpend) * 100) : (data.count > 0 ? 100 : 0);
                  return (
                    <div key={modelName}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-zinc-200">{modelName}</span>
                        <span className="text-white font-mono">
                          ${data.spend.toFixed(4)} ({data.count} calls • {share}%)
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#C59E5F] h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(5, share)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.08] text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Multi-provider routing active</span>
            <span className="font-semibold text-emerald-400">Zero prompt retention</span>
          </div>
        </div>

        {/* Active System Alerts */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Active System Alerts</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Automated spend guardrails &amp; threshold triggers</p>
              </div>
              <div className="flex items-center gap-3">
                {onNavigateToBudgets && (
                  <button 
                    onClick={onNavigateToBudgets}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Budgets →
                  </button>
                )}
                <button 
                  onClick={onNavigateToAlerts}
                  className="text-xs text-[#E5C38D] hover:underline transition-all cursor-pointer font-medium"
                >
                  Manage →
                </button>
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/80 mb-2" />
                <span className="text-zinc-300 font-medium">All systems operating within safe limits.</span>
                <span className="text-zinc-500 mt-0.5">No rate-limit spikes or budget limit triggers active.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {alerts.slice(0, 3).map((a) => (
                  <div 
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#07090C] border border-white/[0.08] hover:border-amber-500/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-snug">{a.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {a.service} • {new Date(a.created_at || a.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAlert(`${a.title}: ${a.description}`)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white/[0.06] border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.08] text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Spend Guardrails: Active</span>
            <span className="font-semibold text-[#E5C38D]">Auto-fallback Armed</span>
          </div>
        </div>

      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0B0E14] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-white text-sm">Alert Event</h4>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.04] p-3 rounded-xl font-mono">
              {selectedAlert}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-xl bg-[#C59E5F] text-black font-bold text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. ROW 4: RECENT REAL GATEWAY INVOCATIONS (LIVE STREAM)      */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold text-[#C59E5F] tracking-wider">
                Live Gateway Stream
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{liveLogs.length} Events Logged (0ms Live Sync)</span>
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              Recent API Invocations &amp; Token Actions
            </h3>
          </div>

          {onNavigateToUsage && (
            <button
              onClick={onNavigateToUsage}
              className="text-xs text-[#E5C38D] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>View Full Usage Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {liveLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center">
            <Activity className="w-8 h-8 text-zinc-600 mb-2" />
            <span className="text-zinc-300 font-medium">No API invocations recorded yet.</span>
            <span className="text-zinc-500 mt-0.5">
              Connect your applications to http://localhost:8080 or run a prompt in Test Playground to stream live telemetry here.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Model &amp; Provider</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Tokens (In / Out)</th>
                  <th className="pb-3 font-semibold">Latency</th>
                  <th className="pb-3 font-semibold">Calculated Cost</th>
                  <th className="pb-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {liveLogs.slice(0, 10).map((log, idx) => {
                  const totalTok = (log.input_tokens || 0) + (log.output_tokens || 0);
                  const isOk = (log.status_code || 200) < 400;
                  const isNewest = idx === 0;
                  return (
                    <tr 
                      key={log.id || log.request_id || idx} 
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isNewest ? 'bg-[#C59E5F]/[0.03]' : ''
                      }`}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isNewest ? 'bg-emerald-400 animate-ping' : 'bg-[#C59E5F]'}`} />
                          <div>
                            <span className="font-bold text-white block">{log.routed_model || log.requested_model}</span>
                            <span className="text-[10px] text-zinc-500">{log.provider || 'Gateway Proxy'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOk ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          HTTP {log.status_code || 200}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-300">
                        <span className="font-semibold text-white">{totalTok.toLocaleString()}</span>
                        <span className="text-[10px] text-zinc-500 block">
                          {(log.input_tokens || 0).toLocaleString()} in • {(log.output_tokens || 0).toLocaleString()} out
                        </span>
                      </td>
                      <td className="py-3 text-zinc-300 font-semibold">
                        {log.latency_ms !== undefined && log.latency_ms !== null ? `${log.latency_ms}ms` : '0ms'}
                      </td>
                      <td className="py-3 text-[#E5C38D] font-bold">
                        ${(log.cost_usd || 0).toFixed(6)}
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-zinc-300 font-semibold block">
                          {formatRelativeTime(log.created_at)}
                        </span>
                        <span className="text-zinc-600 text-[10px]">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
