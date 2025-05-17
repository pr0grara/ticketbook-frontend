import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setShowSummary } from "../redux/slices/sessionSlice";
import { setViewedSummary } from "../redux/slices/dailySummarySlice";
import { Maximize2 } from "lucide-react";
import authAPI from "./api/authAPI";
import Modal from "./Modal/Modal";

export default function DailySummary() {
    const { today, viewedSummary } = useSelector(state => state.dailySummary);
    const { isMobile, showSummary } = useSelector(state => state.session);
    const { userId } = useSelector(state => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [scrollOffset, setScrollOffset] = useState({x: 0, y: 0})

    const toggleSummary = () => {
        dispatch(setShowSummary(!showSummary))
    }

    const keyConvert = key => {
        switch (key) {
            case "createdSummary":
                return "Tickets Created (yesterday)"
            case "completedSummary":
                return "Tickets Closed (yesterday)"
            case "todaySummary":
                return "Today"
            case "upcomingSummary":
                return "On Deck"
            default: 
                return key
        }
    }

    useEffect(() => {
        if (!viewedSummary) {
            setTimeout(() => {
            dispatch(setShowSummary(true))
            authAPI.post("/users/set-viewed-summary", {userId})
            dispatch(setViewedSummary(true))
            }, 3000)
        }
        console.log('Viewed Summary: ', viewedSummary)
    }, [viewedSummary])

    useEffect(() => {
        const handleScroll = () => {
            console.log(scrollOffset.y, window.scrollY)
            setScrollOffset({
                x: window.scrollX || document.documentElement.scrollLeft,
                y: window.scrollY || document.documentElement.scrollTop,
            });
        };
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <>
        <div className="toggle-show-summary" onClick={() => toggleSummary()}>{showSummary ? "Hide Summary" : `DAILY SUMMARY`}<Maximize2 /></div>
        <Modal children=
            {<ul className="daily-summary-ul">
                {Object.entries(today).map(([key, value]) => (
                    <div key={key} className="summary-item">
                        <strong>{keyConvert(key)}:</strong> {value}
                    </div>
                ))}
            </ul>}
            title="Daily Summary"
                subTitle={<><span>Hey 👋 &nbsp; great job yesterday!</span><span>Here is your recap and a brief look ahead...</span></>}
            isOpen={showSummary}
            position={{y: `${scrollOffset.y}px`}}
            onClose={() => dispatch(setShowSummary(false))}
            closeButton="Close"
            />
        </>
    );
};