import styled from "styled-components";
import { playerPropType, handlerPropType } from "../propTypes";

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

const PlayerNameContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px; /* Отступ между точкой и ником */
`;

const OnlineIndicator = styled.span`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${(props) => (props.$isOnline ? "#2fd554" : "rgba(220,53,69,0)")};
    display: inline-block;
`;


const shortenUUID = (uuid) => {
    return uuid ? `${uuid.slice(0, 8)}...${uuid.slice(-8)}` : "Unknown";
};

const PlayerCard = ({ player, onClick }) => {
    const avatarUrl = `https://crafatar.com/avatars/${player.uuid}`;

    return (
        <InfoContainer onClick={() => onClick(player)}>
            <Avatar src={avatarUrl} alt={player.name} />
            <PlayerInfo>
                <PlayerNameContainer>
                    <PlayerName>{player.isOp ? "[OP]" : ""} {player.name}</PlayerName>
                    <OnlineIndicator $isOnline={player.isOnline} />
                </PlayerNameContainer>
                <PlayerText>ID: {shortenUUID(player.uuid)}</PlayerText>
            </PlayerInfo>
        </InfoContainer>
    );
};

PlayerCard.propTypes = {
    player: playerPropType,
    onClick: handlerPropType,
};

export default PlayerCard;