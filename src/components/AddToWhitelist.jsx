import { useState } from "react";
import styled from "styled-components";
import { executeCommand } from "../api/api";

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
    width: 100%;
    margin: 0;
    padding: 0;
`;

const Input = styled.input`
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #555;
    border-radius: 5px;
    background-color: #222;
    color: #fff;
`;

const Button = styled.button`
    width: auto;
    background: #28a745;
    padding: 8px 12px;
    color: white;
    margin-left: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background: #218838;
    }
`;

const InputButtonContainer = styled.div`
    width: 100%;
    margin-top: 10px;
    display: flex;
    flex-direction: row;
    justify-content: center;
`

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

const AddToWhitelist = ({ token }) => {
    const [playerName, setPlayerName] = useState("");
    const [popupMessage, setPopupMessage] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleAdd = async () => {
        if (!playerName.trim()) {
            showPopup("Введите ник игрока", true);
            return;
        }
        try {
            const result = await executeCommand(`whitelist add ${playerName}`, token);

            if (result.includes("Player is already whitelisted")) {
                showPopup(`Игрок ${playerName} уже в whitelist`, true);
            } else if (result.includes("That player does not exist")) {
                showPopup("Такого игрока не существует", true);
            } else {
                showPopup(`Игрок ${playerName} добавлен в whitelist`, false);
                setPlayerName("");
            }
        } catch (err) {
            showPopup("Ошибка при добавлении в whitelist", true);
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

    return (
        <>
            {popupMessage && <Popup visible={isPopupVisible} error={isError}>{popupMessage}</Popup>}
            <Container>
                <Title>Добавить игрока в Whitelist</Title>
                <InputButtonContainer>
                    <Input
                        type="text"
                        placeholder="Введите ник..."
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <Button onClick={handleAdd}>Добавить</Button>
                </InputButtonContainer>

            </Container>
        </>
    );
};

export default AddToWhitelist;
