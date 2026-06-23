import { useEffect, useMemo, useState } from 'react';

export interface ChatMessage {
  id: string;
  serverId: string;
  player: string;
  playerUuid: string;
  message: string;
  timestamp: string;
}

const MAX_MESSAGES = 500;
const RECONNECT_DELAY_MS = 3000;

let messages: ChatMessage[] = [];
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

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.serverId === 'string' &&
    typeof value.player === 'string' &&
    typeof value.playerUuid === 'string' &&
    typeof value.message === 'string' &&
    typeof value.timestamp === 'string'
  );
}

function trimMessages(nextMessages: ChatMessage[]): ChatMessage[] {
  return nextMessages
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-MAX_MESSAGES);
}

function addMessage(message: ChatMessage) {
  if (messages.some((existing) => existing.id === message.id)) return;

  messages = trimMessages([...messages, message]);
  notifyListeners();
}

function mergeHistory(history: ChatMessage[]) {
  const existingIds = new Set(messages.map((message) => message.id));
  const newMessages = history.filter((message) => !existingIds.has(message.id));

  if (newMessages.length === 0) return;

  messages = trimMessages([...messages, ...newMessages]);
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

    if (payload.type === 'history' && Array.isArray(payload.messages)) {
      mergeHistory(payload.messages.filter(isChatMessage));
      return;
    }

    if (payload.type === 'chat' && isChatMessage(payload.message)) {
      addMessage(payload.message);
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

export function useChat(serverId: string | null) {
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

  const serverMessages = useMemo(() => {
    if (!serverId) return [];
    return messages.filter((message) => message.serverId === serverId);
  }, [serverId, version]);

  return { messages: serverMessages, connected };
}
