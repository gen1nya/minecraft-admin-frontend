import { useState } from 'react';
import styled from 'styled-components';
import { theme, Card, CardHeader, CardTitle, Skeleton, Flex, StatusBadge, Button, Input } from '@/styles';
import { usePlayers } from '@/hooks';
import { api } from '@/api';
import type { Player } from '@/api';
import { PlayerModal } from './PlayerModal';

const PlayerGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
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

const AddPlayerForm = styled.form`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const AddInput = styled(Input)`
  flex: 1;
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
  const [newPlayer, setNewPlayer] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Всегда берём актуальные данные игрока из списка
  const selectedPlayer = selectedPlayerId
    ? players.find(p => p.uuid === selectedPlayerId) ?? null
    : null;

  const onlineCount = players.filter(p => p.isOnline).length;
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
    if (a.isOp !== b.isOp) return a.isOp ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayer.trim()) return;

    setAddLoading(true);
    try {
      await api.whitelistAdd(newPlayer.trim());
      setNewPlayer('');
      refetch();
    } catch (err) {
      console.error('Failed to add player:', err);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            Players <OnlineCount>({onlineCount} online)</OnlineCount>
          </CardTitle>
        </CardHeader>

        <AddPlayerForm onSubmit={handleAddPlayer}>
          <AddInput
            type="text"
            placeholder="Add player to whitelist..."
            value={newPlayer}
            onChange={e => setNewPlayer(e.target.value)}
            disabled={addLoading}
          />
          <Button type="submit" disabled={addLoading || !newPlayer.trim()}>
            {addLoading ? '...' : 'Add'}
          </Button>
        </AddPlayerForm>

        {error && <ErrorText>{error}</ErrorText>}

        {loading && players.length === 0 ? (
          <Flex direction="column" gap="sm">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} height="48px" />
            ))}
          </Flex>
        ) : players.length === 0 ? (
          <EmptyState>No players in whitelist</EmptyState>
        ) : (
          <PlayerGrid>
            {sortedPlayers.map(player => (
              <PlayerRow key={player.uuid} onClick={() => setSelectedPlayerId(player.uuid)}>
                <Avatar uuid={player.uuid} name={player.name} />
                <PlayerInfo>
                  <PlayerName>
                    {player.name}
                    {player.isOp && <OpBadge>OP</OpBadge>}
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
        )}
      </Card>

      <PlayerModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayerId(null)}
        onUpdate={refetch}
      />
    </>
  );
}
