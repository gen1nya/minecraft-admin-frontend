import { EventEmitter } from 'events';
import type { GameEvent } from './gameEvent';

export interface StoredEvent extends GameEvent {
  id: string;
  serverId: string;
}

/**
 * In-memory per-server log of game events (chat, join, leave, deaths, ...).
 * Supersedes the chat-only ChatManager: chat is now just `type: 'chat'`.
 * Stores a bounded history per server and emits `'event'` on every new event so
 * the WebSocket layer can broadcast it.
 */
export class EventManager extends EventEmitter {
  private events: Map<string, StoredEvent[]> = new Map();
  private maxEvents = 100;

  addEvent(serverId: string, event: GameEvent): StoredEvent {
    const stored: StoredEvent = {
      ...event,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      serverId,
    };

    if (!this.events.has(serverId)) {
      this.events.set(serverId, []);
    }

    const serverEvents = this.events.get(serverId)!;
    serverEvents.push(stored);

    // Keep only last N events
    if (serverEvents.length > this.maxEvents) {
      serverEvents.shift();
    }

    this.emit('event', stored);

    return stored;
  }

  getEvents(serverId: string, limit = 50): StoredEvent[] {
    const events = this.events.get(serverId) || [];
    return events.slice(-limit);
  }

  getAllEvents(limit = 100): StoredEvent[] {
    const allEvents: StoredEvent[] = [];
    for (const events of this.events.values()) {
      allEvents.push(...events);
    }
    return allEvents
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);
  }

  clearEvents(serverId: string): void {
    this.events.delete(serverId);
  }
}

export const eventManager = new EventManager();
