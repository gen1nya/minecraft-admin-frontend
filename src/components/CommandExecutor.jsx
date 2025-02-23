import { useState } from "react";
import styled from "styled-components";
import { executeCommand } from "../api/api";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  padding: 15px;
  background-color: #222;
  border-radius: 15px;
  width: 470px;
`;

const Title = styled.h2`
    margin: 0;
    width: 100%;
`;

const InputContainer = styled.div`
    width: 100%;
    margin-top: 10px;
    display: flex;
`

const Input = styled.input`
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #444;
    border-radius: 5px;
    background-color: #222;
    color: #fff;
`;

const Button = styled.button`
  background: #28a745;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: auto;
  box-sizing: border-box;
  display: block;

  &:hover {
    background: #218838;
  }
`;

const ResponseBox = styled.p`
  margin-top: 10px;
  background: #222;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  color: #fff;
  width: 100%;
`;

const CommandExecutor = ({ token }) => {
    const [command, setCommand] = useState("");
    const [response, setResponse] = useState("");

    const handleExecute = async () => {
        if (!command.trim()) return;
        const result = await executeCommand(command, token);
        setResponse(result);
    };

    return (
        <Container>
            <Title>Отправить команду RCON</Title>
            <InputContainer>
                <Input
                    type="text"
                    placeholder="Введите команду..."
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                />
            </InputContainer>
            <Button onClick={handleExecute}>Выполнить</Button>
            {response && <ResponseBox>Ответ: {response}</ResponseBox>}
        </Container>
    );
};

export default CommandExecutor;
