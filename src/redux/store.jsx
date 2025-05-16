import { configureStore } from "@reduxjs/toolkit";
import goalsReducer from "./slices/goalsSlice";
import ticketsReducer from "./slices/ticketsSlice";
import userReducer from "./slices/userSlice";
import aiReducer from "./slices/aiMemorySlice";
import sessionReducer from "./slices/sessionSlice";
import canvasReducer from "./slices/canvasSlice";
import dailySummaryReducer from "./slices/dailySummarySlice";

const store = configureStore({
    reducer: {
        goals: goalsReducer,
        tickets: ticketsReducer,
        user: userReducer,
        session: sessionReducer,
        ai: aiReducer,
        canvas: canvasReducer,
        dailySummary: dailySummaryReducer
    },
    // middleware: (getDefaultMiddleWare) =>
    //     getDefaultMiddleWare({
    //         serializableCheck: false,
    //         immutableCheck: false,
    //     })
});

export default store;