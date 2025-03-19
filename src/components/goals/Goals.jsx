import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { Trash2 } from "lucide-react";
import useAPI from "../hooks/useAPI.js";
import AICanvas from "../ai/AICanvas.jsx";
import { setSelectedGoal } from "../../redux/slices/goalsSlice";
import { clearUserActivatedTickets, fetchTickets, setSelectedTickets, setUserActivatedTickets } from "../../redux/slices/ticketsSlice.js";
import { checkStatus } from "../api/authAPI.js";
import { setIsMobile, setLoggedIn, setLoggedOut, setShowTickets } from "../../redux/slices/sessionSlice.js";
import { setUser } from "../../redux/slices/userSlice.js";
import { fetchGoals } from "../../redux/slices/goalsSlice.js";
import TicketSpace from '../tickets/TicketSpace.jsx';
import TicketList from "../tickets/TicketList.jsx";
import { darkMode } from "../../util/theme_util.js";
import chevron from '../../icons/chevron.png';
import chevronWhite from '../../icons/chevron-white.png';

function Goals() {
    const dispatch = useDispatch();
    const { goals } = useSelector((state) => state.goals);
    const { tickets, selectedTickets, userActivatedTickets } = useSelector((state) => state.tickets);
    const userId = useSelector(state => state.userId);
    const { theme, showTickets, isMobile } = useSelector(state => state.session);
    const selectedGoal = useSelector(state => state.goals.selectedGoal);

    const [, setIsDragging] = useState(false);
    const [trashcanPosition, setTrashcanPosition] = useState({ x: 0, y: 0 });
    const [showTrashcan, setShowTrashcan] = useState(false);

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
        dispatch(setIsMobile(window.innerWidth <= 768))
        const handleResize = () => {
            dispatch(setIsMobile(window.innerWidth <= 768))
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
        <div className={`goals-container${darkMode(theme) ? " dark-mode" : ""}`}>
            {isMobile && (
                <>
                    <div className="ticket-list-spaceholder"></div>
                    <TicketSpace />
                </>
            )}
            <TicketList />
            <div className="goal-and-ticket-container">
            {/* 🔹 Goal Selection Bubbles */}
                <div className="goal-list-header-container">
                        <div className="goal-list-title">Goals and Buckets</div>
                        <div className="goal-subtitle">Group your tickets into <span style={{ color: "#3695de" }}>goals</span> and <span style={{ color: "#dea336" }}>buckets</span></div>
                    <div className="goal-tutorial">{goals.length === 0 && `Type something like "I'd like to get better at cooking" or "Open a new business" to create your first goal or "New bucket Finance" to create a general purpose "Finance" bucket.`}</div>
                </div>
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
            {!isMobile && <TicketSpace />}
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

const GoalCard = ({ goal, selectedGoal, isMobile, handleSelectedGoal, setShowTrashcan, setTrashcanPosition, setIsDragging }) => {
    const [touchStartTime, setTouchStartTime] = useState(0);
    const [touchMoved, setTouchMoved] = useState(false);

    const dragItem = useMemo(() => ({
        id: goal._id,
        type: "goal"
    }), [goal._id]);

    const [{ isDragging }, drag] = useDrag({
        type: "goal",
        item: (monitor) => {
            const { x, y } = monitor.getClientOffset() || { x: 0, y: 0 };
            setTrashcanPosition({ x, y });
            setShowTrashcan(true);
            setIsDragging(true);
            return dragItem;
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        end: () => {
            setTimeout(() => {
                setIsDragging(false);
                setShowTrashcan(false);
            }, 50);
        }
    });

    // Track touch for drag detection
    const handleTouchStart = (e) => {
        setTouchStartTime(Date.now());
        setTouchMoved(false);
    };

    const handleTouchMove = () => {
        setTouchMoved(true); // If moved, it's a drag
    };

    const handleTouchEnd = (e) => {
        const touchDuration = Date.now() - touchStartTime;

        if (!touchMoved && touchDuration < 200) {
            e.preventDefault(); // ✅ Ensure no weird gesture interference
            handleSelectedGoal(goal); // ✅ Fire manually if tap detected
        }
    };

    return (
        <button
            ref={drag} // Keep dragging enabled
            className={`goal-toggle ${selectedGoal?._id === goal._id ? "selected" : ""} ${goal.isBucket ? "is-bucket" : ""}`}
            onClick={isMobile ? null : () => handleSelectedGoal(goal)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                opacity: isDragging ? 0.5 : 1,
                transform: isDragging ? "scale(1.1)" : "scale(1)",
                touchAction: "manipulation" // Prevents unwanted delays
            }}
        >
            {goal.title}
        </button>
    );
};

export default Goals;