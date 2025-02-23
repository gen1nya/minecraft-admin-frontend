import styled from "styled-components";
import {executeCommand} from "../api/api.js";
import {useState} from "react";
import {useLongPress} from "../hooks/useLongPress";
import {playerPropType, tokenPropType, handlerPropType} from "../propTypes";

const ErrorPopup = styled.div`
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #dc3545;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 1000;
    opacity: ${(props) => (props.visible ? 1 : 0)};
    transition: opacity 0.3s ease-in-out;
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const InfoContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
`;

const Avatar = styled.img`
    width: 80px;
    height: 80px;
    border-radius: 5px;
`;

const PlayerInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-grow: 1;
    margin-left: 10px;
`;

const PlayerNameContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px; /* Отступ между точкой и ником */
`;

const PlayerName = styled.h3`
    font-size: 18px;
    font-weight: bold;
    color: #f8f9fa;
    margin: 0;
`;

const OnlineIndicator = styled.span`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${(props) => (props.$isOnline ? "#2fd554" : "rgba(220,53,69,0)")};
    display: inline-block;
`;

const PlayerText = styled.p`
    font-size: 14px;
    color: #bdbdbd;
    margin: 2px 0;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 20px;
    align-items: flex-end;
    flex-direction: row;
    width: 100%;
    margin-bottom: 0;
`;

const Button = styled.button`
    background: ${(props) => (props.$danger ? "#dc3545" : props.$warn ? "#ffc107" : "#28a745")};
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 10px;
    cursor: pointer;

    &:hover {
        background: ${(props) => (props.$danger ? "#c82333" : props.$warn ? "#e0a800" : "#218838")};
    }
`;

const HSepavator = styled.div`
    width: 100%
`

const ModalContainer = styled.div`
    display: flex;
    justify-content: start;
    flex-direction: column;
    align-items: flex-start;
    background: #222;
    padding: 20px;
    border-radius: 10px;
    width: 400px;
    color: white;
    text-align: center;
    border: 1px solid ${(props) =>
            props.$isOp ? "#ffcc00" : props.$isCreative ? "#28a745" : "#666"};

    box-shadow: 0 0 15px ${(props) =>
            props.$isOp ? "rgba(255, 204, 0, 0.8)"
                    : props.$isCreative ? "rgba(40, 167, 69, 0.8)"
                            : "rgba(102, 102, 102, 0.5)"};
`;

const PlayerDetailsModal = ({player, onClose, onRemove, onToggleOp, onUpdatePlayer, token}) => {

    const handleRemove = async () => {
        await executeCommand(`whitelist remove ${player.name}`, token);
        if (player.isOnline) {
            await executeCommand(`kick ${player.name}`, token);
        }
        onRemove(player.name);
    };

    const longPressRemove = useLongPress(handleRemove);

    const [error, setError] = useState("");
    const [gameMode, setGameMode] = useState(player.gameMode || "UNKNOWN");

    if (!player) return null;

    const avatarUrl = `https://crafatar.com/avatars/${player.uuid}`;

    const handleToggleOp = async () => {
        const command = player.isOp ? `deop ${player.name}` : `op ${player.name}`;
        await executeCommand(command, token);
        player.isOp = !player.isOp;
        onToggleOp(player.name);
    };

    const handleChangeGameMode = async (mode) => {
        try {
            const response = await executeCommand(`gamemode ${mode} ${player.name}`, token);
            if (response.includes("No player was found")) {
                setError("Игрок не в сети!");
                return;
            }
            setGameMode(mode.toUpperCase());
            onUpdatePlayer(player.name, {gameMode: mode.toUpperCase()});
        } catch (error) {
            console.log(error);
            setError("Ошибка выполнения команды");
        }
        setTimeout(() => setError(""), 3000);
    };

    const getGameModeText = (mode) => {
        switch (mode) {
            case "SURVIVAL":
                return "🏹 Survival";
            case "CREATIVE":
                return "🎨 Creative";
            case "ADVENTURE":
                return "🗺️ Adventure";
            case "SPECTATOR":
                return "👁️ Spectator";
            default:
                return "❓ Unknown";
        }
    };

    return (
        <>
            <Overlay onClick={onClose}>
                <ModalContainer
                    onClick={(e) => e.stopPropagation()}
                    $isOp={player.isOp}
                    $isCreative={player.gameMode === "CREATIVE"}
                >
                    <InfoContainer>
                        <Avatar src={avatarUrl} alt={player.name}/>
                        <PlayerInfo>
                            <PlayerNameContainer>
                                <PlayerName>{player.isOp ? "[OP]" : ""} {player.name}</PlayerName>
                                <OnlineIndicator $isOnline={player.isOnline}/>
                            </PlayerNameContainer>
                            <PlayerText>ID: {player.uuid}</PlayerText>
                            <PlayerText>GM: {getGameModeText(gameMode)}</PlayerText>
                        </PlayerInfo>
                    </InfoContainer>
                    <ButtonContainer>
                        <Button onClick={() => handleChangeGameMode("survival")}>Survival</Button>
                        <Button $warn onClick={() => handleChangeGameMode("creative")}>Creative</Button>
                        <Button $warn onClick={handleToggleOp}>{player.isOp ? "Deop" : "Op"}</Button>
                        <HSepavator/>
                        <Button {...longPressRemove} $danger>Бан</Button>
                    </ButtonContainer>
                </ModalContainer>
            </Overlay>

            {error && <ErrorPopup visible>{error}</ErrorPopup>}
        </>
    );
};

PlayerDetailsModal.propTypes = {
    player: playerPropType,
    token: tokenPropType,
    onClose: handlerPropType,
    onRemove: handlerPropType,
    onToggleOp: handlerPropType,
    onUpdatePlayer: handlerPropType,
};

export default PlayerDetailsModal;