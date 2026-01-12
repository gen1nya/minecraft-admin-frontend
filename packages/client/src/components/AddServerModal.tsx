import { useState } from 'react';
import styled from 'styled-components';
import { useServer } from '@/context';
import { serversApi } from '@/api/client';
import { theme } from '@/styles';
import { Modal } from './Modal';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const Label = styled.label`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.md};
  transition: border-color ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
  }

  &::placeholder {
    color: ${theme.colors.text.disabled};
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.md};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'success' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  ${({ $variant = 'secondary' }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary.main};
          color: ${theme.colors.primary.contrast};
          border: none;
          &:hover { background: ${theme.colors.primary.light}; }
        `;
      case 'success':
        return `
          background: ${theme.colors.status.online};
          color: white;
          border: none;
          &:hover { opacity: 0.9; }
        `;
      default:
        return `
          background: ${theme.colors.background.tertiary};
          color: ${theme.colors.text.primary};
          border: 1px solid ${theme.colors.border.default};
          &:hover { background: ${theme.colors.background.elevated}; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TestResult = styled.div<{ $success: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  background: ${({ $success }) => $success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
  color: ${({ $success }) => $success ? theme.colors.status.online : theme.colors.status.error};
  border: 1px solid ${({ $success }) => $success ? theme.colors.status.online : theme.colors.status.error};
`;

const ServerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  max-height: 200px;
  overflow-y: auto;
`;

const ServerItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.default};
`;

const ServerName = styled.span`
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ServerHost = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.status.error};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  transition: background ${theme.transitions.fast};

  &:hover {
    background: rgba(244, 67, 54, 0.1);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border.default};
  margin: ${theme.spacing.md} 0;
`;

const SectionTitle = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: 0 0 ${theme.spacing.md} 0;
`;

interface AddServerModalProps {
  onClose: () => void;
}

export function AddServerModal({ onClose }: AddServerModalProps) {
  const { servers, addServer, deleteServer, setCurrentServerId } = useServer();
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('25565');
  const [rconPort, setRconPort] = useState('25575');
  const [rconPassword, setRconPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTestResult(null);

    try {
      const server = await addServer({
        name,
        host,
        port: parseInt(port),
        rconPort: parseInt(rconPort),
        rconPassword,
      });
      setCurrentServerId(server.id);
      onClose();
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to add server',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // First add the server temporarily
      const server = await addServer({
        name: name || 'Test Server',
        host,
        port: parseInt(port),
        rconPort: parseInt(rconPort),
        rconPassword,
      });

      // Test connection
      const result = await serversApi.testConnection(server.id);
      setTestResult(result);

      // If test failed, delete the server
      if (!result.success) {
        await deleteServer(server.id);
      } else {
        // Keep the server and select it
        setCurrentServerId(server.id);
        onClose();
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection test failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this server?')) {
      await deleteServer(id);
    }
  };

  return (
    <Modal open={true} title="Server Management" onClose={onClose}>
      {servers.length > 0 && (
        <>
          <SectionTitle>Configured Servers</SectionTitle>
          <ServerList>
            {servers.map((server) => (
              <ServerItem key={server.id}>
                <div>
                  <ServerName>{server.name}</ServerName>
                  <br />
                  <ServerHost>{server.host}:{server.rconPort}</ServerHost>
                </div>
                <DeleteButton onClick={() => handleDelete(server.id)} title="Delete server">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </DeleteButton>
              </ServerItem>
            ))}
          </ServerList>
          <Divider />
        </>
      )}

      <SectionTitle>Add New Server</SectionTitle>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Server Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Minecraft Server"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Host</Label>
          <Input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="localhost or IP address"
            required
          />
        </FormGroup>

        <Row>
          <FormGroup>
            <Label>Game Port</Label>
            <Input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="25565"
            />
          </FormGroup>

          <FormGroup>
            <Label>RCON Port</Label>
            <Input
              type="number"
              value={rconPort}
              onChange={(e) => setRconPort(e.target.value)}
              placeholder="25575"
              required
            />
          </FormGroup>
        </Row>

        <FormGroup>
          <Label>RCON Password</Label>
          <Input
            type="password"
            value={rconPassword}
            onChange={(e) => setRconPassword(e.target.value)}
            placeholder="Your RCON password"
            required
          />
        </FormGroup>

        {testResult && (
          <TestResult $success={testResult.success}>
            {testResult.success ? '✓ ' : '✗ '}
            {testResult.message}
          </TestResult>
        )}

        <ButtonRow>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleTest} disabled={loading || !host || !rconPort || !rconPassword}>
            Test & Add
          </Button>
          <Button type="submit" $variant="primary" disabled={loading || !name || !host || !rconPort || !rconPassword}>
            {loading ? 'Adding...' : 'Add Server'}
          </Button>
        </ButtonRow>
      </Form>
    </Modal>
  );
}
