import {useState} from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import {login} from "../api/api";
import {handlerPropType} from "../propTypes.js";

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    background-color: #454545;
    color: #fff;
`;

const LoginBox = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    width: 350px;
`;

const Title = styled.h2`
    font-size: 24px;
    padding: 0;
    margin-bottom: 20px;
    margin-top: 0;
    color: #000000;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
`;

const Button = styled.button`
    width: 100%;
    padding: 10px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background: #0056b3;
    }
`;

const ErrorMessage = styled.p`
    color: red;
    font-size: 0.9rem;
`;

const Login = ({onLogin}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const token = await login(username, password);
            Cookies.set("token", token, {expires: 1});
            onLogin(token, "Admin");
        } catch (err) {
            console.log(err)
            setError("Ошибка авторизации");
        }
    };

    return (
        <Container>
            <LoginBox>
                <Title>Вход</Title>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <form onSubmit={handleLogin}>
                    <Input
                        type="text"
                        placeholder="Логин"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit">Войти</Button>
                </form>
            </LoginBox>
        </Container>
    );
};


Login.propTypes = {
    onLogin: handlerPropType,
};

export default Login;