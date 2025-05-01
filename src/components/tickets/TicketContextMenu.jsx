import React, { useEffect, useRef, useState, forwardRef } from 'react';
import {
    CheckCircle,
    Trash2,
    LifeBuoy,
    Target,
    Calendar,
    Zap,
    Brain,
    RefreshCw
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTicket } from '../../redux/slices/ticketsSlice';
import useAPI from '../hooks/useAPI';
import { setIsLoading, setShowRecurrenceModal, setModalTickets } from '../../redux/slices/sessionSlice';
import authAPI from '../api/authAPI';

const TicketContextMenu = forwardRef(({ visible, x, y, ticket, onClose }, externalRef) => {
    const dispatch = useDispatch();
    const { deleteItem, handleHelp } = useAPI();
    const menuRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const { isMobile } = useSelector(state => state.session);
    const [shouldRender, setShouldRender] = useState(false);
    const [animatingOut, setAnimatingOut] = useState(false);

    const { modalTickets, showReccurenceModal } = useSelector(state => state.session);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            setAnimatingOut(false);
        } else if (shouldRender) {
            setAnimatingOut(true);
            const timeout = setTimeout(() => {
                setShouldRender(false);
                setAnimatingOut(false);
            }, 200);
            return () => clearTimeout(timeout);
        }
    }, [visible]);

    useEffect(() => {
        if (externalRef) externalRef.current = menuRef.current;
    }, [visible]);

    useEffect(() => {
        if (visible && ticket) {
            const adjustPosition = () => {
                const menu = menuRef.current;
                if (!menu) return;
                const { innerWidth, innerHeight } = window;
                const rect = menu.getBoundingClientRect();
                let newX = x;
                let newY = y;
                if (x + rect.width > innerWidth) newX = innerWidth - rect.width - 10;
                if (y + rect.height > innerHeight) newY = innerHeight - rect.height - 20;
                setPosition({ x: newX, y: newY });
            };
            setTimeout(adjustPosition, 0);
        }
    }, [x, y, visible, ticket]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (visible) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [visible, onClose]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (visible) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [visible, onClose]);

    if (!shouldRender || !ticket) return null;

    const actions = [
        { action: "mark-done", label: ticket.status === "pending" ? 'Mark As Done' : 'Mark Incomplete', icon: CheckCircle },
        { action: "delete", label: 'Delete', icon: Trash2 },
        { action: "get-help", label: 'Get Help', icon: LifeBuoy },
        { action: "do-today", label: `${ticket.doToday ? "Unmark" : "Mark"} for Today`, icon: Calendar },
        { action: "set-focus", label: `${ticket.doSoon ? "Unmark" : "Mark"} as Focus`, icon: Target },
        { action: "quick-win", label: `${ticket.isQuickWin ? "Unmark" : "Mark"} as a quick win`, icon: Zap },
        { action: "deep-focus", label: `${ticket.isDeepFocus ? "Unmark" : "Mark"} as time consuming`, icon: Brain },
        { action: "recurrance", label: `${ticket.isRecurring ? 'Remove Recurrence' : 'Reccurence Settings'}`, icon: RefreshCw }
    ];

    const handleAction = (id, ticket) => {
        let newTicket;
        switch (id) {
            case "mark-done":
                dispatch(updateTicket({ ticketId: ticket._id, ticket: { ...ticket, status: ticket.status === "pending" ? "done" : "pending"} }))
                break
            case "delete":
                deleteItem({ type: "ticket", id: ticket._id })
                break
            case "get-help":
                handleHelp(ticket)
                dispatch(setIsLoading(true))
                break
            case "do-today":
                newTicket = { ...ticket, doToday: !ticket.doToday };
                dispatch(updateTicket({ ticketId: ticket._id, ticket: newTicket }))
                break
            case "set-focus":
                newTicket = { ...ticket, doSoon: !ticket.doSoon };
                dispatch(updateTicket({ ticketId: ticket._id, ticket: newTicket }))
                break
            case "quick-win":
                newTicket = { ...ticket, isQuickWin: !ticket.isQuickWin };
                dispatch(updateTicket({ ticketId: ticket._id, ticket: newTicket }))
                break
            case "deep-focus":
                newTicket = { ...ticket, isDeepFocus: !ticket.isDeepFocus };
                dispatch(updateTicket({ ticketId: ticket._id, ticket: newTicket }))
                break
            case "recurrance":
                // let newModalTickets = JSON.parse(JSON.stringify(modalTickets));
                // newModalTickets.push(ticket)
                // dispatch(setModalTickets(newModalTickets));
                if (ticket.isRecurring) {
                    authAPI.delete('/recurrence/delete-recurrence', {data: { ticketId: ticket._id }})
                        .then(res => window.alert(res.data))
                        .catch(err => console.log(err))
                } else {
                    dispatch(setShowRecurrenceModal(!showReccurenceModal));
                    dispatch(setModalTickets([{...ticket, y: window.scrollY}]));
                }
                break
            default:
                break
        }
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className={`ticket-context-container ${animatingOut ? 'fade-out' : 'fade-in'}`}
            style={{
                top: position.y,
                left: position.x
            }}
        >
            {actions.map(({ action, label, icon: Icon }, index) => (
                <div
                    key={index}
                    className="ticket-context-action"
                    onClick={() => handleAction(action, ticket)}
                >
                    <Icon size={16} />
                    {label}
                </div>
            ))}
        </div>
    );
});

export default TicketContextMenu;