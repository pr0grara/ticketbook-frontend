import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TicketList from "./tickets/TicketList";
import AICanvas from "./ai/AICanvas";
import TicketSpace from "./tickets/TicketSpace";
import { fetchGoals } from "../redux/slices/goalsSlice";
import { fetchTickets } from "../redux/slices/ticketsSlice";
import { setIsMobile } from "../redux/slices/sessionSlice";
import { darkMode } from "../util/theme_util";
import { useNavigate } from "react-router-dom";
import ProgressHub from "./Progress/ProgressHub";

function Routine() {
    const { tickets, userActivatedTickets } = useSelector((state) => state.tickets);
    const { goals } = useSelector((state) => state.goals);
    const { userId, firstname } = useSelector(state => state.user); 
    const { theme, isMobile } = useSelector(state => state.session);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!goals || goals.length < 1) dispatch(fetchGoals(userId))
        if (!tickets || tickets.length < 1) dispatch(fetchTickets({type: "BY USER", id: userId}))
    }, [])

    useEffect(() => {   
        dispatch(setIsMobile(window.innerWidth <= 768))
        const handleResize = () => {
            dispatch(setIsMobile(window.innerWidth <= 768))
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const recurringTickets = tickets?.filter(t => t.isRecurring);
    const daily = recurringTickets.filter(t => t.isRecurring === "daily");
    const weekly = recurringTickets.filter(t => t.isRecurring === "weekly");
    const monthly = recurringTickets.filter(t => t.isRecurring === "monthly");

    return (
        <div className={`routine-container${darkMode(theme) ? " dark-mode" : ""}`}>
                {isMobile && (
                    <>
                        <div className="ticket-list-spaceholder"></div>
                        <TicketSpace />
                    </>
                )}
                {recurringTickets.length > 0 ? (
                    <TicketList TICKETS={recurringTickets} forPage="ROUTINE" data={{
                        title: 'Recurring Tickets',
                        subtitle: 'All daily, weekly and monthly recurring tickets'
                    }} />
                ) : (
                    <div className="loading-state">Loading your recurring tickets...</div>
                )}    

                <div className="routine-ticketspace-container">
                    {userActivatedTickets?.length === 0 && recurringTickets.length === 0 && <div className="routine-banner-container">
                        {/* <div className="routine-header">Welcome to your routine...</div>
                        <div className="routine-sub-header">"How I spend me days is how me live me life" -choop scoop</div> */}
                        <div className="routine-header">Recurring tickets will respawn daily, weekly or monthly.</div>
                    <div className="routine-body">To add recurrence... go to the <span onClick={() => navigate('/goals')}>goals</span> page → {isMobile ? "long-press" : "right-click"} any ticket → select 'Recurrence Settings'.</div>
                        {firstname === "Ngoc" && <h5>Hi choop 😘 lub u</h5>}
                    </div>}   
                    {recurringTickets.length > 0 && <ProgressHub />}
                    {!isMobile && <TicketSpace />}
                </div>   
                <AICanvas from={"ROUTINE"}/>
        </div>
    )
}

export default Routine;