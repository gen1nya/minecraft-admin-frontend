import styled from 'styled-components';
import { Container, PageWrapper, theme } from '@/styles';
import { ServerStats, PlayerList, Console, Chat, ServerSelector } from '@/components';
import { ServerProvider, useServer } from '@/context';

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
  background: rgba(13, 17, 16, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${theme.colors.border.default};
  padding: ${theme.spacing.md} 0;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.tablet}) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const Logo = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const LogoAccent = styled.span`
  color: ${theme.colors.primary.main};
`;

const HeaderMeta = styled.div`
  margin-top: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const HeaderControls = styled.div`
  display: flex;
  justify-content: flex-end;

  @media (max-width: ${theme.breakpoints.tablet}) {
    justify-content: stretch;
  }
`;

const Dashboard = styled.div`
  display: grid;
  grid-template-columns: minmax(320px, 0.85fr) minmax(460px, 1.15fr);
  grid-template-areas:
    "stats players"
    "console chat";
  gap: ${theme.spacing.lg};
  align-items: start;

  @media (max-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "stats"
      "players"
      "console"
      "chat";
  }
`;

const PanelSlot = styled.div<{ $area: 'stats' | 'players' | 'console' | 'chat' }>`
  grid-area: ${props => props.$area};
  min-width: 0;
`;

function AppContent() {
  const { currentServer, servers, loading, error } = useServer();
  const serverLabel = currentServer
    ? `${currentServer.host}:${currentServer.rconPort}`
    : loading
      ? 'Loading servers'
      : 'No server selected';

  return (
    <>
      <Header>
        <Container>
          <HeaderContent>
            <div>
              <Logo>
                Minecraft <LogoAccent>Admin</LogoAccent>
              </Logo>
              <HeaderMeta>
                {error ? error : `${servers.length} configured · ${serverLabel}`}
              </HeaderMeta>
            </div>
            <HeaderControls>
              <ServerSelector />
            </HeaderControls>
          </HeaderContent>
        </Container>
      </Header>

      <PageWrapper>
        <Container>
          <Dashboard>
            <PanelSlot $area="stats">
              <ServerStats />
            </PanelSlot>
            <PanelSlot $area="players">
              <PlayerList />
            </PanelSlot>
            <PanelSlot $area="console">
              <Console />
            </PanelSlot>
            <PanelSlot $area="chat">
              <Chat />
            </PanelSlot>
          </Dashboard>
        </Container>
      </PageWrapper>
    </>
  );
}

export function App() {
  return (
    <ServerProvider>
      <AppContent />
    </ServerProvider>
  );
}
