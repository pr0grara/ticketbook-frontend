import { useDispatch, useSelector } from "react-redux";
import ProgressRing from "./ProgressRing";
import { useNavigate } from "react-router-dom";
import TicketsRemaining from "./TicketsRemaining";
import { setTicketFilters } from "../../redux/slices/sessionSlice";
import DailySummary from "../DailySummary";

export default function ProgressHub({TICKETS, forPage}) {
    const { tickets, selectedTickets } = useSelector(state => state.tickets);
    const { selectedGoal } = useSelector(state => state.goals)
    const { ticketFilters, isMobile } = useSelector(state => state.session)
    // console.log(TICKETS, tickets)
    const navigate = useNavigate();
    const dispatch = useDispatch();

    let ticketList = [];
    // if (!!TICKETS) ticketList = TICKETS;

    if (selectedGoal) {
        ticketList = selectedTickets;
    } else {
        ticketList = tickets;
    };

    const openTickets = tickets.filter(t => t.status !== "done");
    const closedTickets = tickets.filter(t => t.status === "done");
    const recurringTickets = tickets.filter(t => t.isRecurring); // any non-empty string
    const daily = recurringTickets.filter(t => t.isRecurring === "daily")
    const weekly = recurringTickets.filter(t => t.isRecurring === "weekly")
    const monthly = recurringTickets.filter(t => t.isRecurring === "monthly")

    const handleFilter = (filter) => {
        const bool = !ticketFilters[filter];
        dispatch(setTicketFilters({...ticketFilters, [filter]: bool }));
        setTimeout(() => {
            if (isMobile && bool) document.querySelector('.focus-selector').scrollIntoView({behavior: 'smooth', block: 'start'})
        }, 50)
    }

    return (
        <div className="progress-hub-container" >
            <div className="progress-hub-header" onClick={() => navigate('/routine')}>Progress Tracker</div>
            {<DailySummary/>}
            <div className="progress-hub-rings" >
                {forPage !== "ROUTINE" && <TicketsRemaining tickets={ticketList} label="Open Tickets" />}
                {/* {forPage !== "ROUTINE" && <TicketsRemaining tickets={ticketList.filter(t => t.doToday)} label="For Today" onClick={() => document.querySelector('.today').click()} />} */}
                {forPage !== "ROUTINE" && <TicketsRemaining tickets={ticketList.filter(t => t.doToday)} label="For Today" onClick={() => handleFilter('today')} />}
                {/* {forPage !== "ROUTINE" && <TicketsRemaining label="For Soon" tickets={ticketList.filter(t => t.doSoon)} onClick={() => document.querySelector('.soon').click()} />} */}
                {forPage !== "ROUTINE" && <TicketsRemaining label="For Soon" tickets={ticketList.filter(t => t.doSoon)} onClick={() => handleFilter('soon')} />}
                {daily.length > 0 && <ProgressRing type="daily" tickets={daily} forRoutine={true} />}
                {weekly.length > 0 && <ProgressRing type="weekly" tickets={weekly} forRoutine={true} />}
                {monthly.length > 0 && <ProgressRing type="monthly" tickets={monthly} forRoutine={true} />}
            </div>
        </div>
    );
};