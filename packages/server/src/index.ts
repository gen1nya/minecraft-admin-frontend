import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { Rcon } from 'rcon-client';

// Load .env for local development (in Docker, env vars come from compose)
config({ path: '../../.env' });
config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// RCON connection config
const rconConfig = {
  host: process.env.RCON_HOST || 'localhost',
  port: parseInt(process.env.RCON_PORT || '25575'),
  password: process.env.RCON_PASSWORD || '',
};

// Helper to execute RCON commands
async function executeRcon(command: string): Promise<string> {
  const rcon = await Rcon.connect(rconConfig);
  try {
    const response = await rcon.send(command);
    return response;
  } finally {
    await rcon.end();
  }
}

// API Routes
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/server/stats', async (_, res) => {
  try {
    const response = await executeRcon('serverstat');
    const stats = JSON.parse(response);
    res.json(stats);
  } catch (error) {
    console.error('Failed to get server stats:', error);
    res.status(500).json({ error: 'Failed to connect to Minecraft server' });
  }
});

app.get('/api/players', async (_, res) => {
  try {
    const response = await executeRcon('playerlist');
    const players = JSON.parse(response);
    res.json(players);
  } catch (error) {
    console.error('Failed to get players:', error);
    res.status(500).json({ error: 'Failed to connect to Minecraft server' });
  }
});

app.post('/api/rcon', async (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  try {
    const response = await executeRcon(command);
    res.json({ response });
  } catch (error) {
    console.error('RCON command failed:', error);
    res.status(500).json({ error: 'Failed to execute command' });
  }
});

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
});
