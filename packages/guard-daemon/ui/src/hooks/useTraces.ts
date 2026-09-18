import { useState, useEffect, useCallback, useRef } from 'react';
import type { TraceRecord, TraceFiltersState } from '../types';

export function useTraces(filters: TraceFiltersState) {
  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);

  const tracesMapRef = useRef<Map<string, TraceRecord>>(new Map());

  // Fetch initial traces matching filters
  const fetchTraces = useCallback(async (isInitial = true) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');

      if (!isInitial && nextCursor) {
        params.set('cursor', String(nextCursor));
      }
      if (filters.provider && filters.provider !== 'all') {
        params.set('provider', filters.provider);
      }
      if (filters.status && filters.status !== 'all') {
        params.set('status', filters.status);
      }
      if (filters.search) {
        params.set('search', filters.search);
      }

      const res = await fetch(`/api/traces?${params.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const incoming: TraceRecord[] = data.traces || [];

        if (isInitial) {
          tracesMapRef.current.clear();
          for (const t of incoming) {
            tracesMapRef.current.set(t.id, t);
          }
        } else {
          for (const t of incoming) {
            tracesMapRef.current.set(t.id, t);
          }
        }

        const sorted = Array.from(tracesMapRef.current.values()).sort(
          (a, b) => b.timestamp - a.timestamp
        );
        setTraces(sorted);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error('Failed to fetch traces:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, nextCursor]);

  // Refetch when filters change
  useEffect(() => {
    fetchTraces(true);
  }, [filters.provider, filters.status, filters.search]);

  // Ingest real-time trace from SSE
  const ingestLiveTrace = useCallback((trace: TraceRecord) => {
    // Check if live trace matches active filter
    if (filters.provider !== 'all' && trace.provider.toLowerCase() !== filters.provider.toLowerCase()) {
      return;
    }
    if (filters.status === 'error' && trace.statusCode < 400 && !trace.errorMessage) {
      return;
    }
    if (filters.status === 'success' && (trace.statusCode >= 400 || trace.errorMessage)) {
      return;
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const match =
        trace.requestedModel.toLowerCase().includes(s) ||
        trace.routedModel.toLowerCase().includes(s) ||
        (trace.errorMessage && trace.errorMessage.toLowerCase().includes(s));
      if (!match) return;
    }

    tracesMapRef.current.set(trace.id, trace);
    setTraces((prev) => {
      // Prevent duplicates and keep memory bounded to 5,000 items
      const next = [trace, ...prev.filter((t) => t.id !== trace.id)];
      if (next.length > 5000) {
        next.pop();
      }
      return next;
    });
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && nextCursor) {
      fetchTraces(false);
    }
  }, [loading, hasMore, nextCursor, fetchTraces]);

  const refreshAll = useCallback(() => {
    fetchTraces(true);
  }, [fetchTraces]);

  return {
    traces,
    loading,
    hasMore,
    ingestLiveTrace,
    loadMore,
    refreshAll,
  };
}
