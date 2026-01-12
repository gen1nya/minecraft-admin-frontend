import { useState } from 'react';
import styled from 'styled-components';
import { useServer } from '@/context';
import { theme } from '@/styles';
import { AddServerModal } from './AddServerModal';

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Select = styled.select`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  min-width: 200px;
  transition: border-color ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.border.light};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
  }

  option {
    background: ${theme.colors.background.elevated};
    color: ${theme.colors.text.primary};
  }
`;

const IconButton = styled.button`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.background.elevated};
    border-color: ${theme.colors.border.light};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
  }
`;

const NoServersMessage = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

export function ServerSelector() {
  const { servers, currentServerId, setCurrentServerId, loading } = useServer();
  const [showAddModal, setShowAddModal] = useState(false);

  if (loading) {
    return (
      <SelectorContainer>
        <NoServersMessage>Loading servers...</NoServersMessage>
      </SelectorContainer>
    );
  }

  return (
    <SelectorContainer>
      {servers.length === 0 ? (
        <NoServersMessage>No servers configured</NoServersMessage>
      ) : (
        <Select
          value={currentServerId || ''}
          onChange={(e) => setCurrentServerId(e.target.value)}
        >
          {servers.map((server) => (
            <option key={server.id} value={server.id}>
              {server.name}
            </option>
          ))}
        </Select>
      )}

      <IconButton onClick={() => setShowAddModal(true)} title="Add Server">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
        </svg>
      </IconButton>

      <IconButton onClick={() => setShowAddModal(true)} title="Manage Servers">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
        </svg>
      </IconButton>

      {showAddModal && (
        <AddServerModal onClose={() => setShowAddModal(false)} />
      )}
    </SelectorContainer>
  );
}
