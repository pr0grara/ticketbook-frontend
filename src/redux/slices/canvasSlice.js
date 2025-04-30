import { createSlice } from "@reduxjs/toolkit";

const canvasSlice = createSlice({
    name: "canvas",
    initialState: {
        popup: false
    },
    reducers: {
        setPopup: (state, action) => ({...state, popup: action.payload}),
    },
});

export const { setPopup } = canvasSlice.actions;
export default canvasSlice.reducer;