import { COLLECT_TICKETS } from '../actions/ticket_actions';

const _nullTickets = {
    score: null,
};

const ticketsReducer = (state = _nullTickets, action) => {
    switch (action.type) {
        case COLLECT_TICKETS:
            // debugger
            return Object.assign({}, state, {
                tickets: action.tickets
            })
        default:
            return state;
    }
};

export default ticketsReducer;