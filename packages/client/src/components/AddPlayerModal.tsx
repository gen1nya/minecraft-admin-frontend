import { useState } from 'react';
import styled from 'styled-components';
import { theme, Button, Input } from '@/styles';
import { Modal } from './Modal';
import { api } from '@/api';
import type { MojangProfile } from '@/api';

const SearchForm = styled.form`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const SearchInput = styled(Input)`
  flex: 1;
`;

const PlayerPreview = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.lg};
`;

const AvatarLarge = styled.img`
  width: 64px;
  height: 64px;
  border-radius: ${theme.borderRadius.md};
  image-rendering: pixelated;
  background: ${theme.colors.background.elevated};
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

const ActionButton = styled(Button)`
  width: 100%;
  justify-content: center;
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.status.error};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  padding: ${theme.spacing.md};
  background: ${theme.colors.status.error}15;
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.lg};
`;

const HintText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  padding: ${theme.spacing.lg};
`;

const AlreadyExistsMessage = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.status.warning};
  text-align: center;
  padding: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

type ModalState = 'idle' | 'searching' | 'found' | 'not_found' | 'adding';

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingPlayerIds: string[];
}

function formatUuid(id: string): string {
  const clean = id.replace(/-/g, '');
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

export function AddPlayerModal({ open, onClose, onSuccess, existingPlayerIds }: AddPlayerModalProps) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<ModalState>('idle');
  const [profile, setProfile] = useState<MojangProfile | null>(null);

  const alreadyExists = profile
    ? existingPlayerIds.some(id => id.replace(/-/g, '').toLowerCase() === profile.id.toLowerCase())
    : false;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setState('searching');
    setProfile(null);

    try {
      const result = await api.lookupPlayer(query.trim());
      setProfile(result);
      setState('found');
    } catch {
      setState('not_found');
    }
  };

  const handleAdd = async () => {
    if (!profile) return;

    setState('adding');
    try {
      await api.whitelistAdd(profile.name);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Failed to add player:', err);
      setState('found');
    }
  };

  const handleClose = () => {
    setQuery('');
    setState('idle');
    setProfile(null);
    onClose();
  };

  const isSearching = state === 'searching';
  const isAdding = state === 'adding';

  return (
    <Modal open={open} onClose={handleClose} title="Add Player to Whitelist">
      <SearchForm onSubmit={handleSearch}>
        <SearchInput
          type="text"
          placeholder="Enter username or UUID..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          disabled={isSearching || isAdding}
          autoFocus
        />
        <Button type="submit" disabled={isSearching || isAdding || !query.trim()}>
          {isSearching ? '...' : 'Find'}
        </Button>
      </SearchForm>

      {state === 'not_found' && (
        <ErrorMessage>Player not found. Check the username or UUID.</ErrorMessage>
      )}

      {state === 'idle' && (
        <HintText>Search for a player by their Minecraft username or UUID</HintText>
      )}

      {profile && (state === 'found' || state === 'adding') && (
        <>
          <PlayerPreview>
            <AvatarLarge
              src={`https://mc-heads.net/avatar/${profile.id}/64`}
              alt={profile.name}
            />
            <PlayerInfo>
              <PlayerName>{profile.name}</PlayerName>
              <PlayerUuid>{formatUuid(profile.id)}</PlayerUuid>
            </PlayerInfo>
          </PlayerPreview>

          <ActionButton onClick={handleAdd} disabled={isAdding || alreadyExists}>
            {isAdding ? 'Adding...' : 'Add to Whitelist'}
          </ActionButton>
          {alreadyExists && (
            <AlreadyExistsMessage>This player is already in the whitelist</AlreadyExistsMessage>
          )}
        </>
      )}
    </Modal>
  );
}
