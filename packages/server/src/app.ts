import express from 'express';
import cors from 'cors';
import { createServer, Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { serverManager } from './ServerManager';
import { eventManager, StoredEvent } from './EventManager';
import { parseGameEvent, GameEvent } from './gameEvent';

export interface AppContext {
  app: express.Express;
  server: HttpServer;
  wss: WebSocketServer;
}

/**
 * Wire the Express app, WebSocket server, routes and event broadcasting.
 * Exposed as a factory so tests can spin the receiver up on an ephemeral port.
 */
export function createApp(): AppContext {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  // All connected WebSocket clients
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);

    // Send event history for all servers on connect
    const history = eventManager.getAllEvents();
    ws.send(JSON.stringify({ type: 'history', events: history }));

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Broadcast every new game event to all connected clients
  eventManager.on('event', (event: StoredEvent) => {
    const payload = JSON.stringify({ type: 'event', event });
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  });

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==================== Server Management ====================

  // Get all servers
  app.get('/api/servers', (_, res) => {
    res.json(serverManager.getServers());
  });

  // Get single server
  app.get('/api/servers/:serverId', (req, res) => {
    const server = serverManager.getServer(req.params.serverId);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    res.json(server);
  });

  // Add new server
  app.post('/api/servers', (req, res) => {
    const { name, host, port, rconPort, rconPassword } = req.body;

    if (!name || !host || !rconPort || !rconPassword) {
      return res.status(400).json({ error: 'Missing required fields: name, host, rconPort, rconPassword' });
    }

    const server = serverManager.addServer({
      name,
      host,
      port: port || 25565,
      rconPort,
      rconPassword,
    });

    res.status(201).json(server);
  });

  // Update server
  app.put('/api/servers/:serverId', (req, res) => {
    const { name, host, port, rconPort, rconPassword } = req.body;

    const updated = serverManager.updateServer(req.params.serverId, {
      name,
      host,
      port,
      rconPort,
      rconPassword,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Server not found' });
    }

    res.json(updated);
  });

  // Delete server
  app.delete('/api/servers/:serverId', (req, res) => {
    const deleted = serverManager.deleteServer(req.params.serverId);

    if (!deleted) {
      return res.status(404).json({ error: 'Server not found' });
    }

    res.status(204).send();
  });

  // Test server connection
  app.post('/api/servers/:serverId/test', async (req, res) => {
    const result = await serverManager.testConnection(req.params.serverId);
    res.json(result);
  });

  // ==================== Server-specific Routes ====================

  // Get server stats
  app.get('/api/servers/:serverId/stats', async (req, res) => {
    try {
      const response = await serverManager.executeRcon(req.params.serverId, 'serverstat');
      const stats = JSON.parse(response);
      res.json(stats);
    } catch (error) {
      console.error('Failed to get server stats:', error);
      res.status(500).json({ error: 'Failed to connect to Minecraft server' });
    }
  });

  // Get players
  app.get('/api/servers/:serverId/players', async (req, res) => {
    try {
      const response = await serverManager.executeRcon(req.params.serverId, 'playerlist');
      const players = JSON.parse(response);
      res.json(players);
    } catch (error) {
      console.error('Failed to get players:', error);
      res.status(500).json({ error: 'Failed to connect to Minecraft server' });
    }
  });

  // Execute RCON command
  app.post('/api/servers/:serverId/rcon', async (req, res) => {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    try {
      const response = await serverManager.executeRcon(req.params.serverId, command);
      res.json({ response });
    } catch (error) {
      console.error('RCON command failed:', error);
      res.status(500).json({ error: 'Failed to execute command' });
    }
  });

  // ==================== Legacy Routes (backward compatibility) ====================

  app.get('/api/server/stats', async (_, res) => {
    const servers = serverManager.getServers();
    if (servers.length === 0) {
      return res.status(404).json({ error: 'No servers configured' });
    }

    try {
      const response = await serverManager.executeRcon(servers[0].id, 'serverstat');
      const stats = JSON.parse(response);
      res.json(stats);
    } catch (error) {
      console.error('Failed to get server stats:', error);
      res.status(500).json({ error: 'Failed to connect to Minecraft server' });
    }
  });

  app.get('/api/players', async (_, res) => {
    const servers = serverManager.getServers();
    if (servers.length === 0) {
      return res.status(404).json({ error: 'No servers configured' });
    }

    try {
      const response = await serverManager.executeRcon(servers[0].id, 'playerlist');
      const players = JSON.parse(response);
      res.json(players);
    } catch (error) {
      console.error('Failed to get players:', error);
      res.status(500).json({ error: 'Failed to connect to Minecraft server' });
    }
  });

  app.post('/api/rcon', async (req, res) => {
    const { command } = req.body;
    const servers = serverManager.getServers();

    if (servers.length === 0) {
      return res.status(404).json({ error: 'No servers configured' });
    }

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    try {
      const response = await serverManager.executeRcon(servers[0].id, command);
      res.json({ response });
    } catch (error) {
      console.error('RCON command failed:', error);
      res.status(500).json({ error: 'Failed to execute command' });
    }
  });

  // ==================== Game Events Webhook ====================

  // Receive a single game event (chat / join / leave / dimension_change / death / kick / ...)
  // from the Minecraft plugin. Fire-and-forget on the plugin side: respond fast with a 2xx.
  app.post('/api/servers/:serverId/events/webhook', (req, res) => {
    const result = parseGameEvent(req.body);

    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    const stored = eventManager.addEvent(req.params.serverId, result.event);
    res.status(201).json(stored);
  });

  // Get event history for a server (full feed, all types)
  app.get('/api/servers/:serverId/events', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const events = eventManager.getEvents(req.params.serverId, limit);
    res.json(events);
  });

  // ---- Legacy chat webhook (kept working during the rollout window) ----
  // Old jars still POST plain chat here without `type`/`timestamp`. Funnel it
  // into the same event store as a chat event so the feed stays unified.
  app.post('/api/servers/:serverId/chat/webhook', (req, res) => {
    const { player, playerUuid, message } = req.body;

    if (!player || !message) {
      return res.status(400).json({ error: 'Missing required fields: player, message' });
    }

    const event: GameEvent = {
      type: 'chat',
      player,
      playerUuid: playerUuid || '',
      message,
      timestamp: Date.now(),
    };

    const stored = eventManager.addEvent(req.params.serverId, event);
    res.status(201).json(stored);
  });

  // Legacy chat history (chat-only slice of the event feed)
  app.get('/api/servers/:serverId/chat', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const chatEvents = eventManager
      .getEvents(req.params.serverId, 100)
      .filter((event) => event.type === 'chat');
    res.json(chatEvents.slice(-limit));
  });

  // ==================== Mojang API ====================

  app.post('/api/mojang/profile', async (req, res) => {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    const trimmed = query.trim();
    const isUuid = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(trimmed);

    try {
      let url: string;
      if (isUuid) {
        const uuid = trimmed.replace(/-/g, '');
        url = `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`;
      } else {
        url = `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(trimmed)}`;
      }

      const response = await fetch(url);

      if (response.status === 404 || response.status === 204) {
        return res.status(404).json({ error: 'Player not found' });
      }

      if (!response.ok) {
        return res.status(502).json({ error: 'Mojang API error' });
      }

      const data = await response.json();
      res.json({ id: data.id, name: data.name });
    } catch (error) {
      console.error('Mojang lookup failed:', error);
      res.status(500).json({ error: 'Failed to lookup player' });
    }
  });

  return { app, server, wss };
}
