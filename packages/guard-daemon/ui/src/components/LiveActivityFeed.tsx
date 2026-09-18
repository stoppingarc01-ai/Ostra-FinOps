import React, { useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Activity, Search, X, Zap, CheckCircle2, AlertCircle, Radio } from 'lucide-react';
import type { TraceRecord } from '../types';

interface LiveActivityFeedProps {
  traces: TraceRecord[];
  onSelectTrace: (trace: TraceRecord) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  traces,
  onSelectTrace,
  onLoadMore,
  hasMore,
  loading,
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [filterQuery, setFilterQuery] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredTraces = traces.filter((t) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      t.requestedModel.toLowerCase().includes(q) ||
      t.routedModel.toLowerCase().includes(q) ||
      t.requestId.toLowerCase().includes(q) ||
      t.provider.toLowerCase().includes(q)
    );
  });

  const virtualizer = useVirtualizer({
    count: filteredTraces.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (viewMode === 'timeline' ? 70 : 44),
    overscan: 6,
  });

  const handleScroll = () => {
    if (!parentRef.current || loading || !hasMore || !onLoadMore) return;
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    if (scrollHeight - (scrollTop + clientHeight) < 150) {
      onLoadMore();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EAE4D8] shadow-subtle flex flex-col h-[520px] overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[#F5F2EB] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#C59E5F]" />
          <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">Live Activity</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5F2EB] text-charcoal-700 font-bold font-mono">
            {filteredTraces.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-32 sm:w-40 pl-8 pr-6 py-1 text-xs bg-[#FAF8F5] border border-[#EAE4D8] rounded-lg text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#C59E5F]"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-800"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F5F2EB] p-0.5 rounded-lg border border-[#E8E2D5]">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Table Column Headers (Table Mode Only) */}
      {viewMode === 'table' && (
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-[#FAF8F5] border-b border-[#F5F2EB] text-[10px] font-bold text-charcoal-500 uppercase tracking-wider select-none font-mono">
          <div className="col-span-2">Time</div>
          <div className="col-span-2">Req ID</div>
          <div className="col-span-4">Model Routing</div>
          <div className="col-span-2 text-right">Tokens</div>
          <div className="col-span-1 text-right">Latency</div>
          <div className="col-span-1 text-center">Status</div>
        </div>
      )}

      {/* Virtualized Event List / Table */}
      <div
        ref={parentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto divide-y divide-[#F5F2EB]"
      >
        {filteredTraces.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-charcoal-400">
            <div className="w-10 h-10 rounded-xl bg-[#F5F2EB] border border-[#E8E2D5] flex items-center justify-center mb-2">
              <Radio className="w-5 h-5 text-charcoal-500" />
            </div>
            <p className="text-xs font-bold text-charcoal-800">No live traces recorded yet</p>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              Requests to 127.0.0.1:4040 will appear here automatically
            </p>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const trace = filteredTraces[virtualRow.index];
              const isError = trace.statusCode >= 400 || !!trace.errorMessage;
              const isFailover = (trace as any).isFailover || trace.requestedModel !== trace.routedModel;
              const totalTokens = (trace.inputTokens || 0) + (trace.outputTokens || 0);
              const duration = trace.durationMs ?? (trace as any).latencyMs ?? 0;

              if (viewMode === 'table') {
                return (
                  <div
                    key={trace.id || virtualRow.index}
                    onClick={() => onSelectTrace(trace)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                      height: `${virtualRow.size}px`,
                    }}
                    className="grid grid-cols-12 gap-2 px-4 items-center text-xs font-mono hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                  >
                    <div className="col-span-2 text-charcoal-500 text-[11px]">
                      {formatTime(trace.timestamp)}
                    </div>
                    <div className="col-span-2 truncate font-bold text-charcoal-900 text-[11px]">
                      {trace.requestId ? trace.requestId.slice(0, 10) : '—'}
                    </div>
                    <div className="col-span-4 truncate flex items-center gap-1.5">
                      <span className="text-charcoal-900 font-medium">{trace.routedModel}</span>
                      {isFailover && (
                        <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 text-[9px] rounded font-bold border border-amber-200 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" />
                          <span>Failover</span>
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-right text-charcoal-600 text-[11px]">
                      {totalTokens.toLocaleString()}
                    </div>
                    <div className="col-span-1 text-right text-charcoal-500 text-[11px]">
                      {duration}ms
                    </div>
                    <div className="col-span-1 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isError
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {trace.statusCode}
                      </span>
                    </div>
                  </div>
                );
              }

              // Timeline View Row
              return (
                <div
                  key={trace.id || virtualRow.index}
                  onClick={() => onSelectTrace(trace)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    height: `${virtualRow.size}px`,
                  }}
                  className="px-4 py-3 flex items-center justify-between hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isError ? 'bg-rose-500' : isFailover ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-charcoal-900 truncate">
                          {trace.routedModel}
                        </span>
                        {isFailover && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" />
                            <span>Failover from {trace.requestedModel}</span>
                          </span>
                        )}
                        <span className="text-[11px] text-charcoal-400 font-mono">
                          {trace.requestId ? trace.requestId.slice(0, 10) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-charcoal-500 mt-0.5 font-mono">
                        <span className="uppercase text-charcoal-600">{trace.provider}</span>
                        <span>•</span>
                        <span>{totalTokens.toLocaleString()} tokens</span>
                        <span>•</span>
                        <span>{duration}ms</span>
                        <span>•</span>
                        <span className="text-charcoal-900 font-bold">
                          ${(trace.costUsd || 0).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-charcoal-400 font-mono">
                      {formatTime(trace.timestamp)}
                    </span>
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                        isError
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isError ? (
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>{trace.statusCode || 200}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
