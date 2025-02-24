import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCalendarEvents } from "./api/calendarAPI";
import GoogleLoginButton from "./buttons/GoogleLoginButton";
import AICanvas from './ai/AICanvas.jsx';
import { setSelectedTickets } from "../redux/slices/ticketsSlice.js";

const localizer = momentLocalizer(moment);

function CalendarView() {
    const [events, setEvents] = useState([]);
    const dispatch = useDispatch();
    const { tickets } = useSelector((state) => state.tickets);
    const { selectedTickets } = useSelector((state) => state.tickets.selectedTickets)

    const goalColors = [
        "red",
        "blue",
        "green",
        "purple",
        "orange",
        "magenta",
        "cyan"
    ]

    const generateGoalColors = (tickets) => {
        let uniqueGoals = {};
        tickets.forEach(ticket => {
            uniqueGoals[ticket.goalId] = "";
        })
        Object.keys(uniqueGoals).forEach((goalId, idx) => {
            uniqueGoals[goalId] = goalColors[idx % goalColors.length]
        })
        return uniqueGoals;
    };

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.backgroundColor || "grey", // ✅ Use event's backgroundColor if available
                color: "white",
                borderRadius: "5px",
                padding: "5px"
            }
        };
    };

    useEffect(() => {
        async function loadEvents() {
            const fetchedEvents = await fetchCalendarEvents();
            const formattedEvents = fetchedEvents.map((event, idx) => ({
                title: event.summary,
                start: event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date),
                end: event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date),
            }));
            if (tickets.length > 0) {
                const ticketIds = new Set(formattedEvents.map(event => event._id)); // ✅ Store existing event IDs
                const uniqueGoalColors = generateGoalColors(tickets);
                tickets.forEach(ticket => {
                    // console.log(uniqueGoalColors[ticket.goalId])
                    if (!ticketIds.has(ticket._id)) { // ✅ Only add unique tickets
                        formattedEvents.push({
                            title: ticket.text,
                            start: new Date(ticket.deadline),
                            end: new Date(ticket.deadline),
                            "_id": ticket._id,
                            goalId: ticket.goalId || null,
                            backgroundColor: uniqueGoalColors[ticket.goalId] || "grey"
                        });
                    }
                });
            }
            console.log(formattedEvents)
            setEvents(formattedEvents);
        }
        loadEvents();
    }, [tickets]);

    const handleSelectEvent = (event) => {
        dispatch(setSelectedTickets({event}))
        // debugger
    }


    return (
        <>
            <div style={{ height: "600px" }}>
                <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" onSelectEvent={handleSelectEvent} eventPropGetter={eventStyleGetter} />
                <GoogleLoginButton />
            </div>
            <AICanvas from="from_calendar"/>
        </>
    );
}


export default CalendarView;