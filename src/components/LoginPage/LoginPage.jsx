import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import authAPI from "../api/authAPI";
import { disableFastLogin, setLoggedIn, setWatchedTutorial } from "../../redux/slices/sessionSlice";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { fetchGoals } from "../../redux/slices/goalsSlice";
import { fetchTickets } from "../../redux/slices/ticketsSlice";
import { darkMode } from "../../util/theme_util";

const LoginPage = () => {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const formSubmittedRef = useRef(false);
    const isLoggingIn = useRef(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstname, setFirstname] = useState("");
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);

    const { theme, loggedIn, allowFastLogin } = useSelector(state => state.session)

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("🔄 Login Component Re-Rendered");
        console.log(formSubmittedRef)
    });

    useEffect(() => {
        if (loggedIn) navigate('/goals')
    }, loggedIn)

    useEffect(() => {
        let scanForIntervalCount = 0
        const interval = setInterval(() => {
            if (!allowFastLogin) return () => clearInterval(interval)
            if (formSubmittedRef.current || isLoggingIn.current) return () => clearInterval(interval);
            if (scanForIntervalCount >= 150) return () => clearInterval(interval);
            scanForIntervalCount++
            const emailVal = emailRef.current?.value;
            const passwordVal = passwordRef.current?.value;
            console.log(emailVal, passwordVal, !formSubmittedRef.current,
                (emailVal !== email || passwordVal !== password))
            
                // debugger

            if (
                emailVal &&
                passwordVal &&
                !formSubmittedRef.current
            ) {
                console.log("MADE IT THROUGH CONDITIONS")
                setEmail(emailVal);
                setPassword(passwordVal);
                handleLogin(emailVal, passwordVal);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [email, password]);

    const handleLogin = async (emailVal, passwordVal, fromHandleSubmit) => {
        if (!allowFastLogin && !fromHandleSubmit) return;
        if (isLoggingIn.current || formSubmittedRef.current) return;
        isLoggingIn.current = true;
        formSubmittedRef.current = true;
        setError(null);
        try {
            const response = await authAPI.post("/auth/login", { email: emailVal, password: passwordVal }, { withCredentials: true });
            const { success, userId, watchedTutorial, firstname } = response.data;
            if (!success) throw new Error("Login failed");
            dispatch(setUser({userId, firstname}));
            dispatch(setLoggedIn());
            dispatch(setWatchedTutorial(watchedTutorial))

            await Promise.all([
                dispatch(fetchGoals(userId)),
                dispatch(fetchTickets({ type: "BY USER", id: userId }))
            ]);

            console.log("✅ All Data Fetched, Now Navigating...");
            navigate("/goals");
        } catch (err) {
            setError("Invalid email or password");
        } finally {
            isLoggingIn.current = false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoggingIn.current || formSubmittedRef.current) return;
        setError(null);

        try {
            if (isSignUp) {
                await axios.post(`${API_BASE_URL}/users/new`, { firstname, email, password });
            }

            await handleLogin(email, password, true);
        } catch (err) {
            setError("Invalid email or password");
        } finally {
            isLoggingIn.current = false;
        }
    };


    // const handleSubmit = async (e) => {
    //     debugger
    //     if (isLoggingIn.current || formSubmittedRef.current) return;
    //     isLoggingIn.current = true;
    //     formSubmittedRef.current = true;
    //     e.preventDefault();
    //     setError(null);

    //     try {
    //         if (isSignUp) {
    //             // Sign Up Request
    //             await axios.post(`${API_BASE_URL}/users/new`, { firstname, email, password });
    //         };

    //         const response = await authAPI.post("/auth/login", { email, password }, { withCredentials: true });
    //         const { success, userId } = response.data;
    //         if (!success) throw new Error("Login failed");
            
    //         dispatch(setUser(userId))
    //         dispatch(setLoggedIn())
    //         await Promise.all([
    //             dispatch(fetchGoals(userId)),
    //             dispatch(fetchTickets({ type: "BY USER", id: userId }))
    //         ]);

    //         console.log("✅ All Data Fetched, Now Navigating...");
    //         navigate('/goals');
    //     } catch (err) {
    //         setError("Invalid email or password");
    //     }
    // };

    return (
        <div className={`login-container${darkMode(theme) ? " dark-mode" : ""}`}>
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
                        ref={emailRef}
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => {
                            const value = e.target.value;
                            setEmail(() => {
                                if ((!email.length && !!password.length) || (!!email.length && !password.length) ) {
                                    // debugger
                                    dispatch(disableFastLogin());
                                }
                                return value
                            })
                        }}
                        required
                        className="login-input"
                    />
                    <input
                        ref={passwordRef}
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
