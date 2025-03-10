import { configureStore } from "@reduxjs/toolkit";
import goalsReducer from "./slices/goalsSlice";
import ticketsReducer from "./slices/ticketsSlice";
import userReducer from "./slices/userSlice";
import aiReducer from "./slices/aiMemorySlice";
import sessionReducer from "./slices/sessionSlice";

const store = configureStore({
    reducer: {
        goals: goalsReducer,
        tickets: ticketsReducer,
        userId: userReducer,
        session: sessionReducer,
        ai: aiReducer
    },
    // middleware: (getDefaultMiddleWare) =>
    //     getDefaultMiddleWare({
    //         serializableCheck: false,
    //         immutableCheck: false,
    //     })
});

export default store;