import { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme, Card, CardHeader, CardTitle } from '@/styles';
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
  background: ${props => props.$connected ? theme.colors.status.success : theme.colors.status.error};
`;

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function Chat() {
  const { currentServerId } = useServer();
  const { messages, connected } = useChat(currentServerId);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

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
          {messages.length === 0 ? (
            <EmptyState>No messages yet</EmptyState>
          ) : (
            messages.map((msg) => (
              <MessageRow key={msg.id}>
                <Timestamp>[{formatTime(msg.timestamp)}]</Timestamp>
                <PlayerName>&lt;{msg.player}&gt;</PlayerName>
                <MessageText>{msg.message}</MessageText>
              </MessageRow>
            ))
          )}
        </MessagesArea>
      </ChatBody>
    </Card>
  );
}
