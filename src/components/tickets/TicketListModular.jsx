import { useState, useMemo, useRef, useLayoutEffect, useEffect } from "react";
import { useDrop } from "react-dnd";
import TicketCard from "./TicketCard";
import DragPreview from "../DragPreview";
import TicketContextMenu from "./TicketContextMenu";
import RecurrenceModal from "../Modal/RecurrenceModal";
import { setShowRecurrenceModal } from "../../redux/slices/sessionSlice";
import { useDispatch, useSelector } from "react-redux";

export default function TicketListModular({ TICKETS = [], groupBy = null, filterOptions = {} }) {
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, ticket: null });
    const [ticketWidth, setTicketWidth] = useState(0);
    const widthRef = useRef(null);

    const { showRecurrenceModal } = useSelector(state => state.session)

    const dispatch = useDispatch();

    useLayoutEffect(() => {
        if (widthRef.current) {
            setTicketWidth(widthRef.current.getBoundingClientRect().width);
        }
    }, []);

    const filteredTickets = useMemo(() => {
        let filtered = [...TICKETS];
        if (filterOptions.todayOnly) {
            filtered = filtered.filter(ticket => ticket.doToday);
        }
        return filtered;
    }, [TICKETS, filterOptions]);

    const groupedTickets = useMemo(() => {
        if (!groupBy) {
            return { all: filteredTickets };
        }
        return filteredTickets.reduce((groups, ticket) => {
            const key = ticket[groupBy] || "Uncategorized";
            if (!groups[key]) groups[key] = [];
            groups[key].push(ticket);
            return groups;
        }, {});
    }, [filteredTickets, groupBy]);

    const handleContextMenu = (event, ticket) => {
        event.preventDefault();
        setContextMenu({
            visible: true,
            x: event.clientX || event.pageX,
            y: event.clientY || event.pageY,
            ticket,
        });
    };

    const closeContextMenu = () => setContextMenu((prev) => ({ ...prev, visible: false }));

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "ticket",
        drop: (item) => { },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div className="ticket-list-container" ref={widthRef}>
            <TicketContextMenu
                visible={contextMenu.visible}
                x={contextMenu.x}
                y={contextMenu.y}
                ticket={contextMenu.ticket}
                onClose={closeContextMenu}
            />
            <DragPreview />

            {Object.keys(groupedTickets).map((group) => (
                <div key={group} className="ticket-group">
                    {groupBy && (
                        <div className="ticket-toggle" style={{ fontWeight: "bold", marginTop: "1rem" }}>
                            {group.charAt(0).toUpperCase() + group.slice(1)}
                        </div>
                    )}
                    {groupedTickets[group].map((ticket, index) => (
                        <TicketCard
                            key={ticket._id}
                            ticket={ticket}
                            index={index}
                            userActivated={() => false} // Override if needed
                            setIsDragging={() => { }}
                            setShowTrashcan={() => { }}
                            setTrashcanPosition={() => { }}
                            dispatch={() => { }}
                            scrollOffset={{ x: 0, y: 0 }}
                            moveTicket={() => { }}
                            ticketList="openTickets"
                            isMobile={false}
                            onContextMenu={handleContextMenu}
                            closeContextMenu={closeContextMenu}
                        />
                    ))}
                </div>
            ))}
            <RecurrenceModal
                isOpen={showRecurrenceModal}
                onClose={() => dispatch(setShowRecurrenceModal(false))}
            />
        </div>
    );
}