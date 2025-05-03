import { useNavigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginPage from "./LoginPage/LoginPage.jsx";
import Navbar from "./Navbar.jsx";
import Tickets from "./tickets/Ticket.jsx";
import Goals from "./goals/Goals.jsx";
import Routine from "./Routine.jsx";
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
import { fetchTickets } from "../redux/slices/ticketsSlice.js";
import { fetchGoals } from "../redux/slices/goalsSlice.js";

export default function App({ page }) {
    const dispatch = useDispatch();
    const [, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Now it works since App is inside RouterProvider
    const { userId } = useSelector(state => state)
    const { tickets } = useSelector(state => state.tickets)
    const { goals } = useSelector(state => state.goals)
 
    console.count("🔄 App Component Rendered");
    console.log(`⏳ Render Time: ${performance.now()}ms`);

    // useEffect(() => {
    //     console.time("checkStatus Execution Time");
    //     checkStatus()
    //         .then(res => {
    //             const loggedIn = res.loggedIn;
    //             if (loggedIn) {
    //                 dispatch(setLoggedIn())
    //                 if (!userId) dispatch(setUser({userId: res.user.id, firstname: res.user.firstname}))
    //                 authAPI.get(`/users/watched-tutorial/status/${res.user.id}`)
    //                     .then(res => {
    //                         dispatch(setWatchedTutorial(res.data.watchedTutorial))
    //                     })
    //                 return
    //             } 
    //             dispatch(setLoggedOut())
    //         });
    // }, []);

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

    useEffect(() => {
        const init = async () => {
            console.time("checkStatus Execution Time");
            const res = await checkStatus();

            if (!res.loggedIn) {
                dispatch(setLoggedOut());
                return;
            }

            const { id, firstname } = res.user;

            dispatch(setUser({ userId: id, firstname }));
            dispatch(setLoggedIn());

            const tutorialRes = await authAPI.get(`/users/watched-tutorial/status/${id}`);
            dispatch(setWatchedTutorial(tutorialRes.data.watchedTutorial));

            // ✅ Now that we have userId, fetch goals and tickets
            dispatch(fetchGoals(id));
            dispatch(fetchTickets({ type: "BY USER", id }));
        };

        init();
    }, [dispatch]);


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
            {/* {page === "health" && <ProtectedRoute component={<Health />} />} */}
            {page === "routine" && <ProtectedRoute component={<Routine />} />}
        </>
    );
}
