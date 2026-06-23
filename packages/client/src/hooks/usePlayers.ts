import { useState, useEffect, useCallback, useRef } from 'react';
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
  const requestIdRef = useRef(0);

  const fetchPlayers = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!api) {
      setPlayers([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getPlayers();
      if (requestId !== requestIdRef.current) return;
      setPlayers(data);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch players');
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
    setPlayers([]);

    fetchPlayers();
    const interval = setInterval(fetchPlayers, pollInterval);
    return () => {
      requestIdRef.current += 1;
      clearInterval(interval);
    };
  }, [fetchPlayers, pollInterval, currentServerId]);

  return { players, loading, error, refetch: fetchPlayers };
}
