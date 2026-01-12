import { useState } from 'react';
import styled from 'styled-components';
import { theme, Card, CardHeader, CardTitle, Skeleton, Flex, StatusBadge } from '@/styles';
import { useServerStats } from '@/hooks';
import { useServer } from '@/context';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  background: ${theme.colors.background.tertiary};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${theme.spacing.xs};
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const MemoryBar = styled.div`
  margin-top: ${theme.spacing.md};
`;

const MemoryLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

const MemoryTrack = styled.div`
  height: 8px;
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
`;

const MemoryFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${props => props.percent}%;
  background: ${props =>
    props.percent > 80
      ? theme.colors.status.error
      : props.percent > 60
        ? theme.colors.status.warning
        : theme.colors.primary.main};
  border-radius: ${theme.borderRadius.sm};
  transition: width ${theme.transitions.normal};
`;

const Version = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.mono};
`;

const ErrorText = styled.div`
  color: ${theme.colors.status.error};
  font-size: ${theme.typography.fontSize.sm};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
`;

const TpsValue = styled.span<{ $value: number }>`
  color: ${props =>
    props.$value >= 19 ? theme.colors.status.online :
    props.$value >= 15 ? theme.colors.status.warning :
    theme.colors.status.error};
`;

const TpsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const TpsItem = styled.div`
  background: ${theme.colors.background.tertiary};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  text-align: center;
`;

const TpsLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

const TpsNumber = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const BroadcastSection = styled.div`
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.default};
`;

const BroadcastButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};

  &:hover {
    background: ${theme.colors.background.elevated};
    border-color: ${theme.colors.border.light};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BroadcastForm = styled.form`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const BroadcastInput = styled.input`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};

  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
  }

  &::placeholder {
    color: ${theme.colors.text.disabled};
  }
`;

const SendButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.primary.main};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary.contrast};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: background ${theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${theme.colors.primary.light};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: ${theme.spacing.sm};
  background: transparent;
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.background.tertiary};
  }
`;

export function ServerStats() {
  const { stats, loading, error } = useServerStats(5000);
  const { api } = useServer();
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const memoryPercent = stats
    ? Math.round((stats.memoryUsedMB / stats.memoryAllocatedMB) * 100)
    : 0;

  const isOnline = stats !== null && !error;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !api) return;

    setSending(true);
    try {
      await api.sendCommand(`say ${message}`);
      setMessage('');
      setShowBroadcast(false);
    } catch (err) {
      console.error('Failed to broadcast:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <HeaderRow>
          <CardTitle>Server Status</CardTitle>
          <StatusBadge status={isOnline ? 'online' : 'offline'}>
            {isOnline ? 'Online' : 'Offline'}
          </StatusBadge>
        </HeaderRow>
      </CardHeader>

      {stats && <Version>{stats.version}</Version>}

      {error && <ErrorText>{error}</ErrorText>}

      {loading && !stats ? (
        <Flex direction="column" gap="md">
          <Skeleton height="60px" />
          <Skeleton height="60px" />
        </Flex>
      ) : stats ? (
        <>
          <StatsGrid>
            <StatItem>
              <StatLabel>Players Online</StatLabel>
              <StatValue>{stats.onlinePlayers}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Memory Usage</StatLabel>
              <StatValue>{memoryPercent}%</StatValue>
            </StatItem>
          </StatsGrid>

          <TpsGrid>
            <TpsItem>
              <TpsLabel>TPS (1m)</TpsLabel>
              <TpsNumber>
                <TpsValue $value={stats.tps1m}>{stats.tps1m.toFixed(1)}</TpsValue>
              </TpsNumber>
            </TpsItem>
            <TpsItem>
              <TpsLabel>TPS (5m)</TpsLabel>
              <TpsNumber>
                <TpsValue $value={stats.tps5m}>{stats.tps5m.toFixed(1)}</TpsValue>
              </TpsNumber>
            </TpsItem>
            <TpsItem>
              <TpsLabel>TPS (15m)</TpsLabel>
              <TpsNumber>
                <TpsValue $value={stats.tps15m}>{stats.tps15m.toFixed(1)}</TpsValue>
              </TpsNumber>
            </TpsItem>
          </TpsGrid>

          <MemoryBar>
            <MemoryLabel>
              <span>Memory</span>
              <span>
                {stats.memoryUsedMB} / {stats.memoryAllocatedMB} MB
              </span>
            </MemoryLabel>
            <MemoryTrack>
              <MemoryFill percent={memoryPercent} />
            </MemoryTrack>
          </MemoryBar>

          <BroadcastSection>
            {showBroadcast ? (
              <BroadcastForm onSubmit={handleBroadcast}>
                <BroadcastInput
                  type="text"
                  placeholder="Message to all players..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  disabled={sending}
                  autoFocus
                />
                <SendButton type="submit" disabled={sending || !message.trim()}>
                  {sending ? '...' : 'Send'}
                </SendButton>
                <CancelButton type="button" onClick={() => setShowBroadcast(false)}>
                  ✕
                </CancelButton>
              </BroadcastForm>
            ) : (
              <BroadcastButton onClick={() => setShowBroadcast(true)} disabled={!api}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                </svg>
                Broadcast
              </BroadcastButton>
            )}
          </BroadcastSection>
        </>
      ) : null}
    </Card>
  );
}
