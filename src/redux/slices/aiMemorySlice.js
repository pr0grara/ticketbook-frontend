import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const aiMemorySlice = createSlice({
    name: "aiMemory",
    initialState: {
        interactions: [],  // Stores both user input & AI responses
    },
    reducers: {
        logInteraction: (state, action) => {
            state.interactions.unshift(action.payload); // Add new entry
            state.interactions = state.interactions.slice(0, 10); // Keep only last 10
        },
    },
});

export const { logInteraction } = aiMemorySlice.actions;
export default aiMemorySlice.reducer;