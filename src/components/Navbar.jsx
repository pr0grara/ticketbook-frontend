import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import authAPI, { checkStatus } from "./api/authAPI";
import { setLoggedOut, setTheme } from "../redux/slices/sessionSlice";
import { clearUser } from "../redux/slices/userSlice";
import { darkMode } from "../util/theme_util";
import nightmode from '../icons/night-mode.png'
import daymode from '../icons/day-mode.png'

const Navbar = () => {
    const { loggedIn, theme } = useSelector(state => state.session);
    // const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        authAPI.post('/auth/logout?dev=true')
            .then(res => {
                // debugger
                dispatch(clearUser())
                dispatch(setLoggedOut()) //change redux state
                window.location.href = "/login"; // ✅ TEMP FIX: Avoid useNavigate
                // navigate("/login");
            })
    };
    
    // useEffect(() => {
    //     console.log("🔄 Navbar Component Re-Rendered");
    // });

    return (
        <nav className={`navbar${darkMode(theme) ? " dark-mode" : ""}`}>
            <div className="nav-left">
                <Link to="/goals" className="nav-link">Goals</Link>
                {/* <Link to="/plan" className="nav-link">Daily Plan</Link> */}
                <Link to="/calendar" className="nav-link">Calendar</Link>
            </div>
            <div className="nav-right">
                <img src={darkMode(theme) ? daymode : nightmode} className="theme-selector" onClick={() => dispatch(setTheme(theme === "light" ? "dark" : "light"))} title="toggle between day and night mode"/>
                {loggedIn ? (
                    <button onClick={handleLogout} className="nav-button logout-btn">
                        Logout
                    </button>
                ) : (
                    <Link to="/login" className="nav-button login-btn">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;