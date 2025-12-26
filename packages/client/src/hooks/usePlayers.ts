import { useState, useEffect, useCallback } from 'react';
import { api, type Player } from '@/api';

interface UsePlayersResult {
  players: Player[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePlayers(pollInterval = 10000): UsePlayersResult {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(async () => {
    try {
      const data = await api.getPlayers();
      setPlayers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch players');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, pollInterval);
    return () => clearInterval(interval);
  }, [fetchPlayers, pollInterval]);

  return { players, loading, error, refetch: fetchPlayers };
}
