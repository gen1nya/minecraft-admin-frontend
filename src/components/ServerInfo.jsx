import { useState, useEffect } from "react";
import styled from "styled-components";
import { executeCommand } from "../api/api";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 25px;
    background-color: #222;
    border-radius: 15px;
    margin: 10px;
    width: 450px;
`;

const Title = styled.h2`
    padding-left: 20px;
    margin: 2px 0 10px;
    width: 100%;
    color: #fff;
`;

const InfoBlock = styled.div`
    background: #333;
    padding: 10px;
    border-radius: 8px;
    margin-left: 20px;
    margin-right: 20px;
    width: 100%;
    margin-bottom: 10px;
    color: #fff;
    text-align: start;
    box-sizing: border-box;
`;

const ProgressBarContainer = styled.div`
    width: 100%;
    background: #444;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 5px;
`;

const ProgressBar = styled.div`
    height: 10px;
    width: ${(props) => props.width}%;
    background-color: ${(props) =>
            props.value >= 75 ? "#dc3545" :
                    props.value >= 50 ? "#ffc107" :
                            "#28a745"};
    transition: width 0.5s ease-in-out;
`;

const ButtonContainer = styled.div`
    display: flex;
    align-items: flex-end;
    flex-direction: row-reverse;
    gap: 10px;
    width: 100%;
`;

const Button = styled.button`
    padding: 8px 12px;
    background: ${(props) => (props.danger ? "#dc3545" : "#ffc107")};
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    margin-top: 5px;
    margin-bottom: 5px;

    &:hover {
        background: ${(props) => (props.danger ? "#c82333" : "#e0a800")};
    }
`;

const Popup = styled.div`
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${(props) => (props.error ? "#dc3545" : "#28a745")};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    font-size: 16px;
    opacity: ${(props) => (props.visible ? "1" : "0")};
    transition: opacity 0.5s ease-in-out;
`;

const ServerInfo = ({ token }) => {
    const [serverData, setServerData] = useState({
        version: "Загрузка...",
        tps: null,
        onlinePlayers: "Загрузка...",
        memoryUsedMB: null,
        memoryAllocatedMB: null,
    });
    const [popupMessage, setPopupMessage] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        fetchServerInfo();
        const interval = setInterval(fetchServerInfo, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchServerInfo = async () => {
        try {
            const statsResponse = await executeCommand("serverstat", token);
            const tpsResponse = await executeCommand("tps", token);

            const data = JSON.parse(statsResponse);
            const tpsValue = extractTPS(tpsResponse);

            setServerData({
                version: data.version || "Неизвестно",
                tps: tpsValue,
                onlinePlayers: `${data.onlinePlayers} игроков`,
                memoryUsedMB: data.memoryUsedMB,
                memoryAllocatedMB: data.memoryAllocatedMB,
            });
        } catch (err) {
            showPopup("Ошибка загрузки данных сервера", true);
        }
    };

    const extractTPS = (response) => {
        const match = response.match(/TPS from last 5s, 1m, 5m, 15m: .*?([\d.]+)[§r,]/);
        return match ? parseFloat(match[1]) : null;
    };

    const handleRestart = async () => {
        try {
            await executeCommand("restart", token);
            showPopup("Сервер перезапускается...", false);
        } catch {
            showPopup("Ошибка при перезапуске сервера", true);
        }
    };

    const handleStop = async () => {
        try {
            await executeCommand("stop", token);
            showPopup("Сервер останавливается...", false);
        } catch {
            showPopup("Ошибка при остановке сервера", true);
        }
    };

    const showPopup = (message, error) => {
        setPopupMessage(message);
        setIsError(error);
        setIsPopupVisible(true);
        setTimeout(() => {
            setIsPopupVisible(false);
        }, 5000);
    };

    const memoryUsagePercent = serverData.memoryUsedMB && serverData.memoryAllocatedMB
        ? (serverData.memoryUsedMB / serverData.memoryAllocatedMB) * 100
        : 0;

    return (
        <>
            {popupMessage && <Popup visible={isPopupVisible} error={isError}>{popupMessage}</Popup>}
            <Container>
                <Title>Статус сервера</Title>
                <InfoBlock>Версия: {serverData.version}</InfoBlock>

                <InfoBlock>
                    TPS: {serverData.tps !== null ? `${serverData.tps} TPS` : "Загрузка..."}
                    <ProgressBarContainer>
                        <ProgressBar width={(serverData.tps / 20) * 100} value={serverData.tps} />
                    </ProgressBarContainer>
                </InfoBlock>

                <InfoBlock>Игроков онлайн: {serverData.onlinePlayers}</InfoBlock>

                <InfoBlock>
                    Использование памяти: {serverData.memoryUsedMB} MB / {serverData.memoryAllocatedMB} MB
                    <ProgressBarContainer>
                        <ProgressBar width={memoryUsagePercent} value={memoryUsagePercent} />
                    </ProgressBarContainer>
                </InfoBlock>

                <ButtonContainer>
                    <Button onClick={handleRestart}>Перезапуск</Button>
                    <Button danger onClick={handleStop}>Остановить</Button>
                </ButtonContainer>
            </Container>
        </>
    );
};

export default ServerInfo;
