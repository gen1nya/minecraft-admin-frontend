import { Rcon } from 'rcon-client';

export interface ServerConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  rconPort: number;
  rconPassword: string;
}

interface RconConnection {
  rcon: Rcon;
  lastUsed: number;
}

export class ServerManager {
  private servers: Map<string, ServerConfig> = new Map();
  private connections: Map<string, RconConnection> = new Map();
  private configPath: string;

  constructor(configPath: string = './servers.json') {
    this.configPath = configPath;
    this.loadServers();

    // Cleanup idle connections every 5 minutes
    setInterval(() => this.cleanupIdleConnections(), 5 * 60 * 1000);
  }

  private loadServers(): void {
    try {
      const fs = require('fs');
      if (fs.existsSync(this.configPath)) {
        const data = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        for (const server of data.servers || []) {
          this.servers.set(server.id, server);
        }
        console.log(`Loaded ${this.servers.size} server(s) from config`);
      } else {
        // Create default config from env vars if exists
        if (process.env.RCON_HOST) {
          const defaultServer: ServerConfig = {
            id: 'default',
            name: process.env.SERVER_NAME || 'Default Server',
            host: process.env.RCON_HOST,
            port: parseInt(process.env.SERVER_PORT || '25565'),
            rconPort: parseInt(process.env.RCON_PORT || '25575'),
            rconPassword: process.env.RCON_PASSWORD || '',
          };
          this.servers.set('default', defaultServer);
          this.saveServers();
        }
      }
    } catch (error) {
      console.error('Failed to load servers config:', error);
    }
  }

  private saveServers(): void {
    try {
      const fs = require('fs');
      const data = {
        servers: Array.from(this.servers.values()),
      };
      fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save servers config:', error);
    }
  }

  private async cleanupIdleConnections(): Promise<void> {
    const now = Date.now();
    const maxIdleTime = 10 * 60 * 1000; // 10 minutes

    for (const [serverId, conn] of this.connections) {
      if (now - conn.lastUsed > maxIdleTime) {
        try {
          await conn.rcon.end();
        } catch (e) {
          // Ignore errors when closing
        }
        this.connections.delete(serverId);
        console.log(`Closed idle connection to server: ${serverId}`);
      }
    }
  }

  getServers(): ServerConfig[] {
    return Array.from(this.servers.values()).map(s => ({
      ...s,
      rconPassword: '***', // Don't expose password
    }));
  }

  getServer(id: string): ServerConfig | undefined {
    const server = this.servers.get(id);
    if (server) {
      return { ...server, rconPassword: '***' };
    }
    return undefined;
  }

  addServer(config: Omit<ServerConfig, 'id'>): ServerConfig {
    const id = this.generateId();
    const server: ServerConfig = { ...config, id };
    this.servers.set(id, server);
    this.saveServers();
    return { ...server, rconPassword: '***' };
  }

  updateServer(id: string, config: Partial<Omit<ServerConfig, 'id'>>): ServerConfig | null {
    const existing = this.servers.get(id);
    if (!existing) return null;

    const updated: ServerConfig = {
      ...existing,
      ...config,
      id, // Ensure ID doesn't change
    };

    // If connection settings changed, close existing connection
    if (config.host || config.rconPort || config.rconPassword) {
      this.closeConnection(id);
    }

    this.servers.set(id, updated);
    this.saveServers();
    return { ...updated, rconPassword: '***' };
  }

  deleteServer(id: string): boolean {
    if (!this.servers.has(id)) return false;

    this.closeConnection(id);
    this.servers.delete(id);
    this.saveServers();
    return true;
  }

  private async closeConnection(serverId: string): Promise<void> {
    const conn = this.connections.get(serverId);
    if (conn) {
      try {
        await conn.rcon.end();
      } catch (e) {
        // Ignore
      }
      this.connections.delete(serverId);
    }
  }

  async executeRcon(serverId: string, command: string): Promise<string> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    // Try to reuse existing connection
    let conn = this.connections.get(serverId);

    if (!conn) {
      const rcon = await Rcon.connect({
        host: server.host,
        port: server.rconPort,
        password: server.rconPassword,
      });
      conn = { rcon, lastUsed: Date.now() };
      this.connections.set(serverId, conn);
    }

    try {
      conn.lastUsed = Date.now();
      return await conn.rcon.send(command);
    } catch (error) {
      // Connection might be stale, try to reconnect once
      this.connections.delete(serverId);

      const rcon = await Rcon.connect({
        host: server.host,
        port: server.rconPort,
        password: server.rconPassword,
      });
      conn = { rcon, lastUsed: Date.now() };
      this.connections.set(serverId, conn);

      return await conn.rcon.send(command);
    }
  }

  async testConnection(serverId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.executeRcon(serverId, 'list');
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: String(error) };
    }
  }

  private generateId(): string {
    return `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const serverManager = new ServerManager();
