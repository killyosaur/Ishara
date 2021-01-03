// @ts-check
import { IdPayload, UserActionType, UsersPayload } from '../_actions';
import { userConstants } from '../_constants';
import { User } from '../_models';
import { UsersState } from '../_models/state';

const initialState: UsersState = {loading: true, users: []};

export function users(state = initialState, action: UserActionType): UsersState {
  switch (action.type) {
    case userConstants.GETALL_REQUEST:
      return {
        ...state,
        loading: true
      };
    case userConstants.GETALL_SUCCESS:
      const succGetPayload = action.payload as UsersPayload;
      return succGetPayload.users ? {
        ...state,
        users: succGetPayload.users.map<{user: User, deleting: boolean}>(u => {
          return {user: u, deleting: false};
        })
      } : state;
    case userConstants.GETALL_FAILURE:
      const errGetPayload = action.payload as UsersPayload;
      return { 
        ...state,
        error: errGetPayload.error
      };
    case userConstants.DELETE_REQUEST:
      // add 'deleting:true' property to user being deleted
      const delReqPayload = action.payload as IdPayload;
      return {
        ...state,
        users: state.users.map(o =>
          o.user.id === delReqPayload.id
            ? { user: {...o.user}, deleting: true }
            : o
        )
      };
    case userConstants.DELETE_SUCCESS:
      // remove deleted user from state
      const delSuccPayload = action.payload as IdPayload;
      return {
        ...state,
        users: state.users.filter(o => o.user.id !== delSuccPayload.id)
      };
    case userConstants.DELETE_FAILURE:
      // remove 'deleting:true' property and add 'deleteError:[error]' property to user 
      const delFailPayload = action.payload as IdPayload;
      return {
        ...state,
        users: state.users.map<{user: User, deleting: boolean, deleteError?: Error}>(o => {
          if (o.user.id === delFailPayload.id) {
            // return copy of user with 'deleteError:[error]' property
            return { ...o, deleteError: delFailPayload.error };
          }

          return o;
        })
      };
    default:
      return state
  }
}
