import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventManager } from './EventManager';
import type { GameEvent } from './gameEvent';

const sample = (overrides: Partial<GameEvent> = {}): GameEvent => ({
  type: 'join',
  player: 'Evgeniy1357',
  playerUuid: '12c1b1a7-68f4-452b-89ca-846f5927df5d',
  timestamp: 1782524545500,
  ...overrides,
});

test('addEvent stores the event under its server and stamps id + serverId', () => {
  const manager = new EventManager();
  const stored = manager.addEvent('forge-modded', sample());

  assert.equal(stored.serverId, 'forge-modded');
  assert.ok(stored.id.length > 0);
  assert.deepEqual(manager.getEvents('forge-modded'), [stored]);
});

test('addEvent emits an "event" with the stored event', () => {
  const manager = new EventManager();
  let received: unknown = null;
  manager.on('event', (e) => { received = e; });

  const stored = manager.addEvent('forge-modded', sample());
  assert.deepEqual(received, stored);
});

test('history is isolated per server', () => {
  const manager = new EventManager();
  manager.addEvent('forge-modded', sample());
  manager.addEvent('kururun-fabric', sample({ player: 'Other' }));

  assert.equal(manager.getEvents('forge-modded').length, 1);
  assert.equal(manager.getEvents('kururun-fabric').length, 1);
  assert.equal(manager.getEvents('kururun-fabric')[0].player, 'Other');
});

test('getAllEvents returns events sorted by timestamp across servers', () => {
  const manager = new EventManager();
  manager.addEvent('a', sample({ timestamp: 30 }));
  manager.addEvent('b', sample({ timestamp: 10 }));
  manager.addEvent('a', sample({ timestamp: 20 }));

  assert.deepEqual(manager.getAllEvents().map((e) => e.timestamp), [10, 20, 30]);
});

test('per-server history is capped at 100', () => {
  const manager = new EventManager();
  for (let i = 0; i < 150; i++) {
    manager.addEvent('forge-modded', sample({ timestamp: i }));
  }
  const events = manager.getEvents('forge-modded', 1000);
  assert.equal(events.length, 100);
  assert.equal(events[0].timestamp, 50); // oldest 50 dropped
  assert.equal(events[events.length - 1].timestamp, 149);
});
