import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authAPI from "../../components/api/authAPI";

export const fetchSummaries = createAsyncThunk("behaviors/fetchSummaries", async (userId) => {
    const response = await authAPI.get(`/behaviors/fetch-for-user/${userId}`);
    const payload = {
        today: response.data.dailySummary.summary,
        viewedSummary: response.data.viewedSummary
    }
    // debugger
    return payload
})

const dailySummary = createSlice({
    name: "canvas",
    initialState: {
        today: {},
        week: [],
        viewedSummary: true
    },
    reducers: {
        setToday: (state, action) => ({...state, today: action.payload}),
        setWeek: (state, action) => ({...state, week: action.payload}),
        setViewedSummary: (state, action) => ({...state, viewedSummary: action.payload})
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSummaries.pending, (state) => { state.status = "loading"; })
            .addCase(fetchSummaries.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.today = action.payload.today;
                state.viewedSummary = action.payload.viewedSummary
            })
            .addCase(fetchSummaries.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export const { setToday, setWeek, setViewedSummary } = dailySummary.actions;
export default dailySummary.reducer;