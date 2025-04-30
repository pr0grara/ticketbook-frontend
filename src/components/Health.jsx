import { useSelector, useDispatch } from "react-redux";
import TicketListModular from "./tickets/TicketListModular"
import TicketSpace from "./tickets/TicketSpace";
import { useMemo, useEffect } from "react";
import { isToday } from "date-fns";
import { setSelectedTickets } from "../redux/slices/ticketsSlice";

export default function Health() {
    const dispatch = useDispatch();
    const { tickets } = useSelector((state) => state.tickets);
    const { isMobile } = useSelector((state) => state.session);

    const healthTypes = ["diet", "exercise", "habit"];

    const healthTickets = useMemo(() => {
        return tickets.filter((t) => t.healthType && healthTypes.includes(t.healthType));
    }, [tickets]);

    const todayTickets = useMemo(() => {
        return healthTickets.filter(
            (t) => t.doToday || (t.deadline && isToday(new Date(t.deadline)))
        );
    }, [healthTickets]);

    useEffect(() => {
        dispatch(setSelectedTickets({ goal: { title: 'Health' }, tickets: healthTickets }));
    }, [dispatch, healthTickets]);

    return (
        <div className="goals-container">
            <div className="ticket-list-container">
                <div className="ticket-list-title">Health</div>
                <div className="subtitle">All health tickets</div>
                <TicketListModular TICKETS={healthTickets} groupBy={"healthType"} />
            </div>
            <div className="goal-and-ticket-container">
                <div className="goal-info-container">
                    <h2 className="text-xl font-bold">Today's View</h2>
                    {todayTickets.length === 0 && <p>No health-related tasks scheduled for today.</p>}
                    {todayTickets.length > 0 && (
                        <ul className="list-disc list-inside">
                            {todayTickets.map((ticket) => (
                                <li key={ticket._id}>{ticket.title}</li>
                            ))}
                        </ul>
                    )}
                </div>
                {!isMobile && <TicketSpace />}
            </div>
        </div>
    );
}