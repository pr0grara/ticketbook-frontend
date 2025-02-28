// import { useRoutes, A } from 'hookrouter';
// import React from 'react';
// // import { ProtectedRoute } from '../util/route_util';
// // import LandingContainer from './landing/landingContainer';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginPage from './LoginPage/LoginPage.jsx';
import Navbar from "./Navbar.jsx";
import Tickets from './tickets/ticket';
// import TestComponent from './goals/TestComponent.jsx';
import Goals from './goals/Goals';
import DailyPlan from './ai/DailyPlan';
import CalendarView from './Calendar';
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/userSlice.js";
import axios from "axios";
import { fetchTickets } from "../redux/slices/ticketsSlice";
import { fetchGoals } from "../redux/slices/goalsSlice.js";
import { API_BASE_URL } from "../config.js";
import { checkStatus } from "./api/authAPI.js";
import { setLoggedIn, setLoggedOut } from "../redux/slices/sessionSlice.js";

// let userId = "6778de261a642d64cc04996a"; // Placeholder User ID

export default function App() {
    const dispatch = useDispatch();
    // const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user_id = useSelector(state => state.user_id); //pull user from redux state
    const { tickets } = useSelector(state => state.tickets); //pull user from redux state
    const { goals } = useSelector(state => state.goals); //pull user from redux state
    const { loggedIn } = useSelector(state => state.session);

    useEffect(() => {
        console.log("🔄 APP Component Re-Rendered");
    });

    useEffect(() => {
        checkStatus()
            .then(res => {
                const status = res.loggedIn;
                const userId = res.user?.id;
                if (status) {
                    dispatch(setLoggedIn())
                    dispatch(setUser(userId));
                }
                if (!status) dispatch(setLoggedOut())
            })
    }, [dispatch]);

    useEffect(() => {
        // if (!user_id && userId) dispatch(setUser(user_id)); // Ensure user is set
        axios.get(API_BASE_URL)
            .then(response => {
                // setData(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!!user_id && goals.length === 0) {
            dispatch(fetchGoals(user_id));
        }
    }, [user_id, goals.length, dispatch]); // Only runs when user_id or goals change

    useEffect(() => {
        if (!!user_id && tickets.length === 0) {
            dispatch(fetchTickets({ type: "BY USER", id: user_id }));
        }
    }, [user_id, tickets.length, dispatch]); // Only runs when user_id or tickets change

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {console.log(error)}</p>;

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={ loggedIn ? <Navigate to="/goals" replace/> : <LoginPage /> } />
                <Route path="/login" element={loggedIn ? <Navigate to="/goals" replace /> : <LoginPage />} />
                <Route path="/tickets" element={<ProtectedRoute element={<Tickets />}/>} />
                <Route path="/goals" element={<ProtectedRoute element={<Goals/>}/>} />
                <Route path="/plan" element={<ProtectedRoute element={<DailyPlan />}/>} />
                <Route path="/calendar" element={<ProtectedRoute element={<CalendarView />}/>} />
            </Routes>
        </Router>
    );
}