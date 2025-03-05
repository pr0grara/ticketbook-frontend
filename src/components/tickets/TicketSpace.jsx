import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
// import "../stylesheets/TicketSpace.scss"; // Import SCSS file
import Ticket from './Ticket.jsx';

const TicketSpace = () => {
    const { loggedIn } = useSelector(state => state.session);
    const { userActivatedTickets } = useSelector(state => state.tickets);

    useEffect(() => {
        console.log("🔄 TicketSpace Component Re-Rendered");
        console.log(userActivatedTickets)
    });

    return (
        <nav className="ticket-space-container">
            {userActivatedTickets.map(ticket => <Ticket ticket={ticket} key={ticket._id}/>)}
        </nav>
    );
};

export default TicketSpace;