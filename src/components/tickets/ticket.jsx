import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAPI from "../hooks/useAPI.js";
import { Trash2 } from "lucide-react";
import { clearUserActivatedTickets, updateTicket, updateTicketStatus } from "../../redux/slices/ticketsSlice.js";
import { logFromExternal } from "../../redux/slices/aiMemorySlice.js";
import { handleAIRequest } from "../hooks/useAI.js";
import wind_rose from "../../icons/wind_rose.png"
import joystick from "../../icons/joystick.png"
import joystickDark from "../../icons/joystick-dark.png"
import { darkMode } from "../../util/theme_util.js";
import { setIsLoading } from "../../redux/slices/sessionSlice.js";

export default function Ticket({ ticket, isMobile }) {
    const { deleteItem, fetchGoalById } = useAPI();
    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.session);
    
    // UI State
    const [showNotes, setShowNotes] = useState(false);
    const [showNoteControls, setShowNoteControls] = useState(false)
    const [showChecklist, setShowChecklist] = useState(false);
    const [showChecklistControls, setShowChecklistControls] = useState(false)
    const [showActions, setShowActions] = useState(false);
    
    // User Input
    const [userInput, setUserInput] = useState("");
    
    //Ticket Data State
    const [notes, setNotes] = useState(ticket.notes || []);
    const [checklist, setChecklist] = useState(ticket.checklist || []);
    const [newChecklistItem, setNewChecklistItem] = useState(""); // New item input


    // Inline Editing State
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState("");
    const [loadingField, setLoadingField] = useState(null);

    useEffect(() => {
        console.log("🔄 Ticket Component Re-Rendered", ticket);
    }, [ticket]);

    useEffect(() => {
        if (ticket.checklist?.length > 0 && ticket.checklist[0]?.item !== "") setShowChecklist(true);
        if (JSON.stringify(ticket.checklist) !== JSON.stringify(checklist)) {
            setChecklist(ticket.checklist || []);
        }
    }, [ticket.checklist]);

    useEffect(() => {
        if (ticket.notes?.length > 0 && ticket.notes[0] !== " ") setShowNotes(true);
        if (ticket.notes?.length === 0) {
            // dispatch(updateTicket({ticketId: ticket._id, ticket: {...ticket, notes: [""]}}))
        }
    }, [ticket.notes]);

    const humanDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });
    };

    //Handle Inline Editing Activation
    const handleEdit = (field, value) => {
        setEditingField(field);
        setTempValue(value);
    };

    //Auto-Save on Blur
    const handleBlur = async (field, value) => {
        // debugger
        // if (value === tempValue) {
        //     setEditingField(null);
        //     return;
        // }
        
        if (ticket[field] === tempValue) {
            setEditingField(null);
            return
        }

        setLoadingField(field);
        dispatch(updateTicket({ ticketId: ticket._id, ticket: { [field]: tempValue } }));
        setLoadingField(null);
        setEditingField(null);
    };

    //Cancel Inline Editing
    const handleCancel = () => {
        setEditingField(null);
    };

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

    const setFocus = ({index, item, query}) => {
        setTimeout(() => {
            let items = document.querySelectorAll(query)
            try {
                console.log('focusing item')
                items[index].focus()
            } catch {
                setFocus({index, item, query})
            }
        }, 100)
    }

    const handleAddTicketItem = ({index, item}) => {
        switch (item) {
            case "note":
                const newNotes = [...notes]
                newNotes.splice(index + 1, 0, "");
                setNotes(newNotes);
                dispatch(updateTicket({ ticketId: ticket._id, ticket: { notes: newNotes } }));
                setFocus({index: index+1, item, query: ".note-input"})
                break
            case "checklist":
                const newChecklist = [...checklist];
                newChecklist.splice(index + 1, 0, {item: "", status: "unchecked"});
                setChecklist(newChecklist);
                dispatch(updateTicket({ ticketId: ticket._id, ticket: { checklist: newChecklist } }))
                setFocus({ index: index + 1, item, query: ".checklist-input" })
                break
            default:
                return alert("no valid action for ticket item");
        }
        setUserInput("");
    }

    const handleDeleteNote = (index) => {
        let newNotes = notes.filter((_, i) => i !== index);
        setNotes(newNotes);
        dispatch(updateTicket({ ticketId: ticket._id, ticket: { notes: newNotes } }));
        setFocus({index: index - 1, query: ".note-item"})
    };

    const handleEditNote = (index, newValue, commit) => {
        const updatedNotes = [...notes];
        updatedNotes[index] = newValue;
        setNotes(updatedNotes);
        if (commit) dispatch(updateTicket({ ticketId: ticket._id, ticket: { notes: updatedNotes } }))
    };

    const handleEditTicketItem = ({index, newValue, commit, item}) => {
        switch (item) {
            case "note":
                const updatedNotes = [...notes];
                updatedNotes[index] = newValue;
                setNotes(updatedNotes);
                if (commit) dispatch(updateTicket({ ticketId: ticket._id, ticket: { notes: updatedNotes } }))
            break
            case "checklist":
                const updatedChecklist = [...checklist];
                updatedChecklist[index] = {item: newValue, status: "unchecked"};
                setChecklist(updatedChecklist);
                if (commit) dispatch(updateTicket({ ticketId: ticket._id, ticket: { checklist: updatedChecklist } }))
            break
            default:
                return alert('error editing ticket item')
        }
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
        if (checklist.length > 2) {
            const updatedChecklist = checklist.filter((_, i) => i !== index);
            setChecklist(updatedChecklist);
            dispatch(updateTicket({ ticketId: ticket._id, ticket: { checklist: updatedChecklist } }));
            setFocus({index: index-1, query: ".checklist-input"})
        }
    };

    const handleHelp = async (ticket) => {
        let goalResponse;
        if (!!ticket.goalId) goalResponse = await fetchGoalById(ticket.goalId);
        const goal = goalResponse?.data || "";
        const request = {
            contextGoals: [goal],
            contextTickets: [ticket],
            userInput: "Please help me achieve this ticket. I need advice.",
            requestType: "advise ticket",
        };
        const adviceResponse = await handleAIRequest(request);
        dispatch(logFromExternal({ aiResponse: adviceResponse }));
        dispatch(setIsLoading(false));
    };

    const handlekeydown = (e) => {
        let { index, checklist, note } = e.target.dataset;
        index = parseInt(index);
        if (e.key === "Enter") {
            switch (e.target.dataset.type) {
                case "existing-checklist":
                    handleAddTicketItem({ index, item: "checklist" })                    
                    break
                case "new-checklist":
                    return handleAddChecklistItem();
                case "existing-note":
                    handleEditNote(index, note, true);
                    handleAddTicketItem({ index, item: "note" })
                    break
                case "new-note":
                    return handleAddNote()
                default:
                    return;
            }
        }

        if (e.key === "Backspace") {
            switch (e.target.dataset.type) {
                case "existing-note":
                    if (e.target.value.length === 0) {
                        handleDeleteNote(index)
                    }
                    break
                case "existing-checklist":
                    if (e.target.value.length === 0) {
                        handleDeleteChecklistItem(index)
                    }
                    break
                default:
                    return
            }
        }
    }

    return (
        <div className="ticket-container">
            {!isMobile &&
                <div className="ticket-button-container">
                    <div className="ticket-button done" onClick={() => { markDone(); setShowActions(false); }}>✔️ mark done</div>
                    <div className="ticket-button help" onClick={() => { handleHelp(ticket); setShowActions(false); dispatch(setIsLoading(true));}}>➰ get help</div>
                    <div className="ticket-button delete" onClick={() => { deleteItem({ type: "ticket", id: ticket._id }); setShowActions(false); }}>✖️ delete</div>
                </div>
            }
            <div className="ticket-item">
                {isMobile && 
                <div className="ticket-utility-container">
                    <div className="compass-container">
                        <img src={darkMode(theme) ? joystickDark : joystick} alt="" className="ticket-action-icon" onMouseDown={() => setShowActions(!showActions)} />
                        {showActions && (
                            <div className="compass-popup" onClick={() => setShowActions(!showActions)}>
                                <button className="action-button north" onMouseUp={() => { deleteItem({ type: "ticket", id: ticket._id }); setShowActions(false); }}>Delete</button>
                                <button className="action-button east" onMouseUp={() => { markDone(); setShowActions(false); }}>Done</button>
                                <button className="action-button south" onMouseUp={() => { handleHelp(ticket); setShowActions(false); dispatch(setIsLoading(true))}}>Help</button>
                            </div>
                        )}
                    </div>
                </div>
                }
                {/* <div className="ticket">{ticket.text}</div> */}
                {editingField === "text" ? (
                    <div className="edit-field">
                        <textarea className="editable-textarea" value={tempValue} onChange={(e) => setTempValue(e.target.value)} autoFocus onBlur={() => handleBlur("text", tempValue)} />
                    </div>
                ) : (
                    <p className="editable" onClick={() => handleEdit("text", ticket.text)}>{ticket.text}</p>
                )}
            </div>
            {/* <div className="ticket-item" style={{ fontSize: "small" }}>{ticket.status}</div>
            <div className="ticket-date-container">
                <div className="ticket-item">
                    <div className="ticket-label">Created:&nbsp;</div>
                    <div className="ticket">{humanDate(ticket.createdAt)}</div>
                </div>
                <div className="ticket-item">
                    <div className="ticket-label">Deadline:&nbsp;</div>
                    <div className="ticket">{humanDate(ticket.deadline)}</div>
                </div>
            </div> */}

            {/* Checklist Section */}
            <div className="ticket-item checklist-container">
                <div className="activate-checklist" onClick={()=>setShowChecklist(!showChecklist)}>{showChecklist ? "(-) hide checklist" : "(+) show checklist" }</div>
                {showChecklist && (
                    <>
                    <div className="ticket-checklist" onBlur={() => {
                        dispatch(updateTicket({ ticketId: ticket._id, ticket: { ...ticket, checklist } }))
                    }}>
                        {checklist.map((item, index) => (
                            <div key={index} 
                                className={`checklist-item ${index % 2 === 0 ? "even" : "odd"}`} 
                                onMouseEnter={() => setShowChecklistControls(index)}
                                onMouseLeave={() => setShowChecklistControls(false)}
                            >
                                <div className="checklist-input-container">
                                    <input
                                        type="checkbox"
                                        checked={item?.status === "checked"}
                                        onChange={() => handleToggleChecklistItem(index)}
                                    />
                                    <input 
                                        type="text"
                                        value={item.item}
                                        data-type="existing-checklist"
                                        data-checklist={item}
                                        data-index={index}
                                        className={`checklist-input ${item.status === "checked" ? "checked-list-item" : "unchecked-list-item"}`}
                                        onChange={(e) => handleEditTicketItem({index, newValue: e.target.value, item: "checklist"})}
                                        onKeyDown={handlekeydown}
                                    />
                                    {/* <span className={item.status==="checked" ? "checked-list-item" : ""} >{item.item}</span> */}
                                </div>
                                <div className="checklist-controls"
                                    onMouseEnter={() => setShowChecklistControls(index)}
                                    onMouseLeave={() => setShowChecklistControls(false)}
                                >
                                    <div className={`add-checklist${index === showChecklistControls ? "" : "-disabled"}`} onClick={() => handleAddTicketItem({ index, item: "checklist"})}>+</div>
                                    <span>&nbsp;&nbsp;</span>
                                    <div className={`remove-checklist${index === showChecklistControls ? "" : "-disabled"}`} onClick={() => handleDeleteChecklistItem(index)} >-</div>
                                    <span>&nbsp;</span>
                                </div>
                                {/* <Trash2 onClick={() => handleDeleteChecklistItem(index)} size={"25px"} className="checklist-trash"/> */}
                            </div>
                        ))}
                    </div>
                    {/* <div className="add-checklist-container">
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
                    </div> */}
                    </>
                )}

            </div>

            {/* Notes Section */}
            <div className="ticket-item notes-container">
                <div className="activate-notes" onClick={() => setShowNotes(!showNotes)}>{showNotes ? "(-) hide notes" : "(+) show notes"}</div>
                {showNotes && ( 
                    <>
                    <div className="ticket-notes" style={{border: `${notes.length === 0 ? "none" : ""}`}} onBlur={()=> {
                        dispatch(updateTicket({ticketId: ticket._id, ticket: {...ticket, notes}}))
                    }}>
                        {notes.map((note, index) => (
                            <div key={index} className="note-item">
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => handleEditNote(index, e.target.value)}
                                    className="note-input"
                                    onKeyDown={(e) => handlekeydown(e, {index, item: "note"})}
                                    data-type="existing-note"
                                    data-note={note}
                                    data-index={index}
                                    onMouseEnter={() => setShowNoteControls(index)}
                                    onMouseLeave={() => setShowNoteControls(false)}
                                    onBlur={() => setShowNoteControls(false)}
                                />
                                <div className="note-controls" 
                                    onMouseEnter={() => setShowNoteControls(index)}
                                    onMouseLeave={() => setShowNoteControls(false)}
                                >
                                    <div className={`add-note${index === showNoteControls ? "" : "-disabled"}`} onClick={() => handleAddTicketItem({index, item: "note"})}>+</div>
                                    <span>&nbsp;&nbsp;</span>
                                    <div className={`remove-note${index === showNoteControls ? "" : "-disabled"}`} onClick={() => handleDeleteNote(index)} >-</div>
                                    <span>&nbsp;</span>
                                </div>
                                {/* <Trash2 onClick={() => handleDeleteNote(index)} size={"25px"} className="checklist-trash" /> */}
                                {/* <button onClick={() => handleDeleteNote(index)}>Delete</button> */}
                            </div>
                        ))}
                    </div>
                    {/* <div className="add-note-container">
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
                    </div> */}
                    </>
                )}
            </div>
        </div>
    );
}
