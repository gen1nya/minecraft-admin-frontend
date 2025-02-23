import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://boris.local:8000";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://boris.local:8000/ws/logs";

export { API_URL, WS_URL };

const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    const response = await api.post("/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    return response.data.access_token;
};

export const executeCommand = async (command, token) => {
    const response = await api.post(
        `${API_URL}/execute`,
        { command },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.response;
};

export const getPlayers = async (token) => {
    const response = await api.get(`${API_URL}/players`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.players;
};

export const verifyToken = async (token) => {
    try {
        const response = await api.get(`${API_URL}/verify-token`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.status === 200;
    } catch (error) {
        console.log(error);
        return false;
    }
};
