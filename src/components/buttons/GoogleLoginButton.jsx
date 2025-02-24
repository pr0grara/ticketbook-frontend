import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";

const LoginButton = () => {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            axios.get(`${API_BASE_URL}/auth/status`, { withCredentials: true })
                .then(res => {
                    console.log("🔑 Auth Check Response:", res.data);
                    setLoggedIn(res.data.loggedIn);
                })
                .catch(err => console.error("❌ Auth check failed:", err));
        };

        checkAuth(); // Initial check
        const interval = setInterval(checkAuth, 60000); // 🔥 Auto-refresh login state

        return () => clearInterval(interval); // Cleanup
    }, []);

    const handleLogin = () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    return loggedIn ? (
        <button disabled>✅ Logged in</button>
    ) : (
        <button onClick={handleLogin}>Sign in with Google</button>
    );
};

export default LoginButton;
