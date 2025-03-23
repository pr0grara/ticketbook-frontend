import { useNavigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginPage from "./LoginPage/LoginPage.jsx";
import Navbar from "./Navbar.jsx";
import Tickets from "./tickets/Ticket.jsx";
import Goals from "./goals/Goals";
import DailyPlan from "./ai/DailyPlan";
import CalendarView from "./Calendar";
import { useState, useEffect, startTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/userSlice.js";
import axios from "axios";
import { API_BASE_URL } from "../config.js";
import { checkStatus } from "./api/authAPI.js";
import { setLoggedIn, setLoggedOut } from "../redux/slices/sessionSlice.js";

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
                    if (!userId) dispatch(setUser(res.user.id))
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
            {/* Protected Routes */}
            {page === "goals" && <ProtectedRoute component={<Goals />} />}
            {page === "calendar" && <ProtectedRoute component={<CalendarView />} />}
        </>
    );
}
