import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";

export const fetchTickets = createAsyncThunk("tickets/fetchTickets", async (req) => {
    const { type, id } = req;
    let url = `${API_BASE_URL}/tickets/`;
    switch (type) {
        case "BY USER":
            url = `${API_BASE_URL}/tickets/byUser/${id}`
            break
        case "BY GOAL":
            url = `${API_BASE_URL}/tickets/byGoal/${id}`
            break
        default:
            console.log("Unknown ticket fetch type in ticketSlice.js")
    }
    const response = await axios.get(url);
    return response.data;
});

export const updateTicketStatus = createAsyncThunk(
    "tickets/updateTicketStatus",
    async ({ ticketId, newStatus }) => {
        await axios.patch(`${API_BASE_URL}/tickets/${ticketId}/updateStatus`, { status: newStatus });
        return { ticketId, newStatus };  // Return data for Redux update
    }
);

export const updateTicket = createAsyncThunk(
    "tickets/updateTicket",
    async ({ ticketId, ticketToUpdate }) => {
        const response = await axios.patch(`${API_BASE_URL}/tickets/${ticketId}/update`, { ticket: ticketToUpdate });
        return response.data;  // Return data for Redux update
    }
);

export const updateTicketPriority = createAsyncThunk(
    "tickets/updateTicketPriority",
    async ({ ticketId, newPriority }) => {
        await axios.patch(`${API_BASE_URL}/tickets/${ticketId}/updatePriority`, { priority: newPriority });
        return { ticketId, newPriority };  // Return data for Redux update
    }
);

const ticketsSlice = createSlice({
    name: "tickets",
    initialState: {
        tickets: [],
        selectedTickets: [],
        status: "idle",
        error: null,
    },
    reducers: {
        addTicket: (state, action) => { state.tickets.push(action.payload); },
        removeTicket: (state, action) => { state.tickets = state.tickets.filter(ticket => ticket._id !== action.payload) },
        setSelectedTickets: (state, action) => {
            const { event, goal } = action.payload;
            let selectedTickets = []
            if (event) {
                selectedTickets = [...state.tickets.filter(t => t._id === event._id)];
            } else if (goal) {
                selectedTickets = [...state.tickets.filter(t => t.goalId === goal._id)]
            }
            state.selectedTickets = selectedTickets;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTickets.pending, (state) => { state.status = "loading"; })
            .addCase(fetchTickets.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.tickets = action.payload;
                if (state.selectedTickets.length > 0) {
                    state.selectedTickets = state.tickets.filter(ticket => ticket.goalId === state.selectedTickets[0]?.goalId);
                }
            })
            .addCase(fetchTickets.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(updateTicketStatus.fulfilled, (state, action) => {
                const { ticketId, newStatus } = action.payload;

                // Find the ticket and update its status
                const ticket = state.tickets.find(ticket => ticket._id === ticketId);
                if (ticket) {
                    ticket.status = newStatus; // ✅ Directly mutate using Immer
                }

                // If selectedTickets needs to be updated, update it as well
                state.selectedTickets = state.selectedTickets.map(ticket =>
                    ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
                );
            })
            .addCase(updateTicketPriority.fulfilled, (state, action) => {
                const { ticketId, newPriority } = action.payload;
                state.tickets = state.tickets.map(ticket =>
                    ticket._id === ticketId ? { ...ticket, priority: newPriority } : ticket
                );
            })
            .addCase(updateTicket.fulfilled, (state, action) => {
                const updatedTicket = action.payload;
                console.log("🟢 Before Update:", JSON.parse(JSON.stringify(state.tickets)));

                const index = state.tickets.findIndex(ticket => ticket._id === updatedTicket._id);

                if (index !== -1) {
                    state.tickets[index] = updatedTicket; // ✅ Replace existing ticket correctly
                } else {
                    console.warn("⚠️ Ticket not found in state, adding it instead.");
                    state.tickets.push(updatedTicket); // ✅ If ticket is missing, add it to state
                }
                console.log("🔵 After Update:", JSON.parse(JSON.stringify(state.tickets)));
            });
    },
});

export const { addTicket, removeTicket, setSelectedTickets } = ticketsSlice.actions;
export default ticketsSlice.reducer;