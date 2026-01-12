import { useState, useEffect, useCallback } from 'react';
import { useServer } from '@/context';
import type { Player } from '@/api';

interface UsePlayersResult {
  players: Player[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePlayers(pollInterval = 10000): UsePlayersResult {
  const { api, currentServerId } = useServer();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(async () => {
    if (!api) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getPlayers();
      setPlayers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch players');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    setLoading(true);
    fetchPlayers();
    const interval = setInterval(fetchPlayers, pollInterval);
    return () => clearInterval(interval);
  }, [fetchPlayers, pollInterval, currentServerId]);

  return { players, loading, error, refetch: fetchPlayers };
}
