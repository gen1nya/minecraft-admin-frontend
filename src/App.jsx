import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import { verifyToken } from "./api/api";

function App() {
    const [token, setToken] = useState(null);
    const [username, setUsername] = useState("Admin");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const savedToken = Cookies.get("token");
            if (savedToken) {
                try {
                    const isValid = await verifyToken(savedToken);
                    if (isValid) {
                        setToken(savedToken);
                        setUsername(Cookies.get("username") || "Admin");
                    } else {
                        Cookies.remove("token");
                        Cookies.remove("username");
                    }
                } catch (error) {
                    console.error("Token validation error:", error);
                    Cookies.remove("token");
                    Cookies.remove("username");
                }
            }
            setLoading(false);
        };

        checkToken();
    }, []);

    const handleLogin = (newToken, user) => {
        Cookies.set("token", newToken, { expires: 1 });
        Cookies.set("username", user, { expires: 1 });
        setToken(newToken);
        setUsername(user);
    };

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("username");
        setToken(null);
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    return (
        <>
            {token ? (
                <>
                    <Header username={username} onLogout={handleLogout} />
                    <Dashboard token={token} />
                </>
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </>
    );
}

export default App;
