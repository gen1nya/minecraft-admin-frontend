export interface ServerStats {
  version: string;
  onlinePlayers: number;
  memoryUsedMB: number;
  memoryAllocatedMB: number;
}

export interface Player {
  name: string;
  uuid: string;
  isOp: boolean;
  isOnline: boolean;
  gameMode: 'SURVIVAL' | 'CREATIVE' | 'ADVENTURE' | 'SPECTATOR' | 'unknown';
}
