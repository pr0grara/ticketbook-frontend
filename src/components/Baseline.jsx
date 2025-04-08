import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TicketList from "./tickets/TicketList";
import AICanvas from "./ai/AICanvas";
import TicketSpace from "./tickets/TicketSpace";
import { fetchGoals } from "../redux/slices/goalsSlice";
import { fetchTickets } from "../redux/slices/ticketsSlice";

function Baseline() {
    const { tickets } = useSelector((state) => state.tickets);
    const { goals } = useSelector((state) => state.goals);
    const { userId } = useSelector(state => state.user); 
    const [filteredTickets, setFilteredTickets] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!goals || goals.length < 1) dispatch(fetchGoals(userId))
        if (!tickets || tickets.length < 1) dispatch(fetchTickets({type: "BY USER", id: userId}))
    }, [])

    useEffect(() => {
        setFilteredTickets(tickets?.filter(t => t.isRecurring))
        // debugger
    }, [tickets])
    return (
        <div className="baseline-container">
            <div className="baseline-header">Welcome to your baseline</div>
            <div className="baseline-sub-header">How we spend our days is how we live our lives</div>
            <div className="baseline-body">This page is dedicated to recurring tickets, handy to remind you what you need to do everyday, week, month or even year. Use the Canvas below to generate tickets and then set your interval.</div>
            {filteredTickets.length > 0 ? (
                <TicketList TICKETS={filteredTickets} />
            ) : (
                <div className="loading-state">Loading your recurring tickets...</div>
            )}            
            <TicketSpace />
            <AICanvas from={"BASELINE"}/>
        </div>
    )
}

export default Baseline;