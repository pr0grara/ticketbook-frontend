import { useSelector } from "react-redux";

export default function TicketsRemaining({tickets, label, onClick}) {
    const openTickets = tickets.filter(t => t.status !== "done");

    return (
        <div className="tickets-remaining-container" onClick={onClick || null}>
            <div className="tickets-remaining-count">{openTickets.length}</div>
            <div className="tickets-remaining-label">{label}</div>
        </div>
    );
}