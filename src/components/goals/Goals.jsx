import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { Trash2 } from "lucide-react";
import useAPI from "../hooks/useAPI.js";
import AICanvas from "../ai/AICanvas.jsx";
import { setSelectedGoal } from "../../redux/slices/goalsSlice";
import { clearUserActivatedTickets, fetchTickets, setSelectedTickets, setUserActivatedTickets } from "../../redux/slices/ticketsSlice.js";
import { checkStatus } from "../api/authAPI.js";
import { setLoggedIn, setLoggedOut } from "../../redux/slices/sessionSlice.js";
import { setUser } from "../../redux/slices/userSlice.js";
import { fetchGoals } from "../../redux/slices/goalsSlice.js";
import TicketSpace from '../tickets/TicketSpace.jsx';

function Goals() {
    const dispatch = useDispatch();
    const { goals } = useSelector((state) => state.goals);
    const { tickets, selectedTickets, userActivatedTickets } = useSelector((state) => state.tickets);
    const userId = useSelector(state => state.userId);
    const selectedGoal = useSelector(state => state.goals.selectedGoal);
    
    const memoizedTickets = useMemo(() => tickets, [tickets]);
    const memoizedGoals = useMemo(() => goals, [goals]);

    const displayedTickets = useMemo(() => {
        if (!selectedGoal) return memoizedTickets.filter(ticket => ticket.status !== "done");
        if (selectedTickets.length > 0) return selectedTickets.filter(ticket => ticket.status !== "done");
        if (selectedGoal) return memoizedTickets.filter(ticket => ticket.goalId === selectedGoal._id).filter(ticket=> ticket.status !== "done");
        return memoizedTickets;
    }, [selectedTickets, memoizedTickets, selectedGoal]);

    const [, setIsDragging] = useState(false);
    const [trashcanPosition, setTrashcanPosition] = useState({ x: 0, y: 0 });
    const [showTrashcan, setShowTrashcan] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {        
        checkStatus()
            .then(res => {
                const status = res.loggedIn;
                const userId = res.user?.id;
                if (status) {
                    if (goals.length === 0) dispatch(fetchGoals(userId));
                    if (tickets.length === 0) dispatch(fetchTickets({ type: "BY USER", id: userId }));
                }
                if (!status) dispatch(setLoggedOut())
            })
        console.log("HIT")

    }, [dispatch]);
    
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
                // dispatch(fetchTickets({ type: "BY GOAL", id: selectedGoal._id }))
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
        drop: (item) => {
            if (!item || !item.id) {
                console.warn("❌ Drop failed - No valid item detected");
                return;
            }

            console.log("🚮 Dropped Item:", item);
            deleteItem(item); // ✅ Directly call the delete function

            setTimeout(() => {
                console.log("✅ Dragging Ended Successfully");
                setIsDragging(false);
                setShowTrashcan(false);
            }, 50);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [deleteItem]); // ✅ Directly pass deleteItem (no need for memoization)


    const handleSelectedGoal = (goal) => {
        dispatch(clearUserActivatedTickets({clearAll: true}))
        dispatch(setSelectedGoal(goal))
    }

    const isUserActivated = useMemo(() => {
        return (ticket) => userActivatedTickets.includes(ticket);
    }, [userActivatedTickets]);

    return (
        <>
        <div className="goals-container">
            <div className="ticket-list-container">
                <div className="ticket-list-title">Tickets</div>
                <div className="subtitle">small tasks belonging to a Goal</div>
                {displayedTickets.map(ticket => (
                    <TicketCard 
                        ticket={ticket} 
                        dispatch={dispatch} 
                        setIsDragging={setIsDragging} 
                        setShowTrashcan={setShowTrashcan} 
                        setTrashcanPosition={setTrashcanPosition} 
                        userActivated={() => isUserActivated(ticket)} 
                        key={ticket._id}
                    />
                ))}
                <div className="ticket-list-spaceholder"></div>
            </div>
            <div className="goal-and-ticket-container">
            {/* 🔹 Goal Selection Bubbles */}
                <div className="goal-list-title">Goals</div>
                <div className="goal-selection">
                        {goals.map((goal) => (
                            <GoalCard 
                                key={goal._id} 
                                goal={goal}
                                handleSelectedGoal={handleSelectedGoal}
                                selectedGoal={selectedGoal} 
                                isMobile={isMobile}
                                setIsDragging={setIsDragging} 
                                setShowTrashcan={setShowTrashcan}
                                setTrashcanPosition={setTrashcanPosition}
                            />
                        ))}
                </div>
                <TicketSpace />
            </div>

            <div
                ref={drop}
                className={`trash-can ${showTrashcan ? "visible" : ""}`}
                style={{
                    position: "absolute",
                    top: `${trashcanPosition.y + 25}px`,
                    left: `${trashcanPosition.x - 40}px`, // Adjust offset
                    transition: "top 0.1s, left 0.1s"
                }}
            >
                <Trash2 size={"50px"} color={isOver ? "red" : "black"} />
                <div>Drop to delete</div>
            </div>
        </div>
        <AICanvas userId={userId} tickets={tickets} selectedGoal={selectedGoal} aiSuggestions={aiSuggestions} handleRemoveSuggestedTicket={handleRemoveSuggestedTicket} />
        </>
    );
}

