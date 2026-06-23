import styled from 'styled-components';
import { theme, Card, CardHeader, CardTitle, Skeleton, Flex, StatusBadge } from '@/styles';
import { useServerStats } from '@/hooks';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.default};
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
  font-size: ${theme.typography.fontSize.lg};
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
  height: 10px;
  background: ${theme.colors.background.tertiary};
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid ${theme.colors.border.default};
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
  border-radius: 999px;
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
  border: 1px solid ${theme.colors.border.default};
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

const SummaryPanel = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.lg};
  background:
    linear-gradient(135deg, rgba(101, 163, 58, 0.16), transparent 55%),
    ${theme.colors.background.tertiary};

  @media (max-width: ${theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const SummaryLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

const SummaryValue = styled.div`
  font-size: ${theme.typography.fontSize.xxl};
  line-height: ${theme.typography.lineHeight.tight};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

export function ServerStats() {
  const { stats, loading, error } = useServerStats(5000);

  const memoryPercent = stats
    ? Math.min(100, Math.round((stats.memoryUsedMB / Math.max(stats.memoryAllocatedMB, 1)) * 100))
    : 0;

  const isOnline = stats !== null && !error;

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

      {error && <ErrorText>{error}</ErrorText>}

      {loading && !stats ? (
        <Flex direction="column" gap="md">
          <Skeleton height="60px" />
          <Skeleton height="60px" />
        </Flex>
      ) : stats ? (
        <>
          <SummaryPanel>
            <div>
              <SummaryLabel>Players Online</SummaryLabel>
              <SummaryValue>{stats.onlinePlayers}</SummaryValue>
            </div>
            <Version>{stats.version}</Version>
          </SummaryPanel>

          <StatsGrid>
            <StatItem>
              <StatLabel>Memory Used</StatLabel>
              <StatValue>{stats.memoryUsedMB} MB</StatValue>
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
        </>
      ) : null}
    </Card>
  );
}
