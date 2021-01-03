// @ts-check
import { UserActionType } from '../_actions';
import { userConstants } from '../_constants';
import { RegisterUserState } from '../_models/state';

export function registration(state = {registering: false}, action: UserActionType): RegisterUserState {
  switch (action.type) {
    case userConstants.REGISTER_REQUEST:
      return { registering: true };
    case userConstants.REGISTER_SUCCESS:
      return {registering: false};
    case userConstants.REGISTER_FAILURE:
      return {registering: false, error: action.payload?.error};
    default:
      return state
  }
}
