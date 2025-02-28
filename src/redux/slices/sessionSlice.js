import { createSlice } from "@reduxjs/toolkit";

const sessionSlice = createSlice({
    name: "session",
    initialState: {
        loggedIn: false
    },
    reducers: {
        setLoggedIn: (state, action) => { 
            return { ...state, loggedIn: true }
        },
        setLoggedOut: (state, action) => {
            return { ...state, loggedIn: false }
        }
    },
});

export const { setLoggedIn, setLoggedOut } = sessionSlice.actions;
export default sessionSlice.reducer;