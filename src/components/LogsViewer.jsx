import { useState, useEffect, useRef } from "react";
import { WS_URL } from "../api/api";
import styled from "styled-components";
import {tokenPropType} from "../propTypes.js";

const LogContainer = styled.div`
    background: #222;
    color: #fff;
    padding: 10px;
    border-radius: 15px;
    width: 990px;
    height: 500px;
    overflow-y: auto;
    font-family: monospace;
`;

const LogsViewer = ({ token }) => {
    const [logs, setLogs] = useState([]);
    const ws = useRef(null);
    const reconnectTimeout = useRef(null);

    useEffect(() => {
        if (!token) return;

        const connectWebSocket = () => {
            console.log("🔌 WebSocket connecting...");
            ws.current = new WebSocket(`${WS_URL}?token=${token}`);

            ws.current.onopen = () => {
                console.log("✅ WebSocket connected!");
            };

            ws.current.onmessage = (event) => {
                setLogs((prevLogs) => [...prevLogs.slice(-99), event.data]);
            };

            ws.current.onerror = (error) => {
                console.error("❌ WebSocket error:", error);
                ws.current.close();
            };

            ws.current.onclose = (event) => {
                console.warn("⚠️ WebSocket closed, code:", event.code);
                if (event.code !== 1000) {
                    reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
                }
            };
        };

        connectWebSocket();

        return () => {
            console.log("⏏️ WebSocket closing...");
            if (ws.current) ws.current.close();
            clearTimeout(reconnectTimeout.current);
        };
    }, [token]);

    return (
        <LogContainer>
            {logs.map((log, index) => (
                <div key={index}>{log}</div>
            ))}
        </LogContainer>
    );
};

LogsViewer.propTypes = {
    token: tokenPropType,
};

export default LogsViewer;
