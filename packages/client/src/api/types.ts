export interface ServerStats {
  version: string;
  onlinePlayers: number;
  memoryUsedMB: number;
  memoryAllocatedMB: number;
  tps1m: number;
  tps5m: number;
  tps15m: number;
}

export interface Player {
  name: string;
  uuid: string;
  isOp: boolean;
  isOnline: boolean;
  isBanned: boolean;
  gameMode: 'SURVIVAL' | 'CREATIVE' | 'ADVENTURE' | 'SPECTATOR' | 'unknown';
}

export interface MojangProfile {
  id: string;
  name: string;
}

export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  rconPort: number;
  rconPassword: string; // Will be '***' when fetched from API
}

export interface ServerConnectionTest {
  success: boolean;
  message: string;
}
