import styled from "styled-components";
import { executeCommand } from "../api/api";

const Card = styled.div`
    background: #333;
    padding: 15px;
    margin: 10px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
    width: 450px;
    box-sizing: border-box; /* Учитывает padding и border в размерах */
`;

const InfoContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 10px;
    padding: 10px; /* Равномерный внутренний отступ */
    background: #444;
    border-radius: 10px;
    box-sizing: border-box;
`;

const Avatar = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 5px;
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-grow: 1;
  margin-left: 10px;
`;

const PlayerName = styled.h3`
    font-size: 18px;
    font-weight: bold;
    color: #f8f9fa;
    margin: 0;
`;

const PlayerText = styled.p`
    font-size: 14px;
    color: #bdbdbd;
    margin: 2px 0;
`;

const StatusContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  align-items: flex-end;
  flex-direction: row-reverse;
  width: 100%;
  margin-bottom: 0px;
`;

const Button = styled.button`
  background: ${(props) => (props.$danger ? "#dc3545" : props.$op ? "#ffc107" : "#28a745")};
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background: ${(props) => (props.$danger ? "#c82333" : props.$op ? "#e0a800" : "#218838")};
  }
`;

const shortenUUID = (uuid) => {
    return uuid ? `${uuid.slice(0, 4)}...${uuid.slice(-4)}` : "Unknown";
};

const PlayerCard = ({ player, token, onRemove, onToggleOp }) => {
    const avatarUrl = `https://crafatar.com/avatars/${player.uuid}`;

    const handleRemove = async () => {
        await executeCommand(`whitelist remove ${player.name}`, token);
        if (player.isOnline) {
            await executeCommand(`kick ${player.name}`, token);
        }
        onRemove(player.name);
    };

    const handleToggleOp = async () => {
        const command = player.isOp ? `deop ${player.name}` : `op ${player.name}`;
        await executeCommand(command, token);
        onToggleOp(player.name);
    };

    return (
        <Card>
            <InfoContainer>
                <Avatar src={avatarUrl} alt={player.name} />
                <PlayerInfo>
                    <PlayerName>{player.name}</PlayerName>
                    <PlayerText>ID: {shortenUUID(player.uuid)}</PlayerText>
                </PlayerInfo>
                <StatusContainer>
                    <PlayerText>Онлайн: {player.isOnline ? "✅" : "❌"}</PlayerText>
                    <PlayerText>OP: {player.isOp ? "✅" : "❌"}</PlayerText>
                </StatusContainer>
            </InfoContainer>
            <ButtonContainer>
                <Button $danger onClick={handleRemove}>Удалить</Button>
                <Button $op onClick={handleToggleOp}>{player.isOp ? "Deop" : "Op"}</Button>
            </ButtonContainer>
        </Card>
    );
};

export default PlayerCard;
