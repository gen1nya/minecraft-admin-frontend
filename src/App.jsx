import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { verifyToken } from "./api/api"; // Функция для проверки токена

function App() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const savedToken = Cookies.get("token");
            if (savedToken) {
                try {
                    const isValid = await verifyToken(savedToken);
                    if (isValid) {
                        setToken(savedToken);
                    } else {
                        Cookies.remove("token");
                    }
                } catch (error) {
                    console.error("Ошибка проверки токена:", error);
                    Cookies.remove("token");
                }
            }
            setLoading(false);
        };

        checkToken();
    }, []);

    if (loading) {
        return <p>Загрузка...</p>;
    }

    return (
        <>
            {token ? <Dashboard token={token} /> : <Login setToken={setToken} />}
        </>
    );
}

export default App;
