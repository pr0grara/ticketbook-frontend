import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
// import "../stylesheets/TicketSpace.scss"; // Import SCSS file
import Ticket from './Ticket.jsx';
// import Ticket from './TicketTest.jsx';

const TicketSpace = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const { loggedIn } = useSelector(state => state.session);
    const { userActivatedTickets } = useSelector(state => state.tickets);
    const [height, setHeight] = useState(400)


    useEffect(() => {
        // console.log("🔄 TicketSpace Component Re-Rendered");
        // console.log(userActivatedTickets)
    });

    const tickets = userActivatedTickets.map(ticket => ({
        ...ticket,
        checklist: [...(ticket.checklist || [])],
        notes: [...(ticket.notes || [])]
    })); 


    // useEffect(() => {
    //     console.log("🔄 TicketSpace Rerendered. Tickets:", userActivatedTickets);
    //     // setTickets(userActivatedTickets.map(ticket => ({ ...ticket })))
    // }, [userActivatedTickets]);

    return (
        <nav className="ticket-space-container">
            {tickets.map(ticket => <Ticket ticket={ticket} key={ticket._id} isMobile={isMobile}/>)}
            {!isMobile && 
                <div 
                    className="ticket-list-spaceholder"
                    style={{
                        height: `${height}px`
                    }}
                ></div>}
        </nav>
    );
};

export default TicketSpace;