import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { serverManager, ServerConfig } from './ServerManager';

// Load .env for local development (in Docker, env vars come from compose)
config({ path: '../../.env' });
config();

const app = express();
const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Configured servers: ${serverManager.getServers().map(s => s.name).join(', ') || 'none'}`);
});
