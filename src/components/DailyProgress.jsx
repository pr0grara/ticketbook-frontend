import { useSelector } from "react-redux"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DailyProgress() {
    const { tickets } = useSelector(state => state.tickets);
    const recurringTickets = tickets.filter(t => t.isRecurring)
    const recurringCount = recurringTickets.length;
    const completedCount = recurringTickets.filter(t => t.status === "done").length;

    const navigate = useNavigate();

    useEffect(() => {
        const width = ((completedCount / recurringCount) * 100).toString() + "%";
        console.log(width)
        document.querySelector('.daily-progress-amount').style.width = width;
    }, [tickets])
    return (
        <div className="daily-progress-container" onClick={() => navigate('/routine')}>
            <div className="daily-progress-header">Daily Progress</div>
            {/* <div className="daily-progress-subheader">{completedCount}/{recurringCount} Tickets Complete</div> */}
            <div className="daily-progress-bar">
                <div className="daily-progress-amount"></div>
            </div>
        </div>
    )
};