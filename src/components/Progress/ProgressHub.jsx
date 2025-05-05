import { useSelector } from "react-redux";
import ProgressRing from "./ProgressRing";
import { useNavigate } from "react-router-dom";

export default function ProgressHub() {
    const { tickets } = useSelector(state => state.tickets);
    const navigate = useNavigate();

    const recurringTickets = tickets.filter(t => t.isRecurring); // any non-empty string
    const daily = recurringTickets.filter(t => t.isRecurring === "daily")
    const weekly = recurringTickets.filter(t => t.isRecurring === "weekly")
    const monthly = recurringTickets.filter(t => t.isRecurring === "monthly")

    return (
        <div className="progress-hub-container" >
            <div className="progress-hub-header" onClick={() => navigate('/routine')}>Recurring Progress</div>
            <div className="progress-hub-rings" onClick={() => navigate('/routine')}>
                {daily.length > 0 && <ProgressRing type="daily" tickets={daily} />}
                {weekly.length > 0 && <ProgressRing type="weekly" tickets={weekly} />}
                {monthly.length > 0 && <ProgressRing type="monthly" tickets={monthly} />}
            </div>
        </div>
    );
};