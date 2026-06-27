import { config } from 'dotenv';
import { createApp } from './app';
import { serverManager } from './ServerManager';

// Load .env for local development (in Docker, env vars come from compose)
config({ path: '../../.env' });
config();

const PORT = process.env.PORT || 3001;

const { server } = createApp();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
  console.log(`Configured servers: ${serverManager.getServers().map(s => s.name).join(', ') || 'none'}`);
});
