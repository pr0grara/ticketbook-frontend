import * as APIUtil from '../util/api/session_api_util';

export const RECEIVE_CURRENT_USER = "RECEIVE_CURRENT_USER";
export const RECEIVE_SESSION_ERRORS = "RECEIVE_SESSION_ERRORS";
export const RECEIVE_USER_LOGOUT = "RECEIVE_USER_LOGOUT";
export const RECEIVE_USER_SIGN_IN = "RECEIVE_USER_SIGN_IN";
export const RECEIVING_USER_LOGIN = "RECEIVING_USER_LOGIN";

// We'll dispatch this when our user signs in
export const receiveCurrentUser = currentUser => ({
    type: RECEIVE_CURRENT_USER,
    currentUser
});

// This will be used to redirect the user to the login page upon signup
export const receiveUserSignIn = () => ({
    type: RECEIVE_USER_SIGN_IN
});

// We dispatch this one to show authentication errors on the frontend
export const receiveErrors = errors => ({
    type: RECEIVE_SESSION_ERRORS,
    errors
});

// When our user is logged out, we will dispatch this action to set isAuthenticated to false
export const logoutUser = () => ({
    type: RECEIVE_USER_LOGOUT
});

export const loggingIn = (boolean) => ({
    type: RECEIVING_USER_LOGIN,
    boolean
})

// Upon signup, dispatch the approporiate action depending on which type of response we receieve from the backend
export const signup = user => dispatch => (
    APIUtil.signup(user)
        .then(() => dispatch(receiveUserSignIn()))
        .catch(err => dispatch(receiveErrors(err.response.data)))
)


// Upon login, set the session token and dispatch the current user. Dispatch errors on failure.
export const login = user => dispatch => (
    APIUtil.login(user)
        .then(res => {
            console.log(user)
            const token = res.data.user.session_token;
            localStorage.setItem('authentication', JSON.stringify({
                authToken: token,
                email: user.email || false,
                phone: user.phone || false,
            }));
            APIUtil.setAuthToken(token);
            dispatch(receiveCurrentUser(res.data.user))
            return true
        })
        .catch(err => {
            console.log(err);
            return false
        })
)

export const authenticate = authData => dispatch => {
    APIUtil.authenticate(authData)
        .then(res => {
            const token = res.data.user.session_token;
            let newAuth = JSON.parse(localStorage.authentication);
            newAuth["authToken"] = token;
            localStorage.setItem('authentication', JSON.stringify(newAuth))
            APIUtil.setAuthToken(token);
            dispatch(receiveCurrentUser(res.data.user))
            return true
        })
        .catch(err => {
            console.log(err);
            return false
        })
}

export const userCheck = email => {
    return APIUtil.userCheck(email)
        .then(res => res.data)
        .catch(err => console.log(err))
}

export const logout = () => dispatch => {
    localStorage.removeItem('authentication')
    APIUtil.setAuthToken(false)
    dispatch(logoutUser())
};