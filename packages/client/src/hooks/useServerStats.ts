import { useState, useEffect, useCallback, useRef } from 'react';
import { useServer } from '@/context';
import type { ServerStats } from '@/api';

interface UseServerStatsResult {
  stats: ServerStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useServerStats(pollInterval = 10000): UseServerStatsResult {
  const { api, currentServerId } = useServer();
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchStats = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!api) {
      setStats(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getServerStats();
      if (requestId !== requestIdRef.current) return;
      setStats(data);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [api]);

  useEffect(() => {
    requestIdRef.current += 1;
    setLoading(true);
    setError(null);
    setStats(null);

    fetchStats();
    const interval = setInterval(fetchStats, pollInterval);
    return () => {
      requestIdRef.current += 1;
      clearInterval(interval);
    };
  }, [fetchStats, pollInterval, currentServerId]);

  return { stats, loading, error, refetch: fetchStats };
}
