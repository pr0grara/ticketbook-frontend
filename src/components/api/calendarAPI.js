import axios from "axios";
import { API_BASE_URL } from "../../config";

export const fetchCalendarEvents = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/calendar/events`, { withCredentials: true });
        return res.data;
    } catch (err) {
        console.error("Error fetching calendar events:", err);
        return [];
    }
};

export const createCalendarEvent = async (eventDetails) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/calendar/events`, eventDetails, { withCredentials: true });
        return res.data;
    } catch (err) {
        console.error("Error creating calendar event:", err);
        return null;
    }
};