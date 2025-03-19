import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { Trash2 } from "lucide-react";
import useAPI from "../hooks/useAPI.js";
import { setSelectedTickets,setUserActivatedTickets, updateTicketsOrder } from "../../redux/slices/ticketsSlice.js";
import { setShowTickets } from "../../redux/slices/sessionSlice.js";
import { darkMode } from "../../util/theme_util.js";
import chevron from '../../icons/chevron.png';
import chevronWhite from '../../icons/chevron-white.png';

function TicketList() {
    const dispatch = useDispatch();
    const { goals } = useSelector((state) => state.goals);
    const { tickets, selectedTickets, userActivatedTickets } = useSelector((state) => state.tickets);
    const userId = useSelector(state => state.userId);
    const { theme, showTickets, isMobile } = useSelector(state => state.session);
    const selectedGoal = useSelector(state => state.goals.selectedGoal);

    const [, setIsDragging] = useState(false);
    const [trashcanPosition, setTrashcanPosition] = useState({ x: 0, y: 0 });
    const [showTrashcan, setShowTrashcan] = useState(false);
    const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
    const [ticketWidth, setTicketWidth] = useState(0);
    const [openTickets, setOpenTickets] = useState([]);
    const [closedTickets, setClosedTickets] = useState([]);
    
    const widthRef = useRef(null);
        
    const memoizedTickets = useMemo(() => tickets, [tickets]);

    // const openTickets = useMemo(() => {
    //     // if (!selectedGoal) return memoizedTickets.filter(ticket => ticket.status !== "done");
    //     if (selectedTickets.length > 0) return selectedTickets.filter(ticket => ticket.status !== "done");
    //     if (selectedGoal) return memoizedTickets.filter(ticket => ticket.goalId === selectedGoal._id).filter(ticket=> ticket.status !== "done");
    //     return memoizedTickets;
    // }, [selectedTickets, memoizedTickets, selectedGoal]);

    // const closedTickets = useMemo(() => {
    //     // if (!selectedGoal) return memoizedTickets.filter(ticket => ticket.status === "done");
    //     if (selectedTickets.length > 0) return selectedTickets.filter(ticket => ticket.status === "done");
    //     if (selectedGoal) return memoizedTickets.filter(ticket => ticket.goalId === selectedGoal._id).filter(ticket => ticket.status === "done");
    // }, [selectedTickets, memoizedTickets, selectedGoal])

    useEffect(() => {
        console.log("reanalyzing")
        let sortedOpenTickets, filteredOpenTickets, sortedClosedTickets, filteredClosedTickets
        if (!selectedGoal) {
            filteredOpenTickets = tickets.filter(ticket => ticket.status !== "done")
            sortedOpenTickets = filteredOpenTickets.sort((a, b) => a.order - b.order)
            
            filteredClosedTickets = tickets.filter(ticket => ticket.status === "done")
            sortedClosedTickets = filteredClosedTickets.sort((a, b) => a.order - b.order)
            
            setOpenTickets(sortedOpenTickets)
            setClosedTickets(sortedClosedTickets);
        } else if (selectedTickets.length > 0) {
            setOpenTickets(selectedTickets.filter(ticket => ticket.status !== "done"));
            setClosedTickets(selectedTickets.filter(ticket => ticket.status === "done"));
        } else if (selectedGoal) {
            // debugger
            const filteredTickets = tickets.filter(ticket => ticket.goalId === selectedGoal._id);
            filteredOpenTickets = filteredTickets.filter(ticket => ticket.status !== "done")
            sortedOpenTickets = filteredOpenTickets.sort((a, b) => a.order - b.order)

            filteredClosedTickets = filteredTickets.filter(ticket => ticket.status === "done")
            sortedClosedTickets = filteredClosedTickets.sort((a, b) => a.order - b.order)            
            setOpenTickets(sortedOpenTickets);
            setClosedTickets(sortedClosedTickets);
        } else {
            // debugger
            setOpenTickets(memoizedTickets.filter(ticket => ticket.status !== "done"));
            setClosedTickets(memoizedTickets.filter(ticket => ticket.status === "done"));
        }
    }, [selectedTickets, memoizedTickets, selectedGoal]);

    useEffect(() => {
        if (selectedGoal) {
            const goalTickets = tickets.filter(ticket => ticket.goalId === selectedGoal._id);
            dispatch(setSelectedTickets({ goal: selectedGoal, tickets: goalTickets }));
        }
    }, [dispatch, selectedGoal, tickets]);

    useEffect(() => {
        const trackTicketWidth = () => {
            console.log(widthRef.current.getBoundingClientRect().width)
            if (widthRef.current) {
                setTicketWidth(widthRef.current.getBoundingClientRect().width);
            }
        };

        const handleScroll = () => {
            setScrollOffset({
                x: window.scrollX || document.documentElement.scrollLeft,
                y: window.scrollY || document.documentElement.scrollTop,
            });
        };

        window.addEventListener("resize", trackTicketWidth);
        window.addEventListener("scroll", handleScroll);
        // setTimeout(() => trackTicketWidth(), 1000);
        return () => {
            window.removeEventListener("resize", trackTicketWidth);
            window.removeEventListener("scroll", handleScroll)
        };
    }, []);

    useLayoutEffect(() => {
        if (widthRef.current) {
            setTicketWidth(widthRef.current.getBoundingClientRect().width)
        }
    }, [])

    const {
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
            deleteItem(item); //Directly call the delete function
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [deleteItem]);

    const moveTicket = (fromIndex, toIndex, ticketList) => {
        let updatedOpenTickets = [...openTickets];
        let updatedClosedTickets = [...closedTickets];

        let movedTicket, targetTicket, updatedList;

        if (ticketList === "openTickets") {
            movedTicket = updatedOpenTickets[fromIndex];
            targetTicket = updatedOpenTickets[toIndex];
            updatedList = updatedOpenTickets;
        } else if (ticketList === "closedTickets") {
            movedTicket = updatedClosedTickets[fromIndex];
            targetTicket = updatedClosedTickets[toIndex];
            updatedList = updatedClosedTickets;
        }

        if (!movedTicket || !targetTicket) return;

        const targetOrder = targetTicket.order;

        // Adjust orders for all tickets correctly
        const modifiedTickets = updatedList.map(ticket => {
            if (ticket._id === movedTicket._id) {
                return { ...ticket, order: targetOrder };
            } else if (ticket.order >= targetOrder && ticket._id !== movedTicket._id) {
                return { ...ticket, order: ticket.order + 1 };
            } else if (ticket.order < targetOrder && ticket._id !== movedTicket._id) {
                return { ...ticket, order: ticket.order - 2 };
            }
            return ticket;
        });

        // Sort tickets by order after updating to ensure correct positions
        modifiedTickets.sort((a, b) => a.order - b.order);

        if (ticketList === "openTickets") {
            setOpenTickets(modifiedTickets);
        } else {
            setClosedTickets(modifiedTickets);
        }

        dispatch(updateTicketsOrder({ userId, newTickets: modifiedTickets }));
    };

    const isUserActivated = useMemo(() => {
        return (ticket) => userActivatedTickets.includes(ticket);
    }, [userActivatedTickets]);

    return (
        <div className="ticket-list-container" ref={widthRef}>
            <div className="ticket-list-title">Tickets</div>
            <div className="subtitle">All open and closed tickets</div>
            <div className="ticket-tutorial">{openTickets.length === 0 && `Type something like "Follow up with Robert" to create your first ticket`}</div>
            <div className="open-tickets-container">
                <div className="open-tickets-selector" onClick={() => dispatch(setShowTickets({ ...showTickets, openTickets: !showTickets.openTickets }))}>
                    <img src={darkMode(theme) ? chevronWhite : chevron} alt="" className="ticket-toggle" style={{ transform: `rotate(${showTickets.openTickets ? "90deg" : "0deg"})` }} />
                    Open Tickets
                </div>
                {showTickets.openTickets && openTickets.map((ticket, index) => (
                    <TicketCard
                        ticket={ticket}
                        dispatch={dispatch}
                        setIsDragging={setIsDragging}
                        setShowTrashcan={setShowTrashcan}
                        setTrashcanPosition={setTrashcanPosition}
                        userActivated={() => isUserActivated(ticket)}
                        key={ticket._id}
                        scrollOffset={scrollOffset}
                        moveTicket={moveTicket}
                        index={index}
                        ticketList="openTickets"
                        isMobile={isMobile}
                    />
                ))}
            </div>
            <div className="closed-tickets-container">
                <div className="closed-tickets-selector" onClick={() => dispatch(setShowTickets({ ...showTickets, closedTickets: !showTickets.closedTickets }))}>
                    <img src={darkMode(theme) ? chevronWhite : chevron} alt="" className="ticket-toggle" style={{ transform: `rotate(${showTickets.closedTickets ? "90deg" : "0deg"})` }} />
                    Closed Tickets
                </div>
                {showTickets.closedTickets && closedTickets.map((ticket, index) => (
                    <TicketCard
                        ticket={ticket}
                        dispatch={dispatch}
                        setIsDragging={setIsDragging}
                        setShowTrashcan={setShowTrashcan}
                        setTrashcanPosition={setTrashcanPosition}
                        userActivated={() => isUserActivated(ticket)}
                        key={ticket._id}
                        scrollOffset={scrollOffset}
                        moveTicket={moveTicket}
                        index={index}
                        ticketList="closedTickets"
                        isMobile={isMobile}
                    />
                ))}
            </div>
            {!isMobile && <div className="ticket-list-spaceholder"></div>}
            <div
                ref={drop}
                className={`trash-can ${showTrashcan ? "visible" : ""}`}
                style={{
                    position: "absolute",
                    top: `${trashcanPosition.y - 40}px`,
                    left: `${ticketWidth * 0.82}px`, // Adjust offset
                    transition: "top 0.1s, left 0.1s",
                    zIndex: 100
                }}
            >
                <Trash2 size={"50px"} color={isOver ? "red" : "black"} />
                <div>Drop to delete</div>
            </div>
        </div>
    )
}

function TicketCard({ ticket, index, setIsDragging, setShowTrashcan, setTrashcanPosition, dispatch, userActivated, scrollOffset, moveTicket, ticketList, isMobile }) {
    const [touchStartTime, setTouchStartTime] = useState(0);
    const [touchMoved, setTouchMoved] = useState(false);
    const [canDrag, setCanDrag] = useState(false); // Prevent accidental drag

    const isUserActivatedTicket = useMemo(() => userActivated(ticket), [ticket, userActivated]);

    // Memoize drag item object
    const dragItem = useMemo(() => ({
        id: ticket._id,
        ticketList,
        index,
        ticket,
        type: "ticket"
    }), [ticket._id, index]);

    // Prevent drag activation until `canDrag` is true
    const [{ isDragging }, drag] = useDrag({
        type: "ticket",
        canDrag: () => canDrag, // Only enable drag when allowed
        item: (monitor) => {
            if (!canDrag) return null; // Prevent drag if disabled
            let { x, y } = monitor.getClientOffset() || { x: 0, y: 0 };
            x = x + scrollOffset.x;
            y = y + scrollOffset.y;
            setTrashcanPosition({ x, y });
            setIsDragging(true);
            setShowTrashcan(true);
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

    const [, drop] = useDrop({
        accept: "ticket",
        drop: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveTicket(draggedItem.index, index, draggedItem.ticketList, draggedItem.ticket);
                draggedItem.index = index;
            }
        }
    });

    const handleTouchStart = (e) => {
        setTouchStartTime(Date.now());
        setTouchMoved(false);
        setCanDrag(false); // Prevent drag from starting immediately
        e.stopPropagation();

        // Enable drag **only after** 500ms
        setTimeout(() => {
            setCanDrag(true);
        }, 150);
    };

    const handleTouchMove = () => {
        setTouchMoved(true); // If user moves, mark movement
    };

    const handleTouchEnd = (e) => {
        const touchDuration = Date.now() - touchStartTime;
        console.log(touchDuration, "ms", touchMoved ? "Moved" : "Tapped");

        if (!touchMoved && touchDuration < 150) {
            // Short tap → Activate ticket selection
            e.preventDefault()
            dispatch(setUserActivatedTickets({ userActivatedTicket: ticket }));
        } else if (touchMoved && touchDuration < 150) {
            // Quick swipe → Allow scroll, prevent drag
            console.log("Quick swipe detected, ignoring drag.");
        } else if (touchMoved && touchDuration >= 150) {
            // Long press + move → Activate drag
            console.log("Long press + move, drag allowed.");
            e.preventDefault(); // Stops scrolling to ensure drag works
        }

        setCanDrag(false); // Reset drag ability after touch ends
    };

    return (
        <div
            ref={(node) => drag(drop(node))} // 🟢 Make ticket both draggable & droppable
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => isMobile ? null : dispatch(setUserActivatedTickets({ userActivatedTicket: ticket }))}
            className={`${isUserActivatedTicket ? "user-activated-ticket " : ""}ticket-card`}
            style={{
                opacity: isDragging ? 0.5 : 1,
                transform: isDragging ? "scale(1.05)" : "scale(1)",
                backgroundColor: isUserActivatedTicket ? "#3694de" : "",
                color: isUserActivatedTicket ? "white" : ""
            }}
        >
            {ticket.title}
        </div>
    );
}


export default TicketList;