import axios from 'axios';

export const collectTickets = user => {
    axios.get(`/api/tickets/foruser`, user)
}