import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import "../stylesheets/Navbar.scss"; // Import SCSS file
import authAPI, { checkStatus } from "./api/authAPI";
import { setLoggedOut } from "../redux/slices/sessionSlice";

const Navbar = () => {
    const { loggedIn } = useSelector(state => state.session);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        authAPI.post('/auth/logout')
            .then(res => {
                dispatch(setLoggedOut()) //change redux state
                navigate("/login");
            })
    };

    return (
        <nav className="navbar">
            <div className="nav-left">
                <Link to="/goals" className="nav-logo">Goals</Link>
                <Link to="/plan" className="nav-link">Daily Plan</Link>
                <Link to="/calendar" className="nav-link">Calendar</Link>
            </div>
            <div className="nav-right">
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