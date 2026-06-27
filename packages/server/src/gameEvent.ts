// Authoritative contract for the unified game-events webhook
// (POST /api/servers/:serverId/events/webhook). Mirrors the plugin's GameEvent
// model: one envelope shared by every event kind, with `type` selecting which of
// the optional fields are meaningful. The plugin's Gson serializer omits null
// fields entirely, so a missing optional key means "not applicable" (not an error).

export const EVENT_TYPES = [
  'chat',
  'join',
  'leave',
  'dimension_change',
  'death',
  'kick',
  'ban',
  'login_attempt',
] as const;

export type GameEventType = (typeof EVENT_TYPES)[number];

export interface GameEvent {
  type: GameEventType;
  player: string;
  playerUuid: string;
  timestamp: number; // epoch millis (System.currentTimeMillis() on the plugin side)
  message?: string; // chat
  from?: string; // dimension_change: source dimension key
  to?: string; // dimension_change: target dimension key
  cause?: string; // death: ready-made death message
  reason?: string; // kick / ban
  allowed?: boolean; // login_attempt
}

export type ParseResult =
  | { ok: true; event: GameEvent }
  | { ok: false; error: string };

const EVENT_TYPE_SET = new Set<string>(EVENT_TYPES);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Validate and normalize a raw webhook body into a GameEvent.
 *
 * Required fields are strict (invalid -> error -> caller responds 400). Optional
 * fields are only copied when present and well-typed, so a join event (which
 * carries none of them) parses cleanly. `allowed: false` is preserved because
 * Gson drops `null`, not `false`.
 */
export function parseGameEvent(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'Body must be a JSON object' };
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.type !== 'string' || !EVENT_TYPE_SET.has(raw.type)) {
    return { ok: false, error: 'Invalid or missing field: type' };
  }
  if (!isNonEmptyString(raw.player)) {
    return { ok: false, error: 'Invalid or missing field: player' };
  }
  if (!isNonEmptyString(raw.playerUuid)) {
    return { ok: false, error: 'Invalid or missing field: playerUuid' };
  }
  if (typeof raw.timestamp !== 'number' || !Number.isFinite(raw.timestamp)) {
    return { ok: false, error: 'Invalid or missing field: timestamp' };
  }

  const event: GameEvent = {
    type: raw.type as GameEventType,
    player: raw.player,
    playerUuid: raw.playerUuid,
    timestamp: raw.timestamp,
  };

  if (typeof raw.message === 'string') event.message = raw.message;
  if (typeof raw.from === 'string') event.from = raw.from;
  if (typeof raw.to === 'string') event.to = raw.to;
  if (typeof raw.cause === 'string') event.cause = raw.cause;
  if (typeof raw.reason === 'string') event.reason = raw.reason;
  if (typeof raw.allowed === 'boolean') event.allowed = raw.allowed;

  return { ok: true, event };
}
