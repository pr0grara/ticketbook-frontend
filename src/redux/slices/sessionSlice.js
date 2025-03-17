import { createSlice } from "@reduxjs/toolkit";
import { ActivitySquareIcon } from "lucide-react";

const sessionSlice = createSlice({
    name: "session",
    initialState: {
        loggedIn: false,
        theme: "",
        isLoading: false
    },
    reducers: {
        setLoggedIn: (state, action) => { 
            return { ...state, loggedIn: true }
        },
        setLoggedOut: (state, action) => {
            return { ...state, loggedIn: false }
        },
        setTheme: (state, action) => {
            return { ...state, theme: action.payload }
        },
        setIsLoading: (state, action) => {
            return { ...state, isLoading: action.payload }
        }
    },
});

export const { setLoggedIn, setLoggedOut, setTheme, setIsLoading } = sessionSlice.actions;
export default sessionSlice.reducer;