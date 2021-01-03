import { UserActionType, UserPayload } from '../_actions';
import { userConstants } from '../_constants';
import { User } from '../_models';
import { UserState } from '../_models/state';

const userData = localStorage.getItem('user');
let user: User = userData ? JSON.parse(userData) : undefined;
const initialState: UserState = { loggingIn: false, loggedIn: false, user };

export function authentication(state = initialState, action: UserActionType): UserState {
  switch (action.type) {
    case userConstants.LOGIN_REQUEST:
      const reqPayload = action.payload as UserPayload;
      return {
        ...state,
        loggingIn: true,
        user: reqPayload.user
      };
    case userConstants.LOGIN_SUCCESS:
      const succPayload = action.payload as UserPayload;
      return {
        ...state,
        loggedIn: true,
        loggingIn: false,
        user: succPayload.user
      };
    case userConstants.LOGIN_FAILURE:
      const errPayload = action.payload as UserPayload;
      return {
        ...state,
        error: errPayload.error,
        loggedIn: false,
        loggingIn: false 
      };
    case userConstants.LOGOUT:
      return {
        ...state,
        user: undefined
      };
    default:
      return state
  }
}
