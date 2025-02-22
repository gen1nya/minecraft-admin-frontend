import { useState, useEffect } from "react";
import {WS_URL} from "../api/api";
import styled from "styled-components";

const LogContainer = styled.div`
    background: #222;
    color: #fff;
    padding: 10px;
    border-radius: 15px;
    width: 1010px;
    height: 500px;
    margin: 10px;
    overflow-y: auto;
    font-family: monospace;
`;

const LogsViewer = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log("WebSocket connection established");
        };

        ws.onmessage = (event) => {
            setLogs((prevLogs) => [...prevLogs.slice(-50), event.data]);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            // Если соединение ещё в процессе подключения, ждём его открытия и сразу закрываем
            if (ws.readyState === WebSocket.CONNECTING) {
                ws.onopen = () => {
                    ws.close();
                };
            } else if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    return (
        <LogContainer>
            {logs.map((log, index) => (
                <div key={index}>{log}</div>
            ))}
        </LogContainer>
    );
};

export default LogsViewer;
