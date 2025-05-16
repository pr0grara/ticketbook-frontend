import { createSlice } from "@reduxjs/toolkit";
import { ActivitySquareIcon } from "lucide-react";
import authAPI from "../../components/api/authAPI";

const sessionSlice = createSlice({
    name: "session",
    initialState: {
        loggedIn: false,
        theme: "",
        isLoading: false,
        showTickets: {
            openTickets: true,
            closedTickets: false,
            dailyTickets: true,
            weeklyTickets: true,
            monthlyTickets: true
        },
        isMobile: false,
        allowFastLogin: true,
        watchedTutorial: false,
        showRecurrenceModal: false,
        modalTickets: [],
        ticketFilters: {
            today: false,
            soon: false,
            deepFocus: false,
            quickWin: false
        },
        showSummary: false
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
        },
        setShowTickets: (state, action) => {
            return { ...state, showTickets: action.payload }
        },
        setIsMobile: (state, action) => {
            return { ...state, isMobile: action.payload }
        },
        disableFastLogin: (state) => {
            return { ...state, allowFastLogin: false }
        },
        setWatchedTutorial: (state, action) => {
            return { ...state, watchedTutorial: action.payload }
        },
        setShowRecurrenceModal: (state, action) => {
            return { ...state, showRecurrenceModal: action.payload }
        },
        setModalTickets: (state, action) => {
            return { ...state, modalTickets: action.payload }
        },
        setTicketFilters: (state, action) => {
            return { ...state, ticketFilters: action.payload }
        },
        setShowSummary: (state, action) => {
            return { ...state, showSummary: action.payload }
        }
    },
});

export const { setLoggedIn, setLoggedOut, setTheme, setIsLoading, setShowTickets, setIsMobile, disableFastLogin, setWatchedTutorial, setShowRecurrenceModal, setModalTickets, setTicketFilters, setShowSummary } = sessionSlice.actions;
export default sessionSlice.reducer;