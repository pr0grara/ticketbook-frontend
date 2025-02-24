import * as APIUtil from '../util/api/user_api_util';

export const NEW_USER = "NEW_USER";

export const newUser = (user, fromSurveyBoolean) => dispatch => {
    return APIUtil.newUser(user, fromSurveyBoolean)
        .then(res => {
            dispatch()
            return res.data;
        })
        .catch(err => {
            console.log(err)
        })
};

export const login = async (data) => {
    return APIUtil.login(data)
        .then(res => {
            if (res.status === 200) {
                localStorage.setItem('session_token', res.data.session_token)
            }
            console.log(res)
        })
        .catch(err => console.log(err))
}