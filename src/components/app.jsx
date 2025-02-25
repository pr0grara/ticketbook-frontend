// import { useRoutes, A } from 'hookrouter';
// import React from 'react';
// // import { ProtectedRoute } from '../util/route_util';
// // import LandingContainer from './landing/landingContainer';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Landing from './landing/landing';
import Tickets from './tickets/ticket';
import Goals from './goals/Goals';
import DailyPlan from './ai/DailyPlan';
import LoginPopup from './login/login_popup';
import CalendarView from './Calendar';
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/userSlice.js";
import axios from "axios";
import { fetchTickets } from "../redux/slices/ticketsSlice";
import { fetchGoals } from "../redux/slices/goalsSlice.js";
import { API_BASE_URL } from "../config.js";

let userId = "6778de261a642d64cc04996a"; // Placeholder User ID

export default function App() {
    const dispatch = useDispatch();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user_id = useSelector(state => state.user_id); //pull user from redux state
    const { tickets } = useSelector(state => state.tickets); //pull user from redux state
    const { goals } = useSelector(state => state.goals); //pull user from redux state

    useEffect(() => {
        if (!user_id && userId) dispatch(setUser(user_id)); // Ensure user is set
        axios.get(API_BASE_URL)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!user_id && userId) {
            console.log("Setting user in Redux:", userId);
            dispatch(setUser(userId));
        }
    }, [user_id])

    useEffect(() => {
        console.log("🔍 userId:", user_id, "| Tickets:", tickets.length, "| Goals:", goals.length);

        if (!!user_id && tickets.length === 0) {
            console.log("📡 Fetching Tickets...");
            dispatch(fetchTickets({ type: "BY USER", id: user_id }));
        }

        if (!!user_id && goals.length === 0) {
            console.log("📡 Fetching Goals...");
            dispatch(fetchGoals(user_id));
        }
    }, [user_id, tickets.length, goals.length]); // ✅ Fix here

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {console.log(error)}</p>;

    return (
        <Router>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/goals">Goals</Link>
                <Link to="/calendar">Calendar</Link>
                <Link to="/plan">Plan</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<LoginPopup />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/plan" element={<DailyPlan />} />
                <Route path="/calendar" element={<CalendarView />} />
            </Routes>
        </Router>
       
        // <div className="app">
        //     {routeResult}
        // </div>
    );
}