import { useState, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  serverId: string;
  player: string;
  playerUuid: string;
  message: string;
  timestamp: string;
}

// Global message store (shared across hook instances)
let globalMessages: ChatMessage[] = [];
let globalWs: WebSocket | null = null;
let globalConnected = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

function addMessage(msg: ChatMessage) {
  // Deduplicate by id
  if (!globalMessages.some((m) => m.id === msg.id)) {
    globalMessages = [...globalMessages, msg];
    notifyListeners();
  }
}

function setMessages(msgs: ChatMessage[]) {
  // Deduplicate and merge with existing
  const existingIds = new Set(globalMessages.map((m) => m.id));
  const newMsgs = msgs.filter((m) => !existingIds.has(m.id));
  if (newMsgs.length > 0) {
    globalMessages = [...globalMessages, ...newMsgs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    notifyListeners();
  }
}

function connect() {
  if (globalWs?.readyState === WebSocket.OPEN || globalWs?.readyState === WebSocket.CONNECTING) {
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  const ws = new WebSocket(wsUrl);
  globalWs = ws;

  ws.onopen = () => {
    globalConnected = true;
    notifyListeners();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'history' && Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else if (data.type === 'chat' && data.message) {
        addMessage(data.message);
      }
    } catch (e) {
      // Ignore invalid messages
    }
  };

  ws.onclose = () => {
    globalConnected = false;
    globalWs = null;
    notifyListeners();
    // Reconnect after 3 seconds
    setTimeout(connect, 3000);
  };

  ws.onerror = () => {
    ws.close();
  };
}

// Start connection immediately
connect();

export function useChat(serverId: string | null) {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Filter messages by current serverId
  const messages = serverId
    ? globalMessages.filter((m) => m.serverId === serverId)
    : [];

  return { messages, connected: globalConnected };
}
