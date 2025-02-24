import {useState, useEffect, useRef} from "react";
import styled from "styled-components";
import {executeCommand} from "../api/api";
import {tokenPropType} from "../propTypes.js";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    background-color: #222;
    border-radius: 15px;
    width: 470px;
`;

const Title = styled.h2`
    padding: 0;
    width: 100%;
    margin: 0 0 10px;
    color: #fff;
`;

const InfoBlock = styled.div`
    background: #333;
    padding: 10px;
    border-radius: 8px;
    margin: 0 20px 10px;
    width: 100%;
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
            props.value >= 90 ? "#dc3545" :
                    props.value >= 75 ? "#ffc107" :
                            "#28a745"};
    transition: width 0.5s ease-in-out;
`;

const ButtonContainer = styled.div`
    display: flex;
    align-items: flex-end;
    flex-direction: row-reverse;
    gap: 10px;
`;

const Button = styled.button`
    padding: 8px 12px;
    background: ${(props) => (props.$danger ? "#dc3545" : "#ffc107")};
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background: ${(props) => (props.$danger ? "#c82333" : "#e0a800")};
    }
`;

const ButtonsParentContainer = styled.div`
    display: flex;
    width: 100%;
    align-items: flex-end;
    flex-direction: row-reverse;
`

const ButtonsWrapper = styled.div`
    position: relative;
    display: inline-block;
    padding: 5px;
`;

const Slider = styled.div`
    position: absolute;
    top: 0;
    left: ${(props) => props.offset}px;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    border-radius: 5px;
    cursor: grab;
    transition: ${(props) => (props.isDragging ? "none" : "left 0.3s ease")};
    z-index: 2;

    &::after {
        content: "";
        position: absolute;
        top: 50%;
        right: -5px;
        transform: translateY(-50%);
        width: 10px;
        height: 20px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
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

const ServerInfo = ({token}) => {
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

    const [sliderOffset, setSliderOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragStartOffset, setDragStartOffset] = useState(0);
    const [maxDrag, setMaxDrag] = useState(0);

    const buttonsWrapperRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        fetchServerInfo();
        const interval = setInterval(fetchServerInfo, 10000);
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        if (buttonsWrapperRef.current) {
            setMaxDrag(buttonsWrapperRef.current.clientWidth);
        }
    }, [buttonsWrapperRef.current]);

    useEffect(() => {
        const handleDocumentClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                if (sliderOffset !== 0) {
                    setSliderOffset(0);
                }
            }
        };

        document.addEventListener("click", handleDocumentClick);
        return () => {
            document.removeEventListener("click", handleDocumentClick);
        };
    }, [sliderOffset]);

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
            console.error(err);
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

    const handleSliderMouseDown = (e) => {
        setIsDragging(true);
        setDragStartX(e.clientX);
        setDragStartOffset(sliderOffset);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const delta = e.clientX - dragStartX;
            let newOffset = dragStartOffset + delta;
            if (newOffset > 0) newOffset = 0; // не двигаем вправо
            if (newOffset < -maxDrag) newOffset = -maxDrag;
            setSliderOffset(newOffset);
        };

        const handleMouseUp = () => {
            if (isDragging) {
                if (sliderOffset > -maxDrag + 10) {
                    setSliderOffset(0);
                }
                setIsDragging(false);
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, dragStartX, dragStartOffset, sliderOffset, maxDrag]);

    const handleRestartWrapper = () => {
        if (sliderOffset === -maxDrag) {
            setSliderOffset(0);
        }
        handleRestart();
    };

    const handleStopWrapper = () => {
        if (sliderOffset === -maxDrag) {
            setSliderOffset(0);
        }
        handleStop();
    };

    return (
        <>
            {popupMessage && <Popup visible={isPopupVisible} error={isError}>{popupMessage}</Popup>}
            <Container ref={containerRef}>
                <Title>Статус сервера</Title>
                <InfoBlock>Версия: {serverData.version}</InfoBlock>

                <InfoBlock>
                    TPS: {serverData.tps !== null ? `${serverData.tps} TPS` : "Загрузка..."}
                    <ProgressBarContainer>
                        <ProgressBar width={(serverData.tps / 20) * 100} value={serverData.tps}/>
                    </ProgressBarContainer>
                </InfoBlock>

                <InfoBlock>Игроков онлайн: {serverData.onlinePlayers}</InfoBlock>

                <InfoBlock>
                    Использование памяти: {serverData.memoryUsedMB} MB / {serverData.memoryAllocatedMB} MB
                    <ProgressBarContainer>
                        <ProgressBar width={memoryUsagePercent} value={memoryUsagePercent}/>
                    </ProgressBarContainer>
                </InfoBlock>
                <ButtonsParentContainer>
                    <ButtonsWrapper ref={buttonsWrapperRef}>
                        <ButtonContainer>
                            <Button onClick={handleRestartWrapper}>Restart</Button>
                            <Button $danger onClick={handleStopWrapper}>STOP</Button>
                        </ButtonContainer>
                        <Slider
                            offset={sliderOffset}
                            maxDrag={maxDrag}
                            isDragging={isDragging}
                            onMouseDown={handleSliderMouseDown}
                        />
                    </ButtonsWrapper>
                </ButtonsParentContainer>
            </Container>
        </>
    );
};


ServerInfo.propTypes = {
    token: tokenPropType,
};


export default ServerInfo;
