import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { Trash2 } from "lucide-react";
import GoalInput from "./goalInput.jsx";
// import TicketInput from "../tickets/ticketInput.jsx";
import useAPI from "../hooks/useAPI.js";
import AICanvas from "../ai/AICanvas.jsx";
import { fetchGoals, setSelectedGoal } from "../../redux/slices/goalsSlice";
import { setUser } from "../../redux/slices/userSlice.js";
import { fetchTickets, setSelectedTickets } from "../../redux/slices/ticketsSlice.js";

const userId = "6778de261a642d64cc04996a"; // Placeholder User ID

function Goals() {
    const dispatch = useDispatch();
    const { goals } = useSelector((state) => state.goals); //pull goals from redux state
    const { tickets } = useSelector((state) => state.tickets); //pull tickets from redux state
    const user = useSelector(state => state.user); //pull user from redux state
    const selectedGoal = useSelector(state => state.goals.selectedGoal); // pull selectedGoal from redux state
    const selectedTickets = useSelector(state => state.tickets.selectedTickets); // pull selectedTickets from redux state

    //Use useMemo to derive computed state
    const displayedTickets = useMemo(() => {
        if (selectedTickets.length > 0) return selectedTickets;
        if (selectedGoal) return tickets.filter(ticket => ticket.goalId === selectedGoal._id)
        if (selectedTickets.length === 0) return tickets;
    }, [selectedTickets, tickets, selectedGoal]);

    const [isDragging, setIsDragging] = useState(false);
    const [trashcanPosition, setTrashcanPosition] = useState({ x: 0, y: 0 });
    const [showTrashcan, setShowTrashcan] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => { dispatch(fetchGoals(user)); }, [dispatch, user]); // Fetch goals for user

    useEffect(() => {
        if (!user && userId) dispatch(setUser(userId)); // Ensure user is set
        if (!selectedGoal && user && tickets.length === 0) dispatch(fetchTickets({ type: "BY USER", id: user })); // Fetch all user's tickets
        if (selectedGoal) { //filter tickets belonging to selected goal
            const goalTickets = tickets.filter(ticket => ticket.goalId === selectedGoal._id)
            if (goalTickets.length === 0) dispatch(fetchTickets({ type: "BY GOAL", id: selectedGoal._id }));
            dispatch(setSelectedTickets({goal: selectedGoal, tickets: goalTickets}))
        }
    }, [dispatch, selectedGoal, user, userId]);

    useEffect(() => {
        if (selectedGoal) dispatch(setSelectedTickets({goal: selectedGoal}));
    }, [selectedGoal, tickets]);  //Ensure selectedTickets updates when tickets change

    const {
        // goals,
        // tickets,
        aiSuggestions,
        // aiResponse,
        handleGoalAdded,
        aiSuggestBreakdown,
        handleAiBreakdownForExistingGoal,
        handleRemoveSuggestedTicket,
        handleTicketDrop,
        deleteItem,
        // handleAiSubmit
    } = useAPI(userId, selectedGoal);

    useEffect(() => {
        // debugger
        console.log("AiSuggestion change in goal.jsx", aiSuggestions);
    }, [aiSuggestions]);  // Logs whenever aiSuggestions changes

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ["ticket", "goal"],
        drop: (item) => deleteItem(item),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div className="goals-container">
            {!isMobile &&
                <div className="goal-tree">
                    <h2>🎯 Goals</h2>
                    <GoalInput onGoalAdded={handleGoalAdded} />
                    <button className="ai-btn" onClick={aiSuggestBreakdown}>🤖 AI Breakdown</button>
                    <button className="ai-btn" onClick={handleAiBreakdownForExistingGoal} disabled={!selectedGoal}>🔄 AI Expand</button>
                    <ul className="goal-list">
                        {goals.map((goal) => (
                            <GoalCard key={goal._id} goal={goal} onClick={() => dispatch(setSelectedGoal(goal))} setIsDragging={setIsDragging} selectedGoal={selectedGoal} setTrashcanPosition={setTrashcanPosition} setShowTrashcan={setShowTrashcan} />
                        ))}
                    </ul>
                </div>
            }

            <div className="kanban-board">
                <h2>{selectedGoal ? `📌 ${selectedGoal.title}` : "Select a Goal"}</h2>
                
                {
                    <>
                        {/* <TicketInput goalId={selectedGoal._id} userId={userId} onTicketAdded={handleTicketAdded} /> */}
                        <div className="kanban-columns">
                            <KanbanColumn title="Pending" status="pending" tickets={displayedTickets.filter(t => t.status === "pending")} onDrop={handleTicketDrop} setIsDragging={setIsDragging} setTrashcanPosition={setTrashcanPosition} setShowTrashcan={setShowTrashcan}/>
                            <KanbanColumn title="In Progress" status="in-progress" tickets={displayedTickets.filter(t => t.status === "in-progress")} onDrop={handleTicketDrop} setIsDragging={setIsDragging} setTrashcanPosition={setTrashcanPosition} setShowTrashcan={setShowTrashcan} />
                            {!isMobile && 
                                <KanbanColumn title="Done" status="done" tickets={displayedTickets.filter(t => t.status === "done")} onDrop={handleTicketDrop} setIsDragging={setIsDragging} setTrashcanPosition={setTrashcanPosition} setShowTrashcan={setShowTrashcan} />
                            }
                        </div>
                    </>
                }
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
        item: { id: ticket._id, type: "ticket" },
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
        <div ref={drag} className="ticket-card" style={{ opacity: isDragging ? 0.5 : 1 }}>
            {ticket.text}
        </div>
    );
}

function GoalCard({ goal, setIsDragging, onClick, selectedGoal, setShowTrashcan, setTrashcanPosition }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "goal",
        item: { id: goal._id, type: "goal" },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        item: (monitor) => {
            setIsDragging(true);
            const { x, y } = monitor.getClientOffset() || { x: 0, y: 0 }; // Get position
            setTrashcanPosition({ x, y });
            setShowTrashcan(true);
            return { id: goal._id, type: "goal" };
        },
        end: () => {
            setIsDragging(false);
            setShowTrashcan(false);
        }
    }));

    const isSelected = ((selectedGoal) => !selectedGoal ? false : goal._id === selectedGoal._id)

    return (
        <li ref={drag} className={`goal-card ${isDragging ? "dragging" : "", isSelected(selectedGoal) ? "selected" : ""}`} onClick={onClick} style={{ opacity: isDragging ? 0.5 : 1 }}>
            {goal.title}
        </li>
    );
}


export default Goals;