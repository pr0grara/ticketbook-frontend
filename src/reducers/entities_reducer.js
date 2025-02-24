import { combineReducers } from 'redux';
import ticketsReducer from './tickets_reducer';
import usersReducer from './users_reducer';

const entitiesReducer = combineReducers({
    tickets: ticketsReducer,
    user: usersReducer,
})

export default entitiesReducer