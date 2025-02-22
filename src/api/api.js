import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://boris.local:8000";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://boris.local:8000/ws/logs";

export { API_URL, WS_URL };

export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/token`, new URLSearchParams({
        username,
        password
    }));
    return response.data.access_token;
};

export const executeCommand = async (command, token) => {
    const response = await axios.post(
        `${API_URL}/execute`,
        { command },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.response;
};

export const getPlayers = async (token) => {
    const response = await axios.get(`${API_URL}/players`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.players;
};

export const verifyToken = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/verify-token`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.status === 200;
    } catch (error) {
        console.log(error);
        return false;
    }
};
