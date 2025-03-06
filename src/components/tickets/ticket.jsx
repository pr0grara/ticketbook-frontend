import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAPI from "../hooks/useAPI.js";
import { Trash2 } from "lucide-react";
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
    const [showChecklist, setShowChecklist] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [checklist, setChecklist] = useState(ticket.checklist || []);
    const [newChecklistItem, setNewChecklistItem] = useState(""); // New item input

    useEffect(() => {
        console.log("🔄 Ticket Component Re-Rendered", ticket);
    }, [ticket]);

    useEffect(() => {

    }, [checklist])

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
            const newNotes = [...notes, userInput];
            setNotes(newNotes);
            dispatch(updateTicket({ ticketId: ticket._id, ticket: { notes: newNotes } }));
            setUserInput("");
        }
    };

    const handleDeleteNote = (index) => {
        let newNotes = notes.filter((_, i) => i !== index);
        setNotes(newNotes);
        dispatch(updateTicket({ ticketId: ticket._id, ticket: { notes: newNotes } }));
    };

    const handleEditNote = (index, newValue, commit) => {
        const updatedNotes = [...notes];
        updatedNotes[index] = newValue;
        setNotes(updatedNotes);
        if (commit) dispatch(updateTicket({ ticketId: ticket._id, ticket: { notes: updatedNotes } }))
    };

    const handleToggleChecklistItem = (index) => {
        const updatedChecklist = checklist.map((item, i) =>
            i === index ? { ...item, status: item.status === "checked" ? "unchecked" : "checked" } : item
        );
        setChecklist(updatedChecklist);
        dispatch(updateTicket({ ticketId: ticket._id, ticket: { checklist: updatedChecklist } }));
    };

    const handleAddChecklistItem = () => {
        if (newChecklistItem.trim()) {
            const updatedChecklist = [...checklist, { item: newChecklistItem, status: "unchecked" }];
            setChecklist(updatedChecklist);
            dispatch(updateTicket({ ticketId: ticket._id, ticket: { checklist: updatedChecklist } }));
            setNewChecklistItem(""); // Clear input after adding
        }
    };

    const handleDeleteChecklistItem = (index) => {
        const updatedChecklist = checklist.filter((_, i) => i !== index);
        setChecklist(updatedChecklist);
        dispatch(updateTicket({ ticketId: ticket._id, ticket: { checklist: updatedChecklist } }));
    };

    const handleHelp = async (ticket) => {
        const goalResponse = await fetchGoalById(ticket.goalId);
        const goal = goalResponse.data;
        const request = {
            contextGoals: [goal],
            contextTickets: [ticket],
            userInput: "Please help me achieve this ticket. I need advice.",
            requestType: "advise ticket",
        };
        const adviceResponse = await handleAIRequest(request);
        dispatch(logFromExternal({ aiResponse: adviceResponse }));
    };

    const handlekeydown = (e) => {
        if (e.key === "Enter") {
            switch (e.target.dataset.type) {
                case "existing-checklist":

                    break
                case "new-checklist":
                    return handleAddChecklistItem();
                case "existing-note":
                    const { index, note } = e.target.dataset;
                    return handleEditNote(index, note, true);
                case "new-note":
                    return handleAddNote()
                default:
                    return;
            }
        }
    }

    return (
        <div className="ticket-container">
            <div className="ticket-item">
                <div className="ticket-utility-container">
                    <div className="compass-container">
                        <img src={wind_rose} alt="" className="ticket-action-icon" onMouseDown={() => setShowActions(!showActions)} />
                        {showActions && (
                            <div className="compass-popup" onClick={() => setShowActions(!showActions)}>
                                <button className="action-button north" onMouseUp={() => { deleteItem({ type: "ticket", id: ticket._id }); setShowActions(false); }}>Delete</button>
                                <button className="action-button west" onMouseUp={() => { markDone(); setShowActions(false); }}>Done</button>
                                <button className="action-button south" onMouseUp={() => { handleHelp(ticket); setShowActions(false); }}>Help</button>
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

            {/* Checklist Section */}
            <div className="ticket-item checklist-container">
                <div className="activate-checklist" onClick={()=>setShowChecklist(!showChecklist)}>{showChecklist ? "(-) Hide Checklist" : "(+) Show Checklist" }</div>
                {showChecklist && checklist.length > 0 && (
                    <div className="ticket-checklist">
                        {checklist.map((item, index) => (
                            <div key={index} className={`checklist-item ${index%2===0 ? "even":"odd"}`}>
                                <div>
                                    <input
                                        type="checkbox"
                                        checked={item.status === "checked"}
                                        onChange={() => handleToggleChecklistItem(index)}
                                        // onKeyDown={handlekeydown}
                                        // data-type="existing-checklist"
                                        // data-index={index}
                                    />
                                    <span className={item.status==="checked" ? "checked-list-item" : ""} >{item.item}</span>
                                </div>
                                <Trash2 onClick={() => handleDeleteChecklistItem(index)} size={"25px"} className="checklist-trash"/>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add New Checklist Item */}
                <div className="add-checklist-container">
                    <input
                        type="text"
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        placeholder="New checklist item..."
                        className="checklist-input"
                        onKeyDown={handlekeydown}
                        data-type="new-checklist"

                    />
                    <div onClick={handleAddChecklistItem}>ADD ITEM</div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="ticket-item notes-container">
                <div className="activate-notes" onClick={() => setShowNotes(!showNotes)}>{showNotes ? "(-) Hide Notes" : "(+) Show Notes"}</div>
                {showNotes && (
                    <div className="ticket-notes">
                        {notes.map((note, index) => (
                            <div key={index} className="note-item">
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => handleEditNote(index, e.target.value)}
                                    className="note-input"
                                    onKeyDown={handlekeydown}
                                    data-type="existing-note"
                                    data-note={note}
                                    data-index={index}
                                />
                                <Trash2 onClick={() => handleDeleteNote(index)} size={"25px"} className="checklist-trash" />
                                {/* <button onClick={() => handleDeleteNote(index)}>Delete</button> */}
                            </div>
                        ))}
                    </div>
                )}
                <div className="add-note-container">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Add a note..."
                        className="ticket-note-input"
                        // onKeyDown={handlekeydown}
                        onKeyDown={handlekeydown}
                        data-type="new-note"
                    />
                    <div onClick={handleAddNote} style={{ backgroundColor:"rgba(140, 71, 197)"}}>ADD NOTE</div>
                </div>
            </div>
        </div>
    );
}
