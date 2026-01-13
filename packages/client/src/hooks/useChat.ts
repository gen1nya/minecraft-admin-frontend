import { useState, useEffect, useRef, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  serverId: string;
  player: string;
  playerUuid: string;
  message: string;
  timestamp: string;
}

export function useChat(serverId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>();

  const connect = useCallback(() => {
    if (!serverId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'subscribe', serverId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'history') {
          setMessages(data.messages);
        } else if (data.type === 'chat') {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (e) {
        // Ignore invalid messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [serverId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Resubscribe when serverId changes
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && serverId) {
      setMessages([]);
      wsRef.current.send(JSON.stringify({ type: 'subscribe', serverId }));
    }
  }, [serverId]);

  return { messages, connected };
}
