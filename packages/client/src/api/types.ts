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
