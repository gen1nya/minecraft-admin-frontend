import styled from 'styled-components';
import { Container, PageWrapper, theme } from '@/styles';
import { ServerStats, PlayerList, Console } from '@/components';

const Header = styled.header`
  background: ${theme.colors.background.secondary};
  border-bottom: 1px solid ${theme.colors.border.default};
  padding: ${theme.spacing.md} 0;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const Logo = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const LogoAccent = styled.span`
  color: ${theme.colors.primary.main};
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

export function App() {
  return (
    <>
      <Header>
        <Container>
          <HeaderContent>
            <Logo>
              Minecraft <LogoAccent>Admin</LogoAccent>
            </Logo>
          </HeaderContent>
        </Container>
      </Header>

      <PageWrapper>
        <Container>
          <DashboardGrid>
            <ServerStats />
            <PlayerList />
          </DashboardGrid>
          <Console />
        </Container>
      </PageWrapper>
    </>
  );
}
