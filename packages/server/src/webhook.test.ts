import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { WebSocket } from 'ws';
import { createApp } from './app';
import { eventManager } from './EventManager';

let ctx: ReturnType<typeof createApp>;
let baseUrl: string;
let wsUrl: string;

const UUID = '12c1b1a7-68f4-452b-89ca-846f5927df5d';

// One fixture per type that is actually sent today (EVENTS_WEBHOOK_TASK.md §2).
const FIXTURES = [
  { type: 'chat', player: 'Evgeniy1357', playerUuid: UUID, timestamp: 1782524545414, message: 'привет' },
  { type: 'join', player: 'Evgeniy1357', playerUuid: UUID, timestamp: 1782524545500 },
  { type: 'leave', player: 'Evgeniy1357', playerUuid: UUID, timestamp: 1782524545600 },
  { type: 'dimension_change', player: 'Evgeniy1357', playerUuid: UUID, timestamp: 1782524545700, from: 'overworld', to: 'the_nether' },
  { type: 'death', player: 'Evgeniy1357', playerUuid: UUID, timestamp: 1782524545800, cause: 'Evgeniy1357 was slain by Zombie' },
  { type: 'kick', player: 'Evgeniy1357', playerUuid: UUID, timestamp: 1782524545900, reason: 'Kicked by an operator' },
];

function postEvent(serverId: string, body: unknown) {
  return fetch(`${baseUrl}/api/servers/${serverId}/events/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

before(async () => {
  ctx = createApp();
  await new Promise<void>((resolve) => ctx.server.listen(0, resolve));
  const { port } = ctx.server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
  wsUrl = `ws://127.0.0.1:${port}/ws`;
});

after(async () => {
  ctx.wss.close();
  await new Promise<void>((resolve) => ctx.server.close(() => resolve()));
});

test('accepts every fixture type with a 2xx and stores it in order', async () => {
  const serverId = 'forge-modded';
  for (const fixture of FIXTURES) {
    const res = await postEvent(serverId, fixture);
    assert.ok(res.status >= 200 && res.status < 300, `${fixture.type} -> ${res.status}`);
  }

  const stored = eventManager.getEvents(serverId, 100);
  assert.deepEqual(stored.map((e) => e.type), FIXTURES.map((f) => f.type));
  assert.equal(stored.every((e) => e.serverId === serverId), true);
});

test('routes the event to the serverId from the URL', async () => {
  await postEvent('kururun-fabric', FIXTURES[1]);
  assert.equal(eventManager.getEvents('kururun-fabric').some((e) => e.type === 'join'), true);
  assert.equal(eventManager.getEvents('forge-modded').some((e) => e.serverId === 'kururun-fabric'), false);
});

test('broadcasts a posted event to a connected WebSocket client', async () => {
  const serverId = 'broadcast-test';
  const ws = new WebSocket(wsUrl);

  const received = new Promise<any>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no broadcast received')), 2000);
    ws.on('message', (data) => {
      const payload = JSON.parse(data.toString());
      if (payload.type === 'event' && payload.event.serverId === serverId) {
        clearTimeout(timer);
        resolve(payload.event);
      }
    });
    ws.on('error', reject);
  });

  await new Promise<void>((resolve) => ws.on('open', () => resolve()));
  await postEvent(serverId, { type: 'join', player: 'Evgeniy1357', playerUuid: UUID, timestamp: 1782524545500 });

  const event = await received;
  assert.equal(event.type, 'join');
  assert.equal(event.player, 'Evgeniy1357');
  ws.close();
});

test('a join event is stored without optional keys (missing optionals do not leak)', async () => {
  const serverId = 'join-only';
  await postEvent(serverId, { type: 'join', player: 'Evgeniy1357', playerUuid: UUID, timestamp: 1782524545500 });
  const [stored] = eventManager.getEvents(serverId, 100);
  assert.equal('message' in stored, false);
  assert.equal('cause' in stored, false);
  assert.equal('allowed' in stored, false);
});

test('preserves allowed:false through the webhook', async () => {
  const serverId = 'login-test';
  const res = await postEvent(serverId, { type: 'login_attempt', player: 'Evgeniy1357', playerUuid: UUID, timestamp: 1782524545999, allowed: false });
  assert.ok(res.status >= 200 && res.status < 300);
  const [stored] = eventManager.getEvents(serverId, 100);
  assert.equal(stored.allowed, false);
});

test('rejects an invalid body with 400 and stores nothing', async () => {
  const serverId = 'invalid-test';
  const res = await postEvent(serverId, { type: 'explode', player: 'x', playerUuid: 'u', timestamp: 1 });
  assert.equal(res.status, 400);
  assert.equal(eventManager.getEvents(serverId, 100).length, 0);
});

test('legacy /chat/webhook still works and lands as a chat event', async () => {
  const serverId = 'legacy-test';
  const res = await fetch(`${baseUrl}/api/servers/${serverId}/chat/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player: 'Evgeniy1357', playerUuid: UUID, message: 'привет' }),
  });
  assert.ok(res.status >= 200 && res.status < 300);
  const [stored] = eventManager.getEvents(serverId, 100);
  assert.equal(stored.type, 'chat');
  assert.equal(stored.message, 'привет');
  assert.equal(typeof stored.timestamp, 'number');
});

test('GET /events returns the stored feed for a server', async () => {
  const serverId = 'get-test';
  await postEvent(serverId, FIXTURES[1]);
  const res = await fetch(`${baseUrl}/api/servers/${serverId}/events`);
  assert.equal(res.status, 200);
  const body = (await res.json()) as Array<{ type: string }>;
  assert.equal(body.length, 1);
  assert.equal(body[0].type, 'join');
});
