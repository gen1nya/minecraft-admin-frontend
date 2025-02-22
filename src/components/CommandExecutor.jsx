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
  margin: 10px;
  width: 470px;
`;

const Title = styled.h2`
    margin: 0;
    padding-left: 20px;
    width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid #444;
  border-radius: 5px;
  background-color: #222;
  color: #fff;
`;

const Button = styled.button`
  background: #28a745;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
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
            <Input
                type="text"
                placeholder="Введите команду..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
            />
            <Button onClick={handleExecute}>Выполнить</Button>
            {response && <ResponseBox>Ответ: {response}</ResponseBox>}
        </Container>
    );
};

export default CommandExecutor;
