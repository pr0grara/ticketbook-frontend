import { useEffect, useState } from 'react';
import Modal from './Modal'; // Import your modular modal
import authAPI from '../api/authAPI';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTickets } from '../../redux/slices/ticketsSlice';

export default function RecurrenceModal({ isOpen, onClose, ticketId }) {
    const dispatch = useDispatch();

    const [repeatInterval, setRepeatInterval] = useState('daily');
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]); // Default today
    const [endDate, setEndDate] = useState('');

    const { modalTickets } = useSelector(state => state.session);
    const { userId } = useSelector(state => state.user);

    // useEffect(() => {
    //     let modalOverlay = document.querySelector('.modal-overlay');
    //     if (modalOverlay) modalOverlay.style.top = `${modalTickets[0]?.y}px`;
    // }, [modalTickets])

    const handleSubmit = (e) => {
        e.preventDefault();
        authAPI.post('/recurrence/add-recurrence', {
            ticketId: modalTickets[0]?._id,
            repeatInterval,
            startDate,
            endDate: endDate || null
        })
            .then(res => {
                window.alert((res.data))
                dispatch(fetchTickets({ type: "BY USER", id: userId }));
            })
            .catch(err => console.log(err))
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} position={{ y: `${modalTickets[0]?.y}px` }} title={`Set Recurrence for "${modalTickets[0]?.title}"`}>
            <form onSubmit={handleSubmit} className="recurrence-form">
                <label className="recurrence-form-label">
                    Repeat Interval
                    <select value={repeatInterval} onChange={(e) => setRepeatInterval(e.target.value)}>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        {/* <option value="custom">Custom (advanced)</option> */}
                    </select>
                </label>

                <label className="recurrence-form-label">
                    Start Date
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>

                <label className="recurrence-form-label">
                    End Date (optional)
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </label>

                <button type="submit" className="recurrence-form-submit-button">
                    Save Recurrence
                </button>
            </form>
        </Modal>
    );
}