import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import authAPI, { checkStatus } from "./api/authAPI";
import { setLoggedOut, setTheme, setWatchedTutorial } from "../redux/slices/sessionSlice";
import { clearUser } from "../redux/slices/userSlice";
import { darkMode } from "../util/theme_util";
import nightmode from '../icons/night-mode.png'
import daymode from '../icons/day-mode.png'
import { CircleHelp } from 'lucide-react';

const Navbar = () => {
    const { loggedIn, theme, isMobile, watchedTutorial } = useSelector(state => state.session);
    const { userId, firstname } = useSelector(state => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        authAPI.post('/auth/logout?dev=true')
            .then(res => {
                // debugger
                authAPI.post('/auth/logout');
                dispatch(clearUser())
                dispatch(setLoggedOut()) //change redux state
                localStorage.clear();
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
                {/* <Link to="/baseline" className="nav-link">{`Baseline ${firstname}`}</Link> */}
            </div>
            <div className="nav-right">
                {/* {(!isMobile && watchedTutorial) && 
                    <span title='Watch tutorial' className='activate-tutorial'>
                    <CircleHelp 
                        size={35} 
                        onClick={() => {
                            dispatch(setWatchedTutorial(false))
                            authAPI.post('/users/mark-tutorial-watched', {userId, watchedTutorial: false})
                            navigate('/goals')
                        }}
                    />
                </span>
                } */}
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