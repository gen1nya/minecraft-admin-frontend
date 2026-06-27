import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGameEvent } from './gameEvent';

// One fixture per type, taken verbatim from EVENTS_WEBHOOK_TASK.md §2.
const FIXTURES = {
  chat: { type: 'chat', player: 'Evgeniy1357', playerUuid: '12c1b1a7-68f4-452b-89ca-846f5927df5d', timestamp: 1782524545414, message: 'привет' },
  join: { type: 'join', player: 'Evgeniy1357', playerUuid: '12c1b1a7-68f4-452b-89ca-846f5927df5d', timestamp: 1782524545500 },
  leave: { type: 'leave', player: 'Evgeniy1357', playerUuid: '12c1b1a7-68f4-452b-89ca-846f5927df5d', timestamp: 1782524545600 },
  dimension_change: { type: 'dimension_change', player: 'Evgeniy1357', playerUuid: '12c1b1a7-68f4-452b-89ca-846f5927df5d', timestamp: 1782524545700, from: 'overworld', to: 'the_nether' },
  death: { type: 'death', player: 'Evgeniy1357', playerUuid: '12c1b1a7-68f4-452b-89ca-846f5927df5d', timestamp: 1782524545800, cause: 'Evgeniy1357 was slain by Zombie' },
  kick: { type: 'kick', player: 'Evgeniy1357', playerUuid: '12c1b1a7-68f4-452b-89ca-846f5927df5d', timestamp: 1782524545900, reason: 'Kicked by an operator' },
} as const;

test('parses every fixture type and preserves its fields', () => {
  for (const [type, fixture] of Object.entries(FIXTURES)) {
    const result = parseGameEvent(fixture);
    assert.ok(result.ok, `${type} should parse`);
    if (result.ok) {
      assert.deepEqual(result.event, fixture, `${type} should round-trip its fields`);
    }
  }
});

test('a join has no chat/dimension/death/kick keys (missing optionals do not break parsing)', () => {
  const result = parseGameEvent(FIXTURES.join);
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal('message' in result.event, false);
    assert.equal('from' in result.event, false);
    assert.equal('to' in result.event, false);
    assert.equal('cause' in result.event, false);
    assert.equal('reason' in result.event, false);
    assert.equal('allowed' in result.event, false);
  }
});

test('death without a cause still parses (Gson drops null causes)', () => {
  const result = parseGameEvent({
    type: 'death',
    player: 'Evgeniy1357',
    playerUuid: '12c1b1a7-68f4-452b-89ca-846f5927df5d',
    timestamp: 1782524545800,
  });
  assert.ok(result.ok);
  if (result.ok) assert.equal('cause' in result.event, false);
});

test('allowed:false is preserved (Gson drops null, not false)', () => {
  const result = parseGameEvent({
    type: 'login_attempt',
    player: 'Evgeniy1357',
    playerUuid: '12c1b1a7-68f4-452b-89ca-846f5927df5d',
    timestamp: 1782524545999,
    allowed: false,
  });
  assert.ok(result.ok);
  if (result.ok) assert.equal(result.event.allowed, false);
});

test('rejects unknown type', () => {
  const result = parseGameEvent({ type: 'explode', player: 'x', playerUuid: 'u', timestamp: 1 });
  assert.equal(result.ok, false);
});

test('rejects empty player / playerUuid', () => {
  assert.equal(parseGameEvent({ type: 'join', player: '', playerUuid: 'u', timestamp: 1 }).ok, false);
  assert.equal(parseGameEvent({ type: 'join', player: 'p', playerUuid: '', timestamp: 1 }).ok, false);
});

test('rejects non-numeric timestamp', () => {
  assert.equal(parseGameEvent({ type: 'join', player: 'p', playerUuid: 'u', timestamp: '123' }).ok, false);
});

test('rejects non-object bodies', () => {
  assert.equal(parseGameEvent(null).ok, false);
  assert.equal(parseGameEvent('nope').ok, false);
  assert.equal(parseGameEvent([{ type: 'join' }]).ok, false);
});
