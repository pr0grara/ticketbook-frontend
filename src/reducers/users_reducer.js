import { } from '../actions/user_actions';

const _nullUser = {
    score: null,
};

const usersReducer = (state = _nullUser, action) => {
    switch (action.type) {
        case "":
            // debugger
            return Object.assign({}, state, {
                score: action.user
            })
        default:
            return state;
    }
};

export default usersReducer;
