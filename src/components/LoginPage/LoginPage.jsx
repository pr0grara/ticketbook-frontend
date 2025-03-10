import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import authAPI from "../api/authAPI";
import { setLoggedIn } from "../../redux/slices/sessionSlice";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { fetchGoals } from "../../redux/slices/goalsSlice";
import { fetchTickets } from "../../redux/slices/ticketsSlice";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstname, setFirstname] = useState("");
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("🔄 Login Component Re-Rendered");
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            if (isSignUp) {
                // Sign Up Request
                await axios.post(`${API_BASE_URL}/users/new`, { firstname, email, password });
            };

            const response = await authAPI.post("/auth/login", { email, password }, { withCredentials: true });
            const { success, userId } = response.data;
            if (!success) throw new Error("Login failed");
            debugger
            
            dispatch(setUser(userId))
            dispatch(setLoggedIn())
            await Promise.all([
                dispatch(fetchGoals(userId)),
                dispatch(fetchTickets({ type: "BY USER", id: userId }))
            ]);

            console.log("✅ All Data Fetched, Now Navigating...");
            navigate('/goals');
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>{isSignUp ? "Create Account" : "Login"}</h2>
                <form onSubmit={handleSubmit}>
                    {isSignUp && (
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            required
                            className="login-input"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="login-input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="login-input"
                    />
                    {error && <p className="login-error">{error}</p>}
                    <button type="submit" className="login-button">
                        {isSignUp ? "Sign Up" : "Login"}
                    </button>
                </form>

                {/* Toggle Sign Up / Login Mode */}
                <p className="toggle-link" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? "Already have an account? Login" : "Create a new account"}
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
