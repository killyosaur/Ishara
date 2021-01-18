import { userConstants } from '../_constants';
import { userService } from '../_services';
import { alertActions } from './';
import { history } from '../_helpers';
import {User} from '../_models';
import { UserDeleteFailActionType, UserDeleteRequestActionType, UserDeleteSuccessActionType, UserGetAllFailActionType, UserGetAllRequestActionType, UserGetAllSuccessActionType, UserLoginFailActionType, UserLoginRequestActionType, UserLoginSuccessActionType, UserRegisterFailActionType, UserRegisterRequestActionType, UserRegisterSuccessActionType } from './user.action.types';

export const userActions = {
    login,
    logout,
    register,
    getAll,
    delete: _delete
};

function login(username: string, password: string) {
    return (dispatch: Function) => {
        dispatch(request({ username }));

        userService.login(username, password)
            .then(
                user => {
                    dispatch(success(user));
                    history.push('/');
                },
                (error: Error) => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error.message));
                }
            );
    };

    function request(user: User): UserLoginRequestActionType { return { type: userConstants.LOGIN_REQUEST, payload: {user} } }
    function success(user: User): UserLoginSuccessActionType { return { type: userConstants.LOGIN_SUCCESS, payload: {user} } }
    function failure(error: Error): UserLoginFailActionType { return { type: userConstants.LOGIN_FAILURE, payload: {error} } }
}

function logout() {
    userService.logout();
    return { type: userConstants.LOGOUT };
}

function register(userId: string, user: any) {
    return (dispatch: Function) => {
        dispatch(request(user));

        userService.register(userId, user)
            .then(
                user => {
                    dispatch(success(user));
                    history.push('/user');
                    dispatch(alertActions.success('Registration successful'));
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
        };

        function request(user: User): UserRegisterRequestActionType { return { type: userConstants.REGISTER_REQUEST, payload: {user} } }
        function success(user: User): UserRegisterSuccessActionType { return { type: userConstants.REGISTER_SUCCESS, payload: {user} } }
        function failure(error: Error): UserRegisterFailActionType { return { type: userConstants.REGISTER_FAILURE, payload: {error} } }
    }

    function getAll(userId: string) {
        return (dispatch: Function) => {
            dispatch(request());

            userService.getAll(userId)
                .then(
                    users => dispatch(success(users)),
                    error => dispatch(failure(error.toString()))
                );
        };

        function request(): UserGetAllRequestActionType { return { type: userConstants.GETALL_REQUEST } }
        function success(users: User[]): UserGetAllSuccessActionType { return { type: userConstants.GETALL_SUCCESS, payload: {users} } }
        function failure(error: Error): UserGetAllFailActionType { return { type: userConstants.GETALL_FAILURE, payload: {error} } }
    }

    // prefixed function name with underscore because delete is a reserved word in javascript
    function _delete(userId: string, id: string) {
        return (dispatch: Function) => {
            dispatch(request(id));

            userService.delete(userId, id)
                .then(
                    () => dispatch(success(id)),
                    error => dispatch(failure(id, error.toString()))
                );
        };

        function request(id: string): UserDeleteRequestActionType { return { type: userConstants.DELETE_REQUEST, payload: {id} } }
        function success(id: string): UserDeleteSuccessActionType { return { type: userConstants.DELETE_SUCCESS, payload: {id} } }
        function failure(id: string, error: Error): UserDeleteFailActionType { return { type: userConstants.DELETE_FAILURE, payload: {id, error} } }
    }