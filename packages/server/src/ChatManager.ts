import { EventEmitter } from 'events';

export interface ChatMessage {
  id: string;
  serverId: string;
  player: string;
  playerUuid: string;
  message: string;
  timestamp: string;
}

export class ChatManager extends EventEmitter {
  private messages: Map<string, ChatMessage[]> = new Map();
  private maxMessages = 100;

  addMessage(serverId: string, player: string, playerUuid: string, message: string): ChatMessage {
    const chatMessage: ChatMessage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      serverId,
      player,
      playerUuid,
      message,
      timestamp: new Date().toISOString(),
    };

    if (!this.messages.has(serverId)) {
      this.messages.set(serverId, []);
    }

    const serverMessages = this.messages.get(serverId)!;
    serverMessages.push(chatMessage);

    // Keep only last N messages
    if (serverMessages.length > this.maxMessages) {
      serverMessages.shift();
    }

    this.emit('message', chatMessage);

    return chatMessage;
  }

  getMessages(serverId: string, limit = 50): ChatMessage[] {
    const messages = this.messages.get(serverId) || [];
    return messages.slice(-limit);
  }

  clearMessages(serverId: string): void {
    this.messages.delete(serverId);
  }
}

export const chatManager = new ChatManager();
