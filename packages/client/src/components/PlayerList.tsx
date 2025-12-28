import { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { theme, Card, CardHeader, CardTitle, Skeleton, Flex, StatusBadge, Button, Input } from '@/styles';
import { usePlayers } from '@/hooks';
import type { Player } from '@/api';
import { PlayerModal } from './PlayerModal';
import { AddPlayerModal } from './AddPlayerModal';

const PlayerGridWrapper = styled.div<{ $showTopFade: boolean }>`
  position: relative;
  max-height: 400px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 6px;
    height: 40px;
    background: linear-gradient(to top, transparent, ${theme.colors.background.secondary});
    pointer-events: none;
    z-index: 1;
    opacity: ${props => props.$showTopFade ? 1 : 0};
    transition: opacity ${theme.transitions.fast};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(to bottom, transparent, ${theme.colors.background.secondary});
    pointer-events: none;
    border-radius: 0 0 ${theme.borderRadius.md} ${theme.borderRadius.md};
  }
`;

const PlayerGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: ${theme.spacing.xs};
  padding-bottom: 24px;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.default};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.border.light};
  }
`;

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.background.elevated};
    transform: translateX(4px);
  }
`;

const AvatarWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
  background: ${theme.colors.background.elevated};
  flex-shrink: 0;
`;

const PlayerAvatar = styled.img`
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  display: block;
`;

const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.secondary};
  background: ${theme.colors.primary.dark};
`;

const PlayerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PlayerName = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const OpBadge = styled.span`
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${theme.colors.secondary.main}30;
  color: ${theme.colors.secondary.light};
`;

const BannedBadge = styled.span`
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${theme.colors.status.error}30;
  color: ${theme.colors.status.error};
`;

const PlayerMeta = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const ErrorText = styled.div`
  color: ${theme.colors.status.error};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.md};
`;

const OnlineCount = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.regular};
`;

const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const SearchRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const SearchInput = styled(Input)`
  flex: 1;
`;

const FilterRow = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

type FilterType = 'all' | 'online' | 'banned';

const FilterButton = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  border: 1px solid ${props => props.$active ? theme.colors.primary.main : theme.colors.border.default};
  background: ${props => props.$active ? theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? theme.colors.primary.contrast : theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.primary.main};
    color: ${props => props.$active ? theme.colors.primary.contrast : theme.colors.primary.main};
  }
`;

function getAvatarUrl(uuid: string): string {
  return `https://mc-heads.net/avatar/${uuid}/32`;
}

function formatGameMode(mode: Player['gameMode']): string | null {
  if (mode === 'unknown') return null;
  return mode.charAt(0) + mode.slice(1).toLowerCase();
}

function Avatar({ uuid, name }: { uuid: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <AvatarWrapper>
        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
      </AvatarWrapper>
    );
  }

  return (
    <AvatarWrapper>
      <PlayerAvatar
        src={getAvatarUrl(uuid)}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </AvatarWrapper>
  );
}

export function PlayerList() {
  const { players, loading, error, refetch } = usePlayers();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 10);
  }, []);

  const selectedPlayer = selectedPlayerId
    ? players.find(p => p.uuid === selectedPlayerId) ?? null
    : null;

  const onlineCount = players.filter(p => p.isOnline).length;
  const bannedCount = players.filter(p => p.isBanned).length;

  const filteredPlayers = useMemo(() => {
    let result = [...players];

    // Apply search
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.uuid.toLowerCase().includes(query)
      );
    }

    // Apply filter
    if (filter === 'online') {
      result = result.filter(p => p.isOnline);
    } else if (filter === 'banned') {
      result = result.filter(p => p.isBanned);
    }

    // Sort
    return result.sort((a, b) => {
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      if (a.isOp !== b.isOp) return a.isOp ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [players, search, filter]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            Players <OnlineCount>({onlineCount} online)</OnlineCount>
          </CardTitle>
        </CardHeader>

        <Toolbar>
          <SearchRow>
            <SearchInput
              type="text"
              placeholder="Search by name or UUID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Button onClick={() => setAddModalOpen(true)}>
              + Add
            </Button>
          </SearchRow>
          <FilterRow>
            <FilterButton $active={filter === 'all'} onClick={() => setFilter('all')}>
              All ({players.length})
            </FilterButton>
            <FilterButton $active={filter === 'online'} onClick={() => setFilter('online')}>
              Online ({onlineCount})
            </FilterButton>
            <FilterButton $active={filter === 'banned'} onClick={() => setFilter('banned')}>
              Banned ({bannedCount})
            </FilterButton>
          </FilterRow>
        </Toolbar>

        {error && <ErrorText>{error}</ErrorText>}

        {loading && players.length === 0 ? (
          <Flex direction="column" gap="sm">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} height="48px" />
            ))}
          </Flex>
        ) : filteredPlayers.length === 0 ? (
          <EmptyState>
            {players.length === 0 ? 'No players in whitelist' : 'No players match your search'}
          </EmptyState>
        ) : (
          <PlayerGridWrapper $showTopFade={isScrolled}>
            <PlayerGrid onScroll={handleScroll}>
              {filteredPlayers.map(player => (
                <PlayerRow key={player.uuid} onClick={() => setSelectedPlayerId(player.uuid)}>
                  <Avatar uuid={player.uuid} name={player.name} />
                  <PlayerInfo>
                    <PlayerName>
                      {player.name}
                      {player.isOp && <OpBadge>OP</OpBadge>}
                      {player.isBanned && <BannedBadge>Banned</BannedBadge>}
                    </PlayerName>
                    <PlayerMeta>
                      {formatGameMode(player.gameMode) || 'Click to manage'}
                    </PlayerMeta>
                  </PlayerInfo>
                  <StatusBadge status={player.isOnline ? 'online' : 'offline'}>
                    {player.isOnline ? 'Online' : 'Offline'}
                  </StatusBadge>
                </PlayerRow>
              ))}
            </PlayerGrid>
          </PlayerGridWrapper>
        )}
      </Card>

      <PlayerModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayerId(null)}
        onUpdate={refetch}
      />

      <AddPlayerModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={refetch}
        existingPlayerIds={players.map(p => p.uuid)}
      />
    </>
  );
}
