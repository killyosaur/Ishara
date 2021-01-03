import { userConstants } from "../_constants";
import { User } from "../_models";

export type UserPayload = {
    user?: User;
    error?: Error;
}

export type UsersPayload = {
    users?: User[];
    error?: Error;
}

export type IdPayload = {
    id: string;
    error?: Error;
}

export interface UserLoginSuccessActionType {
    type: typeof userConstants.LOGIN_SUCCESS;
    payload: UserPayload;
}

export interface UserLoginRequestActionType {
    type: typeof userConstants.LOGIN_REQUEST;
    payload: UserPayload
}

export interface UserLoginFailActionType {
    type: typeof userConstants.LOGIN_FAILURE;
    payload: UserPayload
}

export interface UserRegisterSuccessActionType {
    type: typeof userConstants.REGISTER_SUCCESS;
    payload: UserPayload;
}

export interface UserRegisterRequestActionType {
    type: typeof userConstants.REGISTER_REQUEST;
    payload: UserPayload
}

export interface UserRegisterFailActionType {
    type: typeof userConstants.REGISTER_FAILURE;
    payload: UserPayload
}

export interface UserGetAllSuccessActionType {
    type: typeof userConstants.GETALL_SUCCESS;
    payload: UsersPayload;
}

export interface UserGetAllRequestActionType {
    type: typeof userConstants.GETALL_REQUEST;
    payload?: UsersPayload
}

export interface UserGetAllFailActionType {
    type: typeof userConstants.GETALL_FAILURE;
    payload: UsersPayload
}

export interface UserDeleteSuccessActionType {
    type: typeof userConstants.DELETE_SUCCESS;
    payload: IdPayload;
}

export interface UserDeleteRequestActionType {
    type: typeof userConstants.DELETE_REQUEST;
    payload: IdPayload
}

export interface UserDeleteFailActionType {
    type: typeof userConstants.DELETE_FAILURE;
    payload: IdPayload
}

export interface UserLogoutActionType {
    type: typeof userConstants.LOGOUT;
    payload?: undefined;
}

export type UserActionType = UserDeleteFailActionType |
    UserDeleteRequestActionType |
    UserDeleteSuccessActionType |
    UserGetAllFailActionType |
    UserGetAllRequestActionType |
    UserGetAllSuccessActionType |
    UserLoginFailActionType |
    UserLoginRequestActionType |
    UserLoginSuccessActionType |
    UserRegisterFailActionType |
    UserRegisterRequestActionType |
    UserRegisterSuccessActionType;