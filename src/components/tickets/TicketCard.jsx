import { useState, useMemo, useRef, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { setUserActivatedTickets } from "../../redux/slices/ticketsSlice";
import { getEmptyImage } from 'react-dnd-html5-backend';

function TicketCard({ ticket, index, setIsDragging, setShowTrashcan, setTrashcanPosition, dispatch, userActivated, scrollOffset, moveTicket, ticketList, isMobile }) {
    // const [touchStartTime, setTouchStartTime] = useState(0);
    const [touchMoved, setTouchMoved] = useState(false);
    const [canDrag, setCanDrag] = useState(!isMobile);
    
    // useEffect(() => {
    //     const handleTouchStart = (e) => {
    //         // debugger
    //         setTouchStartTime(Date.now());
    //         setTouchMoved(false);
    //     };

    //     document.addEventListener("touchstart", handleTouchStart);

    //     return () => {
    //         document.removeEventListener("touchstart", handleTouchStart);
    //     };
    // }, []);

    const isUserActivatedTicket = useMemo(() => userActivated(ticket), [ticket, userActivated]);

    const dragItem = useMemo(() => ({
        id: ticket._id,
        ticketList,
        index,
        ticket,
        isMobile,
        type: "ticket"
    }), [ticket._id, index]);

    const [{ isDragging }, drag, preview] = useDrag({
        type: "ticket",
        canDrag: () => canDrag, // ✅ Dynamically allows drag
        item: (monitor) => {
            if (!canDrag) return null; // Prevent drag if not allowed
            let { x, y } = monitor.getClientOffset() || { x: 0, y: 0 };
            x = x + scrollOffset.x;
            y = y + scrollOffset.y;
            setTrashcanPosition({ x, y });
            setIsDragging(true);
            setShowTrashcan(true);
            console.log(isDragging)
            return dragItem;
        },
        collect: (monitor) => {
            return { isDragging: !!monitor.isDragging()}
        },
        end: () => {
            setTimeout(() => {
                setIsDragging(false);
                setShowTrashcan(false);
            }, 50);
        }
    });

    useEffect(() => {
        if (isMobile && preview) {
            preview(getEmptyImage(), { captureDraggingState: true }); // Hides the default drag image
        }
    }, [preview, isMobile]);

    const [, drop] = useDrop({
        accept: "ticket",
        drop: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveTicket(draggedItem.index, index, draggedItem.ticketList, draggedItem.ticket);
                draggedItem.index = index;
            }
        }
    });

    const handleLongPressPrevent = (e) => {
        e.preventDefault();
    };

    let touchDuration = 0;
    let animationFrame;
    let touchStartTime = 0;

    const updateDuration = (e) => {
        touchDuration = Date.now() - touchStartTime;

        if (touchDuration > 300) {
            setCanDrag(true);

            if (animationFrame) {
                cancelAnimationFrame(animationFrame); //Stop loop when drag is enabled
                animationFrame = null;
            }
            return; // ✅ Prevent unnecessary frame requests
        }

        animationFrame = requestAnimationFrame(()=>updateDuration(e)); //Keep updating if < 300ms
    };

    const handleTouchStart = (e) => {
        touchStartTime = Date.now();
        touchDuration = 0;
        setCanDrag(false);
        setTouchMoved(false);

        animationFrame = requestAnimationFrame(()=>updateDuration(e)); //Start tracking duration
    };

    const handleTouchMove = (e) => {
        setTouchMoved(true);
    }

    const handleTouchEnd = (e) => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null
        }

        if (!touchMoved && touchDuration < 500) {
            dispatch(setUserActivatedTickets({ userActivatedTicket: ticket }));
        } 

        setTimeout(() => {
            setCanDrag(!isMobile); // Reset drag after small delay to prevent flickering
        }, 100);
    };

    return (
        <div
            ref={(node) => drag(drop(node))}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => isMobile ? null : dispatch(setUserActivatedTickets({ userActivatedTicket: ticket }))}
            onMouseLeave={() => console.log("left")}
            className={`${isUserActivatedTicket ? "user-activated-ticket " : ""}ticket-card`}
            style={{
                opacity: isDragging ? 0.15 : 1,
                transform: isDragging ? "scale(1.05)" : "scale(1)",
                backgroundColor: isUserActivatedTicket ? "#3694de" : "",
                color: isUserActivatedTicket ? "white" : "",
                overflow: "auto", //Forces scrolling if something is blocking it
                WebkitOverflowScrolling: "touch", //Ensures smooth scrolling on iOS
                touchAction: "auto",
            }}
        >
            {ticket.title}
        </div>
    );
}

export default TicketCard;