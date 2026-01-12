import { useState, useEffect, useCallback } from 'react';
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

  const fetchStats = useCallback(async () => {
    if (!api) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getServerStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    setLoading(true);
    fetchStats();
    const interval = setInterval(fetchStats, pollInterval);
    return () => clearInterval(interval);
  }, [fetchStats, pollInterval, currentServerId]);

  return { stats, loading, error, refetch: fetchStats };
}
