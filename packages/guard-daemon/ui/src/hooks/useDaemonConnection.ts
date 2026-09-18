import { useEffect, useRef, useCallback } from 'react';
import type { SseEnvelope, TraceRecord } from '../types';
import type { DashboardState } from '../state/reducer';
import type { DashboardAction } from '../state/actions';

interface UseDaemonConnectionProps {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
}

export function useDaemonConnection({ state, dispatch }: UseDaemonConnectionProps) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isDestroyedRef = useRef(false);

  // Fetch full session snapshot from REST
  const fetchSessionSnapshot = useCallback(async () => {
    try {
      const res = await fetch('/api/session', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        dispatch({
          type: 'UPDATE_SNAPSHOT',
          payload: {
            summary: data.summary,
            velocity: data.velocity,
            budget: data.budget,
          },
        });
      }
    } catch (err) {
      console.warn('[DaemonConnection] Failed to fetch session snapshot:', err);
    }
  }, [dispatch]);

  // Fetch initial / full sync traces from REST
  const fetchFullSync = useCallback(async () => {
    dispatch({ type: 'SET_CONNECTION_STATE', payload: 'FULL_SYNC' });
    try {
      const res = await fetch('/api/traces?limit=100', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: 'SET_TRACES', payload: data.traces || [] });
      }
      await fetchSessionSnapshot();
      dispatch({ type: 'SET_CONNECTION_STATE', payload: 'LIVE' });
    } catch {
      dispatch({ type: 'SET_CONNECTION_STATE', payload: 'DISCONNECTED', error: 'Full sync failed' });
    }
  }, [dispatch, fetchSessionSnapshot]);

  // Setup EventSource with reconnect and exponential backoff + jitter
  const connectSse = useCallback(() => {
    if (isDestroyedRef.current) return;
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    dispatch({ type: 'SET_CONNECTION_STATE', payload: retryCountRef.current > 0 ? 'RECONNECTING' : 'CONNECTING' });

    // Include lastEventId in query string if reconnecting so broker can replay missed chunks
    const lastId = state.lastEventId;
    const streamUrl = lastId > 0 ? `/api/stream?lastEventId=${lastId}` : '/api/stream';

    const es = new EventSource(streamUrl, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      retryCountRef.current = 0;
      dispatch({ type: 'SET_CONNECTION_STATE', payload: 'LIVE' });
    };

    // 1. Versioned Live Trace
    es.addEventListener('trace', (e: MessageEvent) => {
      try {
        const envelope = JSON.parse(e.data) as SseEnvelope<TraceRecord>;
        dispatch({
          type: 'PREPEND_TRACE',
          payload: envelope.payload,
          eventId: envelope.id,
        });
      } catch (err) {
        console.warn('[DaemonConnection] Malformed trace event:', err);
      }
    });

    // 2. Versioned Live Metrics
    es.addEventListener('metrics', (e: MessageEvent) => {
      try {
        const envelope = JSON.parse(e.data) as SseEnvelope<{
          velocity?: any;
          totalCostUsd?: number;
        }>;
        dispatch({
          type: 'UPDATE_METRICS',
          payload: envelope.payload,
        });
      } catch (err) {
        console.warn('[DaemonConnection] Malformed metrics event:', err);
      }
    });

    // 3. Buffer Gap Exceeded -> Controlled Full Sync
    es.addEventListener('full_sync_required', () => {
      fetchFullSync();
    });

    // Error & Reconnection Backoff
    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;

      if (isDestroyedRef.current) return;

      const attempt = ++retryCountRef.current;
      if (attempt > 10) {
        dispatch({
          type: 'SET_CONNECTION_STATE',
          payload: 'DISCONNECTED',
          error: 'Max reconnection retries exceeded. Please check daemon process.',
        });
        return;
      }

      dispatch({ type: 'SET_CONNECTION_STATE', payload: 'RECONNECTING' });

      // Exponential backoff: min(1000 * 1.5^attempt, 15000) + random jitter
      const baseDelay = Math.min(1000 * Math.pow(1.5, attempt), 15000);
      const jitter = Math.random() * 500;
      const delay = Math.round(baseDelay + jitter);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        connectSse();
      }, delay);
    };
  }, [state.lastEventId, dispatch, fetchFullSync]);

  // Initial Auth Handshake & Bootstrapping
  useEffect(() => {
    isDestroyedRef.current = false;

    const bootstrap = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');

      if (urlToken) {
        try {
          const exchangeRes = await fetch('/api/auth/exchange', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-OsterdOps-Daemon-Token': urlToken,
            },
            body: JSON.stringify({ token: urlToken }),
            credentials: 'include',
          });

          if (!exchangeRes.ok) {
            dispatch({
              type: 'SET_CONNECTION_STATE',
              payload: 'AUTH_FAILED',
              error: 'Invalid or expired daemon authentication token.',
            });
            return;
          }

          // Strip token from URL bar cleanly
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('token');
          window.history.replaceState({}, '', cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ''));
        } catch (err) {
          dispatch({
            type: 'SET_CONNECTION_STATE',
            payload: 'AUTH_FAILED',
            error: 'Failed to complete authentication handshake.',
          });
          return;
        }
      }

      // Initial data hydration
      await fetchFullSync();
      connectSse();
    };

    bootstrap();

    return () => {
      isDestroyedRef.current = true;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const manualReconnect = useCallback(() => {
    retryCountRef.current = 0;
    connectSse();
    fetchSessionSnapshot();
  }, [connectSse, fetchSessionSnapshot]);

  return {
    reconnect: manualReconnect,
    refreshSnapshot: fetchSessionSnapshot,
  };
}
