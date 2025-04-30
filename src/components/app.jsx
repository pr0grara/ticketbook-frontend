import { useNavigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginPage from "./LoginPage/LoginPage.jsx";
import Navbar from "./Navbar.jsx";
import Tickets from "./tickets/Ticket.jsx";
import Goals from "./goals/Goals.jsx";
import Baseline from "./Baseline.jsx";
import Health from "./Health.jsx";
import DailyPlan from "./ai/DailyPlan";
import CalendarView from "./Calendar.jsx";
import { useState, useEffect, startTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/userSlice.js";
import axios from "axios";
import { API_BASE_URL } from "../config.js";
import authAPI, { checkStatus } from "./api/authAPI.js";
import { setLoggedIn, setLoggedOut, setWatchedTutorial } from "../redux/slices/sessionSlice.js";
import { ArcadeEmbed } from "./ArcadeEmbed.jsx";

export default function App({ page }) {
    const dispatch = useDispatch();
    const [, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Now it works since App is inside RouterProvider
    const { userId } = useSelector(state=> state)

    console.count("🔄 App Component Rendered");
    console.log(`⏳ Render Time: ${performance.now()}ms`);

    useEffect(() => {
        console.time("checkStatus Execution Time");
        checkStatus()
            .then(res => {
                const loggedIn = res.loggedIn;
                if (loggedIn) {
                    dispatch(setLoggedIn())
                    if (!userId) dispatch(setUser({userId: res.user.id, firstname: res.user.firstname}))
                    authAPI.get(`/users/watched-tutorial/status/${res.user.id}`)
                        .then(res => {
                            dispatch(setWatchedTutorial(res.data.watchedTutorial))
                        })
                    return
                } 
                dispatch(setLoggedOut())
            });
    }, []);

    useEffect(() => {
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {console.log(error)}</p>;

    return (
        <>
            <Navbar />
            {console.log("page =", page)} {/* 👈 RIGHT HERE */}

            {page === "" && <LoginPage />}
            {page === "login" && <LoginPage />}
            {page === "tutorial" && ArcadeEmbed()}

            {/* Protected Routes */}
            {page === "goals" && <ProtectedRoute component={<Goals />} />}
            {page === "calendar" && <ProtectedRoute component={<CalendarView />} />}
            {page === "health" && <ProtectedRoute component={<Health />} />}
            {/* {page === "baseline" && <ProtectedRoute component={<Baseline />} />} */}
        </>
    );
}
