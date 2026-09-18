import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Zap, AlertCircle, CheckCircle2, Clock, DollarSign, Cpu } from 'lucide-react';
import type { TraceRecord } from '../types';

interface TraceDetailModalProps {
  trace: TraceRecord | null;
  onClose: () => void;
}

export const TraceDetailModal: React.FC<TraceDetailModalProps> = ({ trace, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && trace) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trace, onClose]);

  if (!trace) return null;

  const isError = trace.statusCode >= 400 || Boolean(trace.errorMessage);
  const isFailover = (trace as any).isFailover || trace.requestedModel.toLowerCase() !== trace.routedModel.toLowerCase();
  const totalTokens = (trace.inputTokens || 0) + (trace.outputTokens || 0);
  const duration = trace.durationMs ?? (trace as any).latencyMs ?? 0;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(trace, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans animate-in fade-in duration-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white border border-[#EAE4D8] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-dashboard-3d">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F5F2EB] flex items-center justify-between bg-[#FCFAF7]">
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-bold font-mono ${
                isError
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isError ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{trace.statusCode} {isError ? 'ERR' : 'OK'}</span>
            </span>
            <div>
              <h3 id="modal-title" className="text-sm font-bold text-charcoal-900 truncate max-w-md">
                {trace.routedModel}
              </h3>
              <p className="text-[11px] text-charcoal-500 font-mono">
                ID: <span className="text-charcoal-800 font-bold">{trace.requestId || trace.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-900 rounded-lg hover:bg-[#F5F2EB] transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {isFailover && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Autonomous Failover Triggered:</span> Requested{' '}
                <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-amber-950 font-bold">
                  {trace.requestedModel}
                </code>{' '}
                was redirected to backup model{' '}
                <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-amber-950 font-bold">
                  {trace.routedModel}
                </code>.
              </div>
            </div>
          )}

          {trace.errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error Message:</span> {trace.errorMessage}
              </div>
            </div>
          )}

          {/* Quick Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE4D8]">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-charcoal-500 font-mono">
                <DollarSign className="w-3 h-3 text-[#C59E5F]" />
                <span>Cost</span>
              </div>
              <div className="text-base font-bold text-charcoal-900 font-mono mt-0.5">
                ${(trace.costUsd || 0).toFixed(6)}
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE4D8]">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-charcoal-500 font-mono">
                <Clock className="w-3 h-3 text-charcoal-500" />
                <span>Latency</span>
              </div>
              <div className="text-base font-bold text-charcoal-900 font-mono mt-0.5">{duration}ms</div>
              {trace.ttftMs ? (
                <div className="text-[10px] text-charcoal-500 font-mono mt-0.5">TTFT: {trace.ttftMs}ms</div>
              ) : null}
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE4D8]">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-charcoal-500 font-mono">
                <Cpu className="w-3 h-3 text-charcoal-500" />
                <span>Tokens</span>
              </div>
              <div className="text-base font-bold text-charcoal-900 font-mono mt-0.5">
                {totalTokens.toLocaleString()}
              </div>
              <div className="text-[10px] text-charcoal-500 font-mono mt-0.5">
                {trace.inputTokens || 0} in / {trace.outputTokens || 0} out
              </div>
            </div>
          </div>

          {/* Technical Metadata */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE4D8] space-y-2">
            <div className="text-[11px] font-bold text-charcoal-700 border-b border-[#EAE4D8] pb-1.5 uppercase font-mono tracking-wider">
              Technical Trace Details
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-[11px] font-mono">
              <div>
                <span className="text-charcoal-500">Provider:</span>{' '}
                <span className="text-charcoal-900 font-bold uppercase">{trace.provider}</span>
              </div>
              <div>
                <span className="text-charcoal-500">Streaming:</span>{' '}
                <span className="text-charcoal-900 font-medium">{trace.stream ? 'Yes (SSE)' : 'No'}</span>
              </div>
              <div>
                <span className="text-charcoal-500">Session ID:</span>{' '}
                <span className="text-charcoal-900 truncate">{trace.sessionId || 'default'}</span>
              </div>
              <div>
                <span className="text-charcoal-500">Recorded:</span>{' '}
                <span className="text-charcoal-900">
                  {trace.createdAt || new Date(trace.timestamp).toISOString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#F5F2EB] bg-[#FCFAF7] flex items-center justify-between text-xs">
          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 rounded-xl bg-[#F5F2EB] hover:bg-[#EAE3D2] text-charcoal-800 font-semibold transition-colors flex items-center gap-1.5 border border-[#E8E2D5] cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#18181B] hover:bg-black text-white font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
