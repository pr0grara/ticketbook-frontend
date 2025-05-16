import { useSelector, useDispatch } from "react-redux"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setShowSummary } from "../redux/slices/sessionSlice";

export default function DailySummary() {
    const { today } = useSelector(state => state.dailySummary);
    const { isMobile, showSummary } = useSelector(state => state.session);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const toggleSummary = () => {
        dispatch(setShowSummary(!showSummary))
    }

    const keyConvert = key => {
        switch (key) {
            case "createdSummary":
                return "Tickets Created"
            case "completedSummary":
                return "Tickets Closed"
            case "todaySummary":
                return "Today"
            case "upcomingSummary":
                return "On Deck"
            default: 
                return key
        }
    }

    useEffect(() => {
    }, [today])
    return (
        <>
        <div className="toggle-show-summary" onClick={() => toggleSummary()}>{showSummary ? "Hide Summary" : `Show Daily Summary!`}</div>
        {showSummary && <ul>
                {Object.entries(today).map(([key, value]) => (
                    <div key={key} className="summary-item">
                        <strong>{keyConvert(key)}:</strong> {value}
                    </div>
                ))}
            </ul>}
        </>
    );
};