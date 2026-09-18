import React, { useEffect } from 'react';
import { AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';
import type { AlertItem } from '../types';

interface AlertQueueProps {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export const AlertQueue: React.FC<AlertQueueProps> = ({ alerts, onDismiss, onClearAll }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && alerts.length > 0) {
        onClearAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alerts.length, onClearAll]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 text-xs font-sans">
      <div className="flex items-center justify-between text-[11px] text-charcoal-500 px-1 font-semibold font-mono">
        <span>ACTIVE SENTINEL ALERTS ({alerts.length})</span>
        <button
          onClick={onClearAll}
          className="text-charcoal-700 hover:text-charcoal-950 underline cursor-pointer"
        >
          Clear all (Esc)
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';

          const bg = isCritical
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : isWarning
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900';

          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-subtle ${bg}`}
            >
              <div className="flex items-center gap-3">
                {isCritical ? (
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-xs">{alert.title}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">{alert.message}</div>
                </div>
              </div>

              <button
                onClick={() => onDismiss(alert.id)}
                className="opacity-50 hover:opacity-100 p-1 text-charcoal-700 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
