import axios from 'axios';

export const setAuthToken = token => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = token;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

export const signup = (userData) => {
    return axios.post('/api/users/register', userData);
};

export const login = (userData) => {
    return axios.post('/api/pg/user/login', userData);
};

export const userCheck = async email => {
    return axios.get(`/api/pg/user/check/${email}`)
}

export const authenticate = (authData) => {
    return axios.post('/api/pg/user/authenticate', authData)
}