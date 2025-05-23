import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import authAPI from "../../components/api/authAPI";

export const fetchGoals = createAsyncThunk("goals/fetchGoals", async (userId) => {
    const response = await authAPI.post("/goals/foruser", { userId });
    return response.data;
});

const goalsSlice = createSlice({
    name: "goals",
    initialState: {
        goals: [],
        selectedGoal: null,
        status: "idle", // "idle" | "loading" | "succeeded" | "failed"
        error: null,
    },
    reducers: {
        addGoal: (state, action) => { state.goals.push(action.payload); },
        removeGoal: (state, action) => { state.goals = state.goals.filter(goal => goal._id !== action.payload); },
        setSelectedGoal: (state, action) => {
            state.selectedGoal = state.selectedGoal?._id === action.payload._id ? null : action.payload 
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGoals.pending, (state) => { state.status = "loading"; })
            .addCase(fetchGoals.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.goals = action.payload;
            })
            .addCase(fetchGoals.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export const { addGoal, removeGoal, setSelectedGoal } = goalsSlice.actions;
export default goalsSlice.reducer;
