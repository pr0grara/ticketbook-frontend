import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authAPI from "../../components/api/authAPI";

export const fetchSummaries = createAsyncThunk("behaviors/fetchSummaries", async (userId) => {
    const response = await authAPI.get(`/behaviors/fetch-for-user/${userId}`);
    return response.data?.dailySummary.summary
})

const dailySummary = createSlice({
    name: "canvas",
    initialState: {
        today: {},
        week: []
    },
    reducers: {
        setToday: (state, action) => ({...state, today: action.payload}),
        setWeek: (state, action) => ({...state, week: action.payload}),
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSummaries.pending, (state) => { state.status = "loading"; })
            .addCase(fetchSummaries.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.today = action.payload;
            })
            .addCase(fetchSummaries.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export const { setToday, setWeek } = dailySummary.actions;
export default dailySummary.reducer;