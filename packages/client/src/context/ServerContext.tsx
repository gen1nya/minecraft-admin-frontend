import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { serversApi, createServerApi } from '@/api/client';
import type { Server } from '@/api/types';

interface ServerContextType {
  servers: Server[];
  currentServer: Server | null;
  currentServerId: string | null;
  loading: boolean;
  error: string | null;
  setCurrentServerId: (id: string) => void;
  refreshServers: () => Promise<void>;
  addServer: (server: Omit<Server, 'id'>) => Promise<Server>;
  updateServer: (id: string, server: Partial<Omit<Server, 'id'>>) => Promise<Server>;
  deleteServer: (id: string) => Promise<void>;
  api: ReturnType<typeof createServerApi> | null;
}

const ServerContext = createContext<ServerContextType | null>(null);

export function ServerProvider({ children }: { children: ReactNode }) {
  const [servers, setServers] = useState<Server[]>([]);
  const [currentServerId, setCurrentServerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshServers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await serversApi.getServers();
      setServers(data);
      setError(null);

      // Auto-select first server if none selected
      if (data.length > 0 && !currentServerId) {
        setCurrentServerId(data[0].id);
      }
      // Clear selection if current server was deleted
      if (currentServerId && !data.find(s => s.id === currentServerId)) {
        setCurrentServerId(data.length > 0 ? data[0].id : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch servers');
    } finally {
      setLoading(false);
    }
  }, [currentServerId]);

  useEffect(() => {
    refreshServers();
  }, []);

  const currentServer = useMemo(
    () => servers.find(s => s.id === currentServerId) || null,
    [servers, currentServerId]
  );

  const api = useMemo(
    () => (currentServerId ? createServerApi(currentServerId) : null),
    [currentServerId]
  );

  const addServer = useCallback(async (server: Omit<Server, 'id'>) => {
    const newServer = await serversApi.addServer(server);
    await refreshServers();
    return newServer;
  }, [refreshServers]);

  const updateServer = useCallback(async (id: string, server: Partial<Omit<Server, 'id'>>) => {
    const updated = await serversApi.updateServer(id, server);
    await refreshServers();
    return updated;
  }, [refreshServers]);

  const deleteServer = useCallback(async (id: string) => {
    await serversApi.deleteServer(id);
    await refreshServers();
  }, [refreshServers]);

  const value: ServerContextType = {
    servers,
    currentServer,
    currentServerId,
    loading,
    error,
    setCurrentServerId,
    refreshServers,
    addServer,
    updateServer,
    deleteServer,
    api,
  };

  return (
    <ServerContext.Provider value={value}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error('useServer must be used within a ServerProvider');
  }
  return context;
}
