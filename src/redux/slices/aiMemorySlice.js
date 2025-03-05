import { createSlice } from "@reduxjs/toolkit";

const aiMemorySlice = createSlice({
    name: "aiMemory",
    initialState: {
        interactions: [],  // Stores both user input & AI responses
        externalInteractions: []
    },
    reducers: {
        logInteraction: (state, action) => {
            state.interactions.unshift(action.payload); // Add new entry
            state.interactions = state.interactions.slice(0, 10); // Keep only last 10
        },
        logFromExternal: (state, action) => {
            state.externalInteractions.unshift(action.payload);
        }
    },
});

export const { logInteraction, logFromExternal } = aiMemorySlice.actions;
export default aiMemorySlice.reducer;