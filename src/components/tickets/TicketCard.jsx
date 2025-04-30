import { useState, useMemo, useRef, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { setUserActivatedTickets } from "../../redux/slices/ticketsSlice";
import { getEmptyImage } from 'react-dnd-html5-backend';

function TicketCard({ ticket, index, setIsDragging, setShowTrashcan, setTrashcanPosition, dispatch, userActivated, scrollOffset, moveTicket, ticketList, isMobile, onContextMenu, closeContextMenu }) {
    // const [touchStartTimeRef.current, setTouchStartTime] = useState(0);
    const [touchMoved, setTouchMoved] = useState(false);
    const [canDrag, setCanDrag] = useState(!isMobile);
    const [contextCard, setContextCard] = useState(false);
    const [bullets, setBullets] = useState({
        "doToday": ticket.doToday,
        "doSoon": ticket.doSoon,
        "isQuickWin": ticket.isQuickWin,
        "isDeepFocus": ticket.isDeepFocus
    })
    
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

    useEffect(() => {
        // setBullets([{ doToday: ticket.doToday },
        // { doSoon: ticket.doSoon },
        // { isQuickWin: ticket.isQuickWin },
        // { isDeepFocus: ticket.isDeepFocus }
        // ])
    }, [])

    const isUserActivatedTicket = useMemo(() => userActivated(ticket), [ticket, userActivated]);

    const dragItem = useMemo(() => ({
        id: ticket._id,
        ticketList,
        index,
        ticket,
        isMobile,
        type: "ticket"
    }), [ticket._id, index, ticketList, ticket]); //added ticketList and ticket here while setting onContext() remove if buggy

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
            closeContextMenu();
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
                closeContextMenu();
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
            closeContextMenu()

        }
    });

    const handleLongPressPrevent = (e) => {
        e.preventDefault();
    };

    const touchActiveRef = useRef(false);
    let touchDurationRef = useRef(0);
    let animationFrame;
    let touchStartTimeRef = useRef(0);
    let contextTriggeredRef = useRef(false);

    const updateDuration = (e) => {
        touchDurationRef.current = Date.now() - touchStartTimeRef.current;
        console.log(touchDurationRef.current)

        if (touchDurationRef.current > 10) {
            e.target.classList.add('selected-ticket-card')
            setTimeout(() => document.querySelectorAll('.selected-ticket-card')
                .forEach(ele => ele.classList.remove('selected-ticket-card'))
            , 350)
        }  

        if (touchDurationRef.current > 300) {
            setCanDrag(true);
        }
        
        if (touchDurationRef.current > 600 && !contextTriggeredRef.current) {
            if (!touchActiveRef.current) return;
            contextTriggeredRef.current = true;
            const touch = e.touches[0]; // or e.changedTouches[0], depending on when called
            onContextMenu(
                {
                    preventDefault: () => { },
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                },
                ticket
            );

        }
        
        if (touchDurationRef.current > 1000) {
            if (animationFrame) {
                if (touchMoved) closeContextMenu()
                cancelAnimationFrame(animationFrame); //Stop loop when drag is enabled
                animationFrame = null;
            }
            return; // ✅ Prevent unnecessary frame requests
        };


        animationFrame = requestAnimationFrame(()=>updateDuration(e)); //Keep updating if < 300ms
    };

    const handleTouchStart = (e) => {
        touchStartTimeRef.current = Date.now();
        touchDurationRef.current = 0;
        touchActiveRef.current = true;
        contextTriggeredRef.current = false;
        setCanDrag(false);
        setTouchMoved(false);

        animationFrame = requestAnimationFrame(()=>updateDuration(e)); //Start tracking duration
    };

    const handleTouchMove = (e) => {
        setTouchMoved(true);
    }

    const handleTouchEnd = (e) => {
        touchActiveRef.current = false;
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null
        }

        if (!touchMoved && touchDurationRef.current < 250) {
            dispatch(setUserActivatedTickets({ userActivatedTicket: ticket }));
            document.querySelectorAll('.back-to-list').forEach(el => el.remove())
            setTimeout(()=> {
                const el = document.querySelector(`[data-ticket-id="${ticket._id}"]`);
                if (el) {
                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    })
                }
            }, 500)

        }

        setTimeout(() => {
            setCanDrag(!isMobile); // Reset drag after small delay to prevent flickering
        }, 100);
        contextTriggeredRef.current = false;
    };

    const setBulletColor = (ticket) => {
        const filterOptions = ["doToday", "doSoon", "isQuickWin", "isDeepFocus"]
        const filters = Object.keys(ticket)
            .filter(key => filterOptions.includes(key))
            .filter(key => ticket[key]);

            // debugger

        const firstMatch = filters.find(filter => {
            return filterOptions.includes(filter);
        })
        switch (firstMatch) {
            case "doToday": return "red";
            case "doSoon": return "orange";
            case "isQuickWin": return "green";
            case "isDeepFocus": return "purple";
            default: return "";
        }
    }

    const setBulletColors = (ticket) => {
        const filterOptions = {
            doToday: "red",
            doSoon: "orange",
            isQuickWin: "green",
            isDeepFocus: "purple"
        };

        const colors = Object.entries(filterOptions)
            .filter(([key]) => ticket[key])
            .map(([_, color]) => color);

        // debugger
        return colors.length ? colors : ["black"];
    };

    const BulletIndicators = (ticket) => {
        const filterToColor = {
            doToday: "red",
            doSoon: "orange",
            isQuickWin: "green",
            isDeepFocus: "magenta"
        };

        let activeColors = Object.entries(filterToColor)
            .filter(([key]) => ticket[key])
            .map(([_, color]) => color);

        if (activeColors.length === 0) activeColors = ["black"];

        const className = `bullet-wrapper bullet-count-${activeColors.length}`;

        return (
            <div className={className}>
                {activeColors.map((color, idx) => (
                    <div key={idx} className={`bullet-dot dot-${idx}`} style={{ backgroundColor: color }} />
                ))}
            </div>
        );
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
            onContextMenu={(e) => onContextMenu(e, ticket)}
            // onContextMenu={e => e.preventDefault()}
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
            {/* <div className="bullet-container">
                {setBulletColors(ticket).map((color, idx) => <span key={idx} className="bullet" style={{ color: color }}>⦿</span>)}
            </div> */}
            {/* <span style={{ color: setBulletColor(ticket) }}>⦿</span> */}
            {BulletIndicators(ticket)}
            {ticket.title}
        </div>
    );
}

export default TicketCard;