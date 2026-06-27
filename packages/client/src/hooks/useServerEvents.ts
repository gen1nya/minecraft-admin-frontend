import { useEffect, useMemo, useState } from 'react';

export type ServerEventType =
  | 'chat'
  | 'join'
  | 'leave'
  | 'dimension_change'
  | 'death'
  | 'kick'
  | 'ban'
  | 'login_attempt';

export interface ServerEvent {
  id: string;
  serverId: string;
  type: ServerEventType;
  player: string;
  playerUuid: string;
  timestamp: number; // epoch millis
  message?: string;
  from?: string;
  to?: string;
  cause?: string;
  reason?: string;
  allowed?: boolean;
}

const MAX_EVENTS = 500;
const RECONNECT_DELAY_MS = 3000;

let events: ServerEvent[] = [];
let ws: WebSocket | null = null;
let connected = false;
let reconnectTimer: number | null = null;

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isServerEvent(value: unknown): value is ServerEvent {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.serverId === 'string' &&
    typeof value.type === 'string' &&
    typeof value.player === 'string' &&
    typeof value.playerUuid === 'string' &&
    typeof value.timestamp === 'number'
  );
}

function trimEvents(nextEvents: ServerEvent[]): ServerEvent[] {
  return nextEvents
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-MAX_EVENTS);
}

function addEvent(event: ServerEvent) {
  if (events.some((existing) => existing.id === event.id)) return;

  events = trimEvents([...events, event]);
  notifyListeners();
}

function mergeHistory(history: ServerEvent[]) {
  const existingIds = new Set(events.map((event) => event.id));
  const newEvents = history.filter((event) => !existingIds.has(event.id));

  if (newEvents.length === 0) return;

  events = trimEvents([...events, ...newEvents]);
  notifyListeners();
}

function getWebSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

function clearReconnectTimer() {
  if (reconnectTimer !== null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (listeners.size === 0 || reconnectTimer !== null) return;

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, RECONNECT_DELAY_MS);
}

function handleMessage(event: MessageEvent) {
  try {
    const payload = JSON.parse(event.data) as unknown;
    if (!isRecord(payload) || typeof payload.type !== 'string') return;

    if (payload.type === 'history' && Array.isArray(payload.events)) {
      mergeHistory(payload.events.filter(isServerEvent));
      return;
    }

    if (payload.type === 'event' && isServerEvent(payload.event)) {
      addEvent(payload.event);
    }
  } catch {
    // Ignore malformed WebSocket payloads.
  }
}

function connect() {
  if (listeners.size === 0) return;
  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) return;

  clearReconnectTimer();

  const socket = new WebSocket(getWebSocketUrl());
  ws = socket;

  socket.onopen = () => {
    if (ws !== socket) return;

    connected = true;
    notifyListeners();
  };

  socket.onmessage = handleMessage;

  socket.onclose = () => {
    if (ws !== socket) return;

    connected = false;
    ws = null;
    notifyListeners();
    scheduleReconnect();
  };

  socket.onerror = () => {
    socket.close();
  };
}

function disconnectIfIdle() {
  if (listeners.size > 0) return;

  clearReconnectTimer();

  if (ws) {
    const socket = ws;
    ws = null;
    socket.onclose = null;
    socket.onerror = null;
    socket.close();
  }

  connected = false;
}

export function useServerEvents(serverId: string | null) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const listener = () => setVersion((current) => current + 1);

    listeners.add(listener);
    connect();

    return () => {
      listeners.delete(listener);
      disconnectIfIdle();
    };
  }, []);

  const serverEvents = useMemo(() => {
    if (!serverId) return [];
    return events.filter((event) => event.serverId === serverId);
  }, [serverId, version]);

  return { events: serverEvents, connected };
}
