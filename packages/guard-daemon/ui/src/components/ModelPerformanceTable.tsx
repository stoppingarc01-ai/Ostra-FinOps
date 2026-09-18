import React from 'react';
import type { TraceRecord } from '../types';

interface ModelPerformanceTableProps {
  traces?: TraceRecord[];
}

interface ModelMetrics {
  name: string;
  provider: string;
  iconColor: string;
  requests: number;
  latency: string;
  success: string;
  cost: string;
  sparkline: string;
}

export const ModelPerformanceTable: React.FC<ModelPerformanceTableProps> = ({ traces = [] }) => {
  // Compute metrics per model from real trace data
  const modelStats: Record<
    string,
    {
      provider: string;
      totalRequests: number;
      successRequests: number;
      totalDurationMs: number;
      totalCostUsd: number;
      totalTokens: number;
    }
  > = {};

  for (const t of traces) {
    const model = t.routedModel || t.requestedModel || 'unknown';
    if (!modelStats[model]) {
      modelStats[model] = {
        provider: t.provider || 'openai',
        totalRequests: 0,
        successRequests: 0,
        totalDurationMs: 0,
        totalCostUsd: 0,
        totalTokens: 0,
      };
    }
    const stat = modelStats[model];
    stat.totalRequests++;
    if (t.statusCode >= 200 && t.statusCode < 400 && !t.errorMessage) {
      stat.successRequests++;
    }
    stat.totalDurationMs += t.durationMs || 0;
    stat.totalCostUsd += t.costUsd || 0;
    stat.totalTokens += (t.inputTokens || 0) + (t.outputTokens || 0);
  }

  const models: ModelMetrics[] = Object.entries(modelStats).map(([modelName, s]) => {
    const isAnthropic = s.provider.toLowerCase().includes('anthropic') || modelName.includes('claude');
    const isDeepSeek = s.provider.toLowerCase().includes('deepseek') || modelName.includes('deepseek');
    const isGoogle = s.provider.toLowerCase().includes('google') || modelName.includes('gemini');

    const iconColor = isAnthropic
      ? 'bg-amber-800 text-amber-200'
      : isDeepSeek
      ? 'bg-blue-900 text-blue-200'
      : isGoogle
      ? 'bg-sky-800 text-sky-200'
      : 'bg-emerald-900 text-emerald-300';

    const avgLatencySec = s.totalRequests > 0 ? (s.totalDurationMs / s.totalRequests / 1000).toFixed(2) + 's' : '0s';
    const successRate = s.totalRequests > 0 ? ((s.successRequests / s.totalRequests) * 100).toFixed(1) + '%' : '100%';
    const costPer1k =
      s.totalTokens > 0
        ? `$${((s.totalCostUsd / s.totalTokens) * 1000).toFixed(4)}`
        : '$0.0000';

    return {
      name: modelName,
      provider: isAnthropic ? 'Anthropic' : isDeepSeek ? 'DeepSeek' : isGoogle ? 'Google' : 'OpenAI',
      iconColor,
      requests: s.totalRequests,
      latency: avgLatencySec,
      success: successRate,
      cost: costPer1k,
      sparkline: 'M0,16 Q15,11 30,13 T60,7',
    };
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between font-sans h-full">
      {/* Title */}
      <div className="pb-3 border-b border-[#F5F2EB] flex items-center justify-between">
        <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">Model Performance</h3>
        <span className="text-[11px] font-mono text-charcoal-400">
          {models.length} {models.length === 1 ? 'model' : 'models'} tracked
        </span>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-12 gap-2 py-2 text-[10px] font-mono uppercase text-charcoal-400 border-b border-[#F5F2EB]">
        <div className="col-span-3">Model</div>
        <div className="col-span-2 text-right">Requests</div>
        <div className="col-span-2 text-right">Avg. Latency</div>
        <div className="col-span-2 text-right">Success</div>
        <div className="col-span-2 text-right">Cost/1K</div>
        <div className="col-span-1 text-center">Trend</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#F5F2EB] flex-1 min-h-[160px]">
        {models.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <p className="text-xs font-semibold text-charcoal-600">No model telemetry recorded yet</p>
            <p className="text-[11px] text-charcoal-400 mt-1 max-w-sm">
              Point your AI tools (Cursor, Cline, LangChain) to <code className="text-emerald-800 font-mono bg-emerald-50 px-1 rounded">http://127.0.0.1:8080/v1</code> to start intercepting traces.
            </p>
          </div>
        ) : (
          models.map((m) => (
            <div
              key={m.name}
              className="grid grid-cols-12 gap-2 py-2.5 items-center text-xs hover:bg-[#FAF8F5] transition-colors"
            >
              {/* Model Name & Icon */}
              <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${m.iconColor}`}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-charcoal-900 truncate text-xs">{m.name}</div>
                  <div className="text-[10px] text-charcoal-400 truncate">{m.provider}</div>
                </div>
              </div>

              {/* Requests */}
              <div className="col-span-2 text-right font-mono text-charcoal-700 text-xs">
                {m.requests}
              </div>

              {/* Latency */}
              <div className="col-span-2 text-right font-mono text-charcoal-600 text-xs">
                {m.latency}
              </div>

              {/* Success */}
              <div className="col-span-2 text-right font-mono text-emerald-700 font-medium text-xs">
                {m.success}
              </div>

              {/* Cost */}
              <div className="col-span-2 text-right font-mono text-charcoal-700 text-xs">
                {m.cost}
              </div>

              {/* Sparkline */}
              <div className="col-span-1 flex justify-center">
                <svg viewBox="0 0 40 18" className="w-9 h-3.5 overflow-visible">
                  <path
                    d={m.sparkline}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
