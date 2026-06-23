import type { ServerStats, Player, MojangProfile, Server, ServerConnectionTest } from './types';

const API_BASE = '/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export type GameMode = 'survival' | 'creative' | 'adventure' | 'spectator';

async function getErrorMessage(response: Response): Promise<string> {
  const fallback = `API Error: ${response.status}`;

  try {
    const text = await response.text();
    if (!text) return fallback;

    try {
      const data = JSON.parse(text) as { error?: unknown; message?: unknown };
      if (typeof data.error === 'string') return data.error;
      if (typeof data.message === 'string') return data.message;
    } catch {
      return text;
    }

    return text;
  } catch {
    return fallback;
  }
}

function pathSegment(value: string): string {
  return encodeURIComponent(value);
}

// Server management API
export const serversApi = {
  getServers: () => fetchJson<Server[]>('/servers'),

  getServer: (serverId: string) => fetchJson<Server>(`/servers/${pathSegment(serverId)}`),

  addServer: (server: Omit<Server, 'id'>) =>
    fetchJson<Server>('/servers', {
      method: 'POST',
      body: JSON.stringify(server),
    }),

  updateServer: (serverId: string, server: Partial<Omit<Server, 'id'>>) =>
    fetchJson<Server>(`/servers/${pathSegment(serverId)}`, {
      method: 'PUT',
      body: JSON.stringify(server),
    }),

  deleteServer: (serverId: string) =>
    fetchJson<void>(`/servers/${pathSegment(serverId)}`, { method: 'DELETE' }),

  testConnection: (serverId: string) =>
    fetchJson<ServerConnectionTest>(`/servers/${pathSegment(serverId)}/test`, {
      method: 'POST',
    }),
};

// Server-specific API (requires serverId)
export const createServerApi = (serverId: string) => {
  const id = pathSegment(serverId);

  return {
    getServerStats: () => fetchJson<ServerStats>(`/servers/${id}/stats`),

    getPlayers: () => fetchJson<Player[]>(`/servers/${id}/players`),

    sendCommand: (command: string) =>
      fetchJson<{ response: string }>(`/servers/${id}/rcon`, {
        method: 'POST',
        body: JSON.stringify({ command }),
      }),

    setGameMode: (player: string, mode: GameMode) =>
      fetchJson<{ response: string }>(`/servers/${id}/rcon`, {
        method: 'POST',
        body: JSON.stringify({ command: `gamemode ${mode} ${player}` }),
      }),

    whitelistAdd: (player: string) =>
      fetchJson<{ response: string }>(`/servers/${id}/rcon`, {
        method: 'POST',
        body: JSON.stringify({ command: `whitelist add ${player}` }),
      }),

    whitelistRemove: (player: string) =>
      fetchJson<{ response: string }>(`/servers/${id}/rcon`, {
        method: 'POST',
        body: JSON.stringify({ command: `whitelist remove ${player}` }),
      }),

    op: (player: string) =>
      fetchJson<{ response: string }>(`/servers/${id}/rcon`, {
        method: 'POST',
        body: JSON.stringify({ command: `op ${player}` }),
      }),

    deop: (player: string) =>
      fetchJson<{ response: string }>(`/servers/${id}/rcon`, {
        method: 'POST',
        body: JSON.stringify({ command: `deop ${player}` }),
      }),

    kick: (player: string, reason?: string) =>
      fetchJson<{ response: string }>(`/servers/${id}/rcon`, {
        method: 'POST',
        body: JSON.stringify({ command: reason ? `kick ${player} ${reason}` : `kick ${player}` }),
      }),

    ban: (player: string, reason?: string) =>
      fetchJson<{ response: string }>(`/servers/${id}/rcon`, {
        method: 'POST',
        body: JSON.stringify({ command: reason ? `ban ${player} ${reason}` : `ban ${player}` }),
      }),

    pardon: (player: string) =>
      fetchJson<{ response: string }>(`/servers/${id}/rcon`, {
        method: 'POST',
        body: JSON.stringify({ command: `pardon ${player}` }),
      }),
  };
};

// Legacy API (uses first server) - for backward compatibility
export const api = {
  getServerStats: () => fetchJson<ServerStats>('/server/stats'),
  getPlayers: () => fetchJson<Player[]>('/players'),
  sendCommand: (command: string) =>
    fetchJson<{ response: string }>('/rcon', {
      method: 'POST',
      body: JSON.stringify({ command }),
    }),
  setGameMode: (player: string, mode: GameMode) =>
    fetchJson<{ response: string }>('/rcon', {
      method: 'POST',
      body: JSON.stringify({ command: `gamemode ${mode} ${player}` }),
    }),
  whitelistAdd: (player: string) =>
    fetchJson<{ response: string }>('/rcon', {
      method: 'POST',
      body: JSON.stringify({ command: `whitelist add ${player}` }),
    }),
  whitelistRemove: (player: string) =>
    fetchJson<{ response: string }>('/rcon', {
      method: 'POST',
      body: JSON.stringify({ command: `whitelist remove ${player}` }),
    }),
  op: (player: string) =>
    fetchJson<{ response: string }>('/rcon', {
      method: 'POST',
      body: JSON.stringify({ command: `op ${player}` }),
    }),
  deop: (player: string) =>
    fetchJson<{ response: string }>('/rcon', {
      method: 'POST',
      body: JSON.stringify({ command: `deop ${player}` }),
    }),
  kick: (player: string, reason?: string) =>
    fetchJson<{ response: string }>('/rcon', {
      method: 'POST',
      body: JSON.stringify({ command: reason ? `kick ${player} ${reason}` : `kick ${player}` }),
    }),
  ban: (player: string, reason?: string) =>
    fetchJson<{ response: string }>('/rcon', {
      method: 'POST',
      body: JSON.stringify({ command: reason ? `ban ${player} ${reason}` : `ban ${player}` }),
    }),
  pardon: (player: string) =>
    fetchJson<{ response: string }>('/rcon', {
      method: 'POST',
      body: JSON.stringify({ command: `pardon ${player}` }),
    }),
  lookupPlayer: (query: string) =>
    fetchJson<MojangProfile>('/mojang/profile', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
};

// Mojang API (not server-specific)
export const mojangApi = {
  lookupPlayer: (query: string) =>
    fetchJson<MojangProfile>('/mojang/profile', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
};
