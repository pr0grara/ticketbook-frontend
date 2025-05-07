import { createSlice } from "@reduxjs/toolkit";

const canvasSlice = createSlice({
    name: "canvas",
    initialState: {
        popup: false,
        popupTicketId: ""
    },
    reducers: {
        setPopup: (state, action) => ({...state, popup: action.payload}),
        setPopupTicketId: (state, action) => ({...state, popupTicketId: action.payload}),
    },
});

export const { setPopup, setPopupTicketId } = canvasSlice.actions;
export default canvasSlice.reducer;