import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAPI from "../hooks/useAPI.js";
import { clearUserActivatedTickets, updateTicket, updateTicketStatus } from "../../redux/slices/ticketsSlice.js";
import { logFromExternal } from "../../redux/slices/aiMemorySlice.js";
import { handleAIRequest } from "../hooks/useAI.js";
import wind_rose from "../../icons/wind_rose.png"

export default function Ticket({ ticket }) {
    const dispatch = useDispatch();
    const { selectedGoal } = useSelector(state => state.goals);
    const [notes, setNotes] = useState(ticket.notes || []);
    const [userInput, setUserInput] = useState("");
    const [showNotes, setShowNotes] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);

    useEffect(() => {
        console.log("🔄 Ticket Component Re-Rendered", ticket);
    }, [ticket]);

    const humanDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });
    };

    const { deleteItem, fetchGoalById } = useAPI();

    const markDone = () => {
        dispatch(updateTicketStatus({ ticketId: ticket._id, newStatus: "done" }));
        dispatch(clearUserActivatedTickets({ clearOne: ticket._id }));
    };

    const handleAddNote = () => {
        if (userInput.trim()) {
            const newNotes = [...notes, userInput]
            setNotes([...notes, userInput]);
            dispatch(updateTicket({ticketId: ticket._id, ticket: {notes: newNotes}}))
            setUserInput("");
        }
    };

    const handleDeleteNote = (index) => {
        let newNotes = notes.filter((_, i) => i !== index)
        setNotes(newNotes);
        dispatch(updateTicket({ticketId: ticket._id, ticket: {notes: newNotes}}))
    };

    const handleEditNote = (index, newValue) => {
        const updatedNotes = [...notes];
        updatedNotes[index] = newValue;
        setNotes(updatedNotes);
    };

    const handleHelp = async (ticket) => {
        const goalResponse = await fetchGoalById(ticket.goalId);
        const goal = goalResponse.data;
        const request = {
            contextGoals: [goal],
            contextTickets: [ticket],
            userInput: "Please help me achieve this ticket. I need advice.",
            requestType: "advise ticket",
        }
        const adviceResponse = await handleAIRequest(request);
        dispatch(logFromExternal({aiResponse: adviceResponse}))
    }

    const handleMouseDown = () => {
        setShowActions(true);
        setSelectedAction(null);
    };

    const handleMouseUp = () => {
    debugger
        if (selectedAction) {
            selectedAction();
        }
        setShowActions(false);
    };

    return (
        <div className="ticket-container">
            <div className="ticket-item">
                <div className="ticket-utility-container">
                    <div className="compass-container">
                        <img src={wind_rose} alt="" className="ticket-action-icon" onMouseDown={() => setShowActions(!showActions)} />
                        {showActions && (
                            <div className="compass-popup" onClick={() => setShowActions(!showActions)}>
                                <button className="action-button north" onMouseUp={() => { deleteItem({ type: "ticket", id: ticket._id }); setShowActions(false) }}>Delete</button>
                                <button className="action-button west" onMouseUp={()=>{markDone(); setShowActions(false)}}>Done</button>
                                <button className="action-button south" onMouseUp={() => {handleHelp(ticket); setShowActions(false)}}>Help</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="ticket">{ticket.text}</div>
            </div>
            <div className="ticket-item" style={{ fontSize: "small" }}>{ticket.status}</div>
            <div className="ticket-date-container">
                <div className="ticket-item">
                    <div className="ticket-label">Created:&nbsp;</div>
                    <div className="ticket">{humanDate(ticket.createdAt)}</div>
                </div>
                <div className="ticket-item">
                    <div className="ticket-label">Deadline:&nbsp;</div>
                    <div className="ticket">{humanDate(ticket.deadline)}</div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="ticket-item">
                <button onClick={() => setShowNotes(!showNotes)}>
                    {showNotes ? "Hide Notes" : "Show Notes"}
                </button>
                {showNotes && (
                    <div className="ticket-notes">
                        {notes.map((note, index) => (
                            <div key={index} className="note-item">
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => handleEditNote(index, e.target.value)}
                                    className="note-input"
                                />
                                <button onClick={() => handleDeleteNote(index)}>Delete</button>
                            </div>
                        ))}
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Add a note..."
                            className="ticket-note-input"
                        />
                        <button onClick={handleAddNote}>Add Note</button>
                    </div>
                )}
            </div>

            {/* Actions */}
            {/* <div className="ticket-utility-container">
                <div className="compass-container">
                    <img src={wind_rose} alt="" className="ticket-action-icon" onMouseDown={() => setShowActions(!showActions)} />
                    {showActions && (
                        <div className="compass-popup">
                            <button className="action-button north" onMouseUp={() => deleteItem({ type: "ticket", id: ticket._id })}>Delete</button>
                            <button className="action-button west" onMouseUp={markDone}>Done</button>
                            <button className="action-button south" onMouseUp={() => handleHelp(ticket)}>Help</button>
                        </div>
                    )}
                </div>
            </div> */}
        </div>
    );
}
