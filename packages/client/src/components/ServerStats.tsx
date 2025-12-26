import styled from 'styled-components';
import { theme, Card, CardHeader, CardTitle, Skeleton, Flex } from '@/styles';
import { useServerStats } from '@/hooks';

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

export function ServerStats() {
  const { stats, loading, error } = useServerStats();

  const memoryPercent = stats
    ? Math.round((stats.memoryUsedMB / stats.memoryAllocatedMB) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Status</CardTitle>
        {stats && <Version>{stats.version}</Version>}
      </CardHeader>

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
