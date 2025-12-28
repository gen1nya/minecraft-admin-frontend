import type { ServerStats, Player, MojangProfile } from './types';

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

export const api = {
  getServerStats: () => fetchJson<ServerStats>('/server/stats'),

  getPlayers: () => fetchJson<Player[]>('/players'),

  sendCommand: (command: string) =>
    fetchJson<{ response: string }>('/rcon', {
      method: 'POST',
      body: JSON.stringify({ command }),
    }),

  // Player management
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

  lookupPlayer: (query: string) =>
    fetchJson<MojangProfile>('/mojang/profile', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
};
