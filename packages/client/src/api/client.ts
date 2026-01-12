import type { ServerStats, Player, MojangProfile, Server, ServerConnectionTest } from './types';

const API_BASE = '/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export type GameMode = 'survival' | 'creative' | 'adventure' | 'spectator';

// Server management API
export const serversApi = {
  getServers: () => fetchJson<Server[]>('/servers'),

  getServer: (serverId: string) => fetchJson<Server>(`/servers/${serverId}`),

  addServer: (server: Omit<Server, 'id'>) =>
    fetchJson<Server>('/servers', {
      method: 'POST',
      body: JSON.stringify(server),
    }),

  updateServer: (serverId: string, server: Partial<Omit<Server, 'id'>>) =>
    fetchJson<Server>(`/servers/${serverId}`, {
      method: 'PUT',
      body: JSON.stringify(server),
    }),

  deleteServer: (serverId: string) =>
    fetch(`${API_BASE}/servers/${serverId}`, { method: 'DELETE' }),

  testConnection: (serverId: string) =>
    fetchJson<ServerConnectionTest>(`/servers/${serverId}/test`, {
      method: 'POST',
    }),
};

// Server-specific API (requires serverId)
export const createServerApi = (serverId: string) => ({
  getServerStats: () => fetchJson<ServerStats>(`/servers/${serverId}/stats`),

  getPlayers: () => fetchJson<Player[]>(`/servers/${serverId}/players`),

  sendCommand: (command: string) =>
    fetchJson<{ response: string }>(`/servers/${serverId}/rcon`, {
      method: 'POST',
      body: JSON.stringify({ command }),
    }),

  setGameMode: (player: string, mode: GameMode) =>
    fetchJson<{ response: string }>(`/servers/${serverId}/rcon`, {
      method: 'POST',
      body: JSON.stringify({ command: `gamemode ${mode} ${player}` }),
    }),

  whitelistAdd: (player: string) =>
    fetchJson<{ response: string }>(`/servers/${serverId}/rcon`, {
      method: 'POST',
      body: JSON.stringify({ command: `whitelist add ${player}` }),
    }),

  whitelistRemove: (player: string) =>
    fetchJson<{ response: string }>(`/servers/${serverId}/rcon`, {
      method: 'POST',
      body: JSON.stringify({ command: `whitelist remove ${player}` }),
    }),

  op: (player: string) =>
    fetchJson<{ response: string }>(`/servers/${serverId}/rcon`, {
      method: 'POST',
      body: JSON.stringify({ command: `op ${player}` }),
    }),

  deop: (player: string) =>
    fetchJson<{ response: string }>(`/servers/${serverId}/rcon`, {
      method: 'POST',
      body: JSON.stringify({ command: `deop ${player}` }),
    }),

  kick: (player: string, reason?: string) =>
    fetchJson<{ response: string }>(`/servers/${serverId}/rcon`, {
      method: 'POST',
      body: JSON.stringify({ command: reason ? `kick ${player} ${reason}` : `kick ${player}` }),
    }),

  ban: (player: string, reason?: string) =>
    fetchJson<{ response: string }>(`/servers/${serverId}/rcon`, {
      method: 'POST',
      body: JSON.stringify({ command: reason ? `ban ${player} ${reason}` : `ban ${player}` }),
    }),

  pardon: (player: string) =>
    fetchJson<{ response: string }>(`/servers/${serverId}/rcon`, {
      method: 'POST',
      body: JSON.stringify({ command: `pardon ${player}` }),
    }),
});

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