function TicketCard({ ticket, setIsDragging, setShowTrashcan, setTrashcanPosition, dispatch, userActivated }) {
    let touchStartTime = 0;
    const isUserActivatedTicket = useMemo(() => userActivated(ticket), [ticket, userActivated]);

    // ✅ Memoize drag item object
    const dragItem = useMemo(() => ({
        id: ticket._id,
        type: "ticket"
    }), [ticket._id]);

    // ✅ useDrag() with latest API (React DnD v14+)
    const [{ isDragging }, drag] = useDrag({
        type: "ticket",
        item: (monitor) => {
            const { x, y } = monitor.getClientOffset() || { x: 0, y: 0 };
            setTrashcanPosition({ x, y });
            setIsDragging(true);
            setShowTrashcan(true);
            return dragItem; // ✅ Return the memoized dragItem
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        end: () => {
            setIsDragging(false);
            setShowTrashcan(false);
            // setTimeout(() => {
            //     setIsDragging(false);
            //     setShowTrashcan(false);
            // }, 5);
        }
    });

    const handleTouchStart = () => {
        console.log("STARTED COUNTING TOUCH TIME")
        touchStartTime = Date.now();
    };

    const handleTouchEnd = () => {
        const touchDuration = Date.now() - touchStartTime;
        console.log(touchDuration)
        if (touchDuration < 150) { // ✅ Short tap detected
            dispatch(setUserActivatedTickets({ userActivatedTicket: ticket }));
        }
    };

    return (
        <div 
            ref={drag} 
            onTouchStart={handleTouchStart} 
            onTouchEndCapture={handleTouchEnd}
            onClick={() => dispatch(setUserActivatedTickets({userActivatedTicket: ticket}))} 
            className={`${isUserActivatedTicket ? "user-activated-ticket " : ""}ticket-card`}
            style={{ opacity: isDragging ? 0.5 : 1, transform: isDragging ? "scale(1.15)" : "scale(1)", backgroundColor: isUserActivatedTicket && "#3694de", color: isUserActivatedTicket && "white" }}
        >
            {ticket.title}
        </div>
    );
}

const GoalCard = ({ goal, selectedGoal, isMobile, handleSelectedGoal, setShowTrashcan, setTrashcanPosition, setIsDragging }) => {
    // ✅ Memoize drag item object
    const dragItem = useMemo(() => ({
        id: goal._id,
        type: "goal"
    }), [goal._id]);

    // ✅ useDrag() with latest API (React DnD v14+)
    const [{ isDragging }, drag] = useDrag({
        type: "goal",
        item: (monitor) => {
            console.log("Drag Start - Goal:", goal._id);
            const { x, y } = monitor.getClientOffset() || { x: 0, y: 0 };
            setTrashcanPosition({ x, y });
            setShowTrashcan(true);
            setIsDragging(true);
            return dragItem; // ✅ Return the memoized dragItem
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        end: (item, monitor) => {
            setTimeout(() => {
                setIsDragging(false);
                setShowTrashcan(false);
            }, 50);
        }
    });

    return (
        <button
            ref={drag} // ✅ Attach drag here
            className={`goal-toggle ${selectedGoal?._id === goal._id ? "selected" : ""}`}
            onClick={() => !isMobile && handleSelectedGoal(goal)}
            onTouchStart={() => handleSelectedGoal(goal)}
            style={{
                opacity: isDragging ? 0.5 : 1,
                transform: isDragging ? "scale(1.1)" : "scale(1)"
            }}
        >
            {goal.title}
        </button>
    );
};

export default Goals;