import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme, Card, CardHeader, CardTitle, Button, Input } from '@/styles';
import { useServer } from '@/context';
import { useChat } from '@/hooks/useChat';

const ChatBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const MessagesArea = styled.div`
  background: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.sm};
`;

const MessageRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};

  &:last-child {
    margin-bottom: 0;
  }
`;

const Timestamp = styled.span`
  color: ${theme.colors.text.disabled};
  flex-shrink: 0;
`;

const PlayerName = styled.span`
  color: ${theme.colors.primary.light};
  font-weight: ${theme.typography.fontWeight.medium};
  flex-shrink: 0;
`;

const MessageText = styled.span`
  color: ${theme.colors.text.secondary};
  word-break: break-word;
`;

const AdminMessage = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};
  opacity: 0.7;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AdminTag = styled.span`
  color: ${theme.colors.secondary.light};
  font-weight: ${theme.typography.fontWeight.medium};
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  color: ${theme.colors.text.disabled};
  text-align: center;
  padding: ${theme.spacing.lg};
`;

const StatusBar = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.disabled};
`;

const StatusDot = styled.span<{ $connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$connected ? theme.colors.status.online : theme.colors.status.error};
`;

const InputRow = styled.form`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const MessageInput = styled(Input)`
  flex: 1;
  font-family: ${theme.typography.fontFamily.mono};
`;

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

interface LocalMessage {
  id: string;
  text: string;
  timestamp: string;
}

export function Chat() {
  const { currentServerId, api } = useServer();
  const { messages, connected } = useChat(currentServerId);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine and sort messages
  const allMessages = [
    ...messages.map(m => ({ ...m, type: 'player' as const })),
    ...localMessages.map(m => ({ ...m, type: 'admin' as const })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [allMessages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = message.trim();
    if (!msg || !api) return;

    const localMsg: LocalMessage = {
      id: `local_${Date.now()}`,
      text: msg,
      timestamp: new Date().toISOString(),
    };

    setSending(true);
    setMessage('');

    try {
      await api.sendCommand(`say ${msg}`);
      setLocalMessages(prev => [...prev, localMsg]);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Chat</CardTitle>
        <StatusBar $connected={connected}>
          <StatusDot $connected={connected} />
          {connected ? 'Connected' : 'Disconnected'}
        </StatusBar>
      </CardHeader>
      <ChatBody>
        <MessagesArea ref={messagesRef}>
          {allMessages.length === 0 ? (
            <EmptyState>No messages yet</EmptyState>
          ) : (
            allMessages.map((msg) => (
              msg.type === 'player' ? (
                <MessageRow key={msg.id}>
                  <Timestamp>[{formatTime(msg.timestamp)}]</Timestamp>
                  <PlayerName>&lt;{msg.player}&gt;</PlayerName>
                  <MessageText>{msg.message}</MessageText>
                </MessageRow>
              ) : (
                <AdminMessage key={msg.id}>
                  <Timestamp>[{formatTime(msg.timestamp)}]</Timestamp>
                  <AdminTag>[Server]</AdminTag>
                  <MessageText>{msg.text}</MessageText>
                </AdminMessage>
              )
            ))
          )}
        </MessagesArea>
        <InputRow onSubmit={handleSubmit}>
          <MessageInput
            ref={inputRef}
            type="text"
            placeholder="Send message to game..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={sending || !api}
          />
          <Button type="submit" disabled={sending || !message.trim() || !api}>
            {sending ? '...' : 'Send'}
          </Button>
        </InputRow>
      </ChatBody>
    </Card>
  );
}
