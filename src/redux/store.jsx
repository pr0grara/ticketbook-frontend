// import { createStore, applyMiddleware } from 'redux';
// import thunk from 'redux-thunk';
// import logger from 'redux-logger';
// import rootReducer from '../../reducers/root_reducer'

// const configureStore = (preloadedState = {}) =>
//     createStore(
//         rootReducer,
//         preloadedState,
//         applyMiddleware(thunk, logger)
//     );

// export default configureStore;

import { configureStore } from "@reduxjs/toolkit";
import goalsReducer from "./slices/goalsSlice";
import ticketsReducer from "./slices/ticketsSlice";
import userReducer from "./slices/userSlice";
import aiReducer from "./slices/aiMemorySlice";

const store = configureStore({
    reducer: {
        goals: goalsReducer,
        tickets: ticketsReducer,
        user_id: userReducer,
        ai: aiReducer
    },
});

export default store;