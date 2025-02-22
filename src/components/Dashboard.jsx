import styled from "styled-components";
import PlayersList from "./PlayersList";
import CommandExecutor from "./CommandExecutor";
import LogsViewer from "./LogsViewer.jsx";
import AddToWhitelist from "./AddToWhitelist.jsx";
import ServerInfo from "./ServerInfo.jsx";

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
    flex-wrap: wrap; 
    justify-content: center; 
    align-items: flex-start;
    gap: 10px;
    padding: 20px;
    min-height: 100vh;
    background-color: #454545;
    color: #fff;
`;

const PlayersContainer = styled.div`
    grid-column: 2 / span 1;
    grid-row: 1 / span 5;
`;

const CommandContainer = styled.div`
    grid-column: 1 / span 1;
    grid-row: 3 / span 1; /
`

const AddToWhitelistContainer = styled.div`
    grid-column: 1 / span 1;
    grid-row: 2 / span 1; /
`

const LogsContainer = styled.div`
    grid-column: 1 / span 2;
    grid-row: 6 / span 3;
`;

const ServerInfoContainer = styled.div`
    grid-column: 1 / span 1;
    grid-row: 1 / span 1; /
`

const Dashboard = ({ token }) => {
    return (
        <Wrapper>
            <CommandContainer>
                <CommandExecutor token={token} />
            </CommandContainer>
            <AddToWhitelistContainer>
                <AddToWhitelist token={token} />
            </AddToWhitelistContainer>
            <ServerInfoContainer>
                <ServerInfo token={token} />
            </ServerInfoContainer>
            <PlayersContainer>
                <PlayersList token={token} />
            </PlayersContainer>
            <LogsContainer>
                <LogsViewer />
            </LogsContainer>

        </Wrapper>
    );
};

export default Dashboard;
