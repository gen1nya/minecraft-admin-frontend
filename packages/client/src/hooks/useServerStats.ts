import { useState, useEffect, useCallback } from 'react';
import { api, type ServerStats } from '@/api';

interface UseServerStatsResult {
  stats: ServerStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useServerStats(pollInterval = 10000): UseServerStatsResult {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getServerStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, pollInterval);
    return () => clearInterval(interval);
  }, [fetchStats, pollInterval]);

  return { stats, loading, error, refetch: fetchStats };
}
