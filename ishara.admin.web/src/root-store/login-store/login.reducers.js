import { LoginActionTypes } from "./login.actions";

export default (state = { user: null }, action = {}) => {
    switch (action.type) {
        case LoginActionTypes.LoginAction:
            return {
                ...state,
                user: {
                    ...action.data.user
                }
            };
        default:
            return state;
    }
};