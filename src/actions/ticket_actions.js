import * as APIUtil from '../util/api/ticket_api_util';

export const COLLECT_TICKETS = "COLLECT_TICKETS";

export const collectTicketsAction = tickets => ({
    type: COLLECT_TICKETS,
    tickets
})

export const collectTickets = user => dispatch => {
    return APIUtil.collectTickets(user)
        .then(res => {
            dispatch(collectTicketsAction(res.data))
            return res.data;
        })
        .catch(err => {
            console.log(err)
        })
};