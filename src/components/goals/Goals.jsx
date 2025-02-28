import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { Trash2 } from "lucide-react";
// import GoalInput from "./goalInput.jsx";
// import TicketInput from "../tickets/ticketInput.jsx";
import useAPI from "../hooks/useAPI.js";
import AICanvas from "../ai/AICanvas.jsx";
import { setSelectedGoal } from "../../redux/slices/goalsSlice";
import { fetchTickets, setSelectedTickets } from "../../redux/slices/ticketsSlice.js";

// const userId = "6778de261a642d64cc04996a"; // Placeholder User ID

function Goals() {
    const dispatch = useDispatch();
    const { goals } = useSelector((state) => state.goals);
    const { tickets } = useSelector((state) => state.tickets);
    const userId = useSelector(state => state.userId);
    const selectedGoal = useSelector(state => state.goals.selectedGoal);
    const selectedTickets = useSelector(state => state.tickets.selectedTickets);

    const displayedTickets = useMemo(() => {
        if (selectedTickets.length > 0) return selectedTickets;
        if (selectedGoal) return tickets.filter(ticket => ticket.goalId === selectedGoal._id);
        return tickets;
    }, [selectedTickets, tickets, selectedGoal]);

    const [, setIsDragging] = useState(false);
    const [trashcanPosition, setTrashcanPosition] = useState({ x: 0, y: 0 });
    const [showTrashcan, setShowTrashcan] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        console.log("🔄 Goals Component Re-Rendered");
    });
    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (selectedGoal) {
            const goalTickets = tickets.filter(ticket => ticket.goalId === selectedGoal._id);
            if (goalTickets.length === 0) {
                console.log("No tickets found for selected Goal, fetching from server...")
                dispatch(fetchTickets({ type: "BY GOAL", id: selectedGoal._id }))
            };
            dispatch(setSelectedTickets({ goal: selectedGoal, tickets: goalTickets }));
        }
    }, [dispatch, selectedGoal, userId, tickets]);

    const {
        aiSuggestions,
        handleRemoveSuggestedTicket,
        handleTicketDrop,
        deleteItem
    } = useAPI(userId, selectedGoal);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ["ticket", "goal"],
        drop: (item) => deleteItem(item),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div className="goals-container">
            {/* 🔹 Goal Selection Bubbles */}
            <div className="goal-selection">
                {goals.map((goal) => (
                    <button
                        key={goal._id}
                        className={`goal-toggle ${selectedGoal?._id === goal._id ? "selected" : ""}`}
                        onClick={() => !isMobile && dispatch(setSelectedGoal(goal))}
                        onTouchStart={() => dispatch(setSelectedGoal(goal))}
                    >
                        {goal.title}
                    </button>
                ))}
            </div>

            {/* 🔹 Kanban Board */}
            <div className="kanban-board">
                <h2>{selectedGoal ? isMobile ? null : `${selectedGoal.title}` : isMobile ? null : "Select a Goal"}</h2>
                <div className="kanban-columns">
                    <KanbanColumn title="Pending" status="pending" tickets={displayedTickets.filter(t => t.status === "pending")} onDrop={handleTicketDrop} setIsDragging={setIsDragging} selectedGoal={selectedGoal} setTrashcanPosition={setTrashcanPosition} setShowTrashcan={setShowTrashcan} />
                    <KanbanColumn title="In Progress" status="in-progress" tickets={displayedTickets.filter(t => t.status === "in-progress")} onDrop={handleTicketDrop} setIsDragging={setIsDragging} selectedGoal={selectedGoal} setTrashcanPosition={setTrashcanPosition} setShowTrashcan={setShowTrashcan} />
                    {!isMobile && <KanbanColumn title="Done" status="done" tickets={displayedTickets.filter(t => t.status === "done")} onDrop={handleTicketDrop} setIsDragging={setIsDragging} selectedGoal={selectedGoal} setTrashcanPosition={setTrashcanPosition} setShowTrashcan={setShowTrashcan} />}
                </div>
            </div>

            <AICanvas userId={userId} tickets={tickets} selectedGoal={selectedGoal} aiSuggestions={aiSuggestions} handleRemoveSuggestedTicket={handleRemoveSuggestedTicket} />
            <div
                ref={drop}
                className={`trash-can ${showTrashcan ? "visible" : ""}`}
                style={{
                    position: "absolute",
                    top: `${trashcanPosition.y - 50}px`,
                    left: `${trashcanPosition.x + 50}px`, // Adjust offset
                    transition: "top 0.1s, left 0.1s"
                }}
            >
                <Trash2 size={40} color={isOver ? "red" : "black"} />
                <p>Drop here to delete</p>
            </div>
        </div>
    );
}

function KanbanColumn({ title, status, tickets, onDrop, setIsDragging, setTrashcanPosition, setShowTrashcan }) {
    const [, drop] = useDrop(() => ({
        accept: "ticket",
        drop: (item) => onDrop(item.id, status),
    }));

    return (
        <div ref={drop} className="kanban-column">
            <h3>{title}</h3>
            {tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} useDrag={useDrag} setIsDragging={setIsDragging} setTrashcanPosition={setTrashcanPosition} setShowTrashcan={setShowTrashcan} />
            ))}
        </div>
    );
}

function TicketCard({ ticket, setIsDragging, setShowTrashcan, setTrashcanPosition }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "ticket",
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        item: (monitor) => {
            setIsDragging(true);
            const { x, y } = monitor.getClientOffset() || { x: 0, y: 0 }; // Get position
            setTrashcanPosition({ x, y });
            setShowTrashcan(true);
            return { id: ticket._id, type: "ticket" };
        },
        end: () => {
            setIsDragging(false);
            setShowTrashcan(false);
        }
    }));

    return (
        <div ref={drag} className="ticket-card" style={{ opacity: isDragging ? 0.5 : 1, transform: isDragging ? "scale(1.15)" : "scale(1)" }}>
            {ticket.text}
        </div>
    );
}

// function GoalCard({ goal, setIsDragging, onClick, selectedGoal, setShowTrashcan, setTrashcanPosition }) {
//     const [{ isDragging }, drag] = useDrag(() => ({
//         type: "goal",
//         item: { id: goal._id, type: "goal" },
//         collect: (monitor) => ({
//             isDragging: !!monitor.isDragging(),
//         }),
//         item: (monitor) => {
//             setIsDragging(true);
//             const { x, y } = monitor.getClientOffset() || { x: 0, y: 0 }; // Get position
//             setTrashcanPosition({ x, y });
//             setShowTrashcan(true);
//             return { id: goal._id, type: "goal" };
//         },
//         end: () => {
//             setIsDragging(false);
//             setShowTrashcan(false);
//         }
//     }));

//     const isSelected = ((selectedGoal) => !selectedGoal ? false : goal._id === selectedGoal._id)

//     return (
//         <li ref={drag} className={`goal-card ${isDragging ? "dragging" : "", isSelected(selectedGoal) ? "selected" : ""}`} onClick={onClick} style={{ opacity: isDragging ? 0.5 : 1 }}>
//             {goal.title}
//         </li>
//     );
// }


export default Goals;