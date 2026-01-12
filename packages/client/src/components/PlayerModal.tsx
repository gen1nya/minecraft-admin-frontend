import { useState } from 'react';
import styled from 'styled-components';
import { theme, Button, StatusBadge, Input } from '@/styles';
import { Modal } from './Modal';
import { useServer } from '@/context';
import type { GameMode, Player } from '@/api';

const PlayerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const AvatarLarge = styled.img`
  width: 64px;
  height: 64px;
  border-radius: ${theme.borderRadius.md};
  image-rendering: pixelated;
  background: ${theme.colors.background.tertiary};
`;

const PlayerInfo = styled.div`
  flex: 1;
`;

const PlayerName = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const PlayerUuid = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-family: ${theme.typography.fontFamily.mono};
  color: ${theme.colors.text.disabled};
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const GameModeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.sm};
`;

const GameModeButton = styled.button<{ $active?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${props => props.$active ? theme.colors.primary.main : theme.colors.background.tertiary};
  border: 1px solid ${props => props.$active ? theme.colors.primary.main : theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  color: ${props => props.$active ? theme.colors.primary.contrast : theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.$active ? theme.colors.primary.light : theme.colors.background.elevated};
    border-color: ${props => props.$active ? theme.colors.primary.light : theme.colors.border.light};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionButton = styled(Button)<{ $danger?: boolean }>`
  width: 100%;
  justify-content: center;

  ${props => props.$danger && `
    background: transparent;
    border: 1px solid ${theme.colors.status.error};
    color: ${theme.colors.status.error};

    &:hover:not(:disabled) {
      background: ${theme.colors.status.error}20;
    }
  `}
`;

const WarningText = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.status.warning};
  margin-top: ${theme.spacing.xs};
`;

const DisabledHint = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.disabled};
  text-align: center;
  padding: ${theme.spacing.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const BanForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const BanInput = styled(Input)`
  width: 100%;
`;

const GAME_MODES: { value: GameMode; label: string }[] = [
  { value: 'survival', label: 'Survival' },
  { value: 'creative', label: 'Creative' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'spectator', label: 'Spectator' },
];

interface PlayerModalProps {
  player: Player | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function PlayerModal({ player, onClose, onUpdate }: PlayerModalProps) {
  const { api } = useServer();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmBan, setConfirmBan] = useState(false);
  const [banReason, setBanReason] = useState('');

  if (!player || !api) return null;

  const currentMode = player.gameMode.toLowerCase() as GameMode;

  const handleAction = async (action: string, fn: () => Promise<unknown>, closeAfter = false) => {
    setLoading(action);
    try {
      await fn();
      onUpdate();
      if (closeAfter) {
        onClose();
      }
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
    } finally {
      setLoading(null);
      setConfirmRemove(false);
      setConfirmBan(false);
      setBanReason('');
    }
  };

  const handleRemoveClick = () => {
    if (confirmRemove) {
      handleAction('remove', () => api.whitelistRemove(player.name), true);
    } else {
      setConfirmRemove(true);
    }
  };

  const handleBanClick = () => {
    if (confirmBan) {
      handleAction('ban', () => api.ban(player.name, banReason || undefined), true);
    } else {
      setConfirmBan(true);
    }
  };

  return (
    <Modal open={!!player} onClose={onClose} title="Player Details">
      <PlayerHeader>
        <AvatarLarge
          src={`https://mc-heads.net/avatar/${player.uuid}/64`}
          alt={player.name}
        />
        <PlayerInfo>
          <PlayerName>{player.name}</PlayerName>
          <PlayerUuid>{player.uuid}</PlayerUuid>
        </PlayerInfo>
        <StatusBadge status={player.isOnline ? 'online' : 'offline'}>
          {player.isOnline ? 'Online' : 'Offline'}
        </StatusBadge>
      </PlayerHeader>

      <Section>
        <SectionTitle>Game Mode</SectionTitle>
        {player.isOnline ? (
          <GameModeGrid>
            {GAME_MODES.map(mode => (
              <GameModeButton
                key={mode.value}
                $active={currentMode === mode.value}
                disabled={loading !== null}
                onClick={() => handleAction('gamemode', () => api.setGameMode(player.name, mode.value))}
              >
                {loading === 'gamemode' ? '...' : mode.label}
              </GameModeButton>
            ))}
          </GameModeGrid>
        ) : (
          <DisabledHint>Player must be online to change game mode</DisabledHint>
        )}
      </Section>

      <Section>
        <SectionTitle>Permissions</SectionTitle>
        <ButtonGroup>
          {player.isOp ? (
            <ActionButton
              variant="secondary"
              onClick={() => handleAction('deop', () => api.deop(player.name))}
              disabled={loading !== null}
            >
              {loading === 'deop' ? 'Removing...' : 'Remove Operator'}
            </ActionButton>
          ) : (
            <ActionButton
              onClick={() => handleAction('op', () => api.op(player.name))}
              disabled={loading !== null}
            >
              {loading === 'op' ? 'Granting...' : 'Make Operator'}
            </ActionButton>
          )}
          <WarningText>
            {player.isOp
              ? 'This player has full server access'
              : 'Operators have full access to server commands'
            }
          </WarningText>
        </ButtonGroup>
      </Section>

      {player.isOnline && (
        <Section>
          <SectionTitle>Quick Actions</SectionTitle>
          <ActionButton
            variant="secondary"
            onClick={() => handleAction('kick', () => api.kick(player.name))}
            disabled={loading !== null}
          >
            {loading === 'kick' ? 'Kicking...' : 'Kick from Server'}
          </ActionButton>
        </Section>
      )}

      <Section>
        <SectionTitle>Danger Zone</SectionTitle>
        <ButtonGroup>
          {player.isBanned ? (
            <ActionButton
              onClick={() => handleAction('pardon', () => api.pardon(player.name))}
              disabled={loading !== null}
            >
              {loading === 'pardon' ? 'Unbanning...' : 'Unban Player'}
            </ActionButton>
          ) : confirmBan ? (
            <BanForm>
              <BanInput
                type="text"
                placeholder="Ban reason (optional)"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                disabled={loading !== null}
                autoFocus
              />
              <ButtonRow>
                <ActionButton
                  $danger
                  onClick={handleBanClick}
                  disabled={loading !== null}
                >
                  {loading === 'ban' ? 'Banning...' : 'Confirm Ban'}
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  onClick={() => setConfirmBan(false)}
                  disabled={loading !== null}
                >
                  Cancel
                </ActionButton>
              </ButtonRow>
            </BanForm>
          ) : (
            <ActionButton
              $danger
              onClick={handleBanClick}
              disabled={loading !== null}
            >
              Ban Player
            </ActionButton>
          )}

          <ActionButton
            $danger
            onClick={handleRemoveClick}
            disabled={loading !== null}
          >
            {loading === 'remove'
              ? 'Removing...'
              : confirmRemove
                ? 'Click again to confirm'
                : 'Remove from Whitelist'
            }
          </ActionButton>
          {confirmRemove && (
            <WarningText>This will prevent the player from joining the server</WarningText>
          )}
        </ButtonGroup>
      </Section>
    </Modal>
  );
}
