// @ts-check
import { userConstants } from '../_constants';
import { userService } from '../_services';
import { alertActions } from './';
import { history } from '../_helpers';

export const userActions = {
    login,
    logout,
    register,
    getAll,
    delete: _delete
};

/**
 * @param {string} username
 * @param {string} password
 */
function login(username, password) {
    return /** @param {Function} dispatch */ dispatch => {
        dispatch(request({ username }));

        userService.login(username, password)
            .then(
                /** @param {any} user */
                user => {
                    dispatch(success(user));
                    history.push('/');
                },
                /** @param {Error} error */
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };

    /** @param {any} user */
    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    /** @param {any} user */
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    /** @param {string} error */
    function failure(error) { return { type: userConstants.LOGIN_REQUEST, error } }
}

function logout() {
    userService.logout();
    return { type: userConstants.LOGOUT };
}

/** @param {any} user */
function register(user) {
    return /** @param {Function} dispatch */ dispatch => {
        dispatch(request(user));

        userService.register(user)
            .then(
                /** @param {any} user */
                user => {
                    dispatch(success(user));
                    history.push('/login');
                    dispatch(alertActions.success('Registration successful'));
                },
                /** @param {Error} error */
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
        };

        /** @param {any} user */
        function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
        /** @param {any} user */
        function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
        /** @param {string} error */
        function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
    }

    function getAll() {
        return /** @param {Function} dispatch */ dispatch => {
            dispatch(request());

            userService.getAll()
                .then(
                    /** @param {any[]} users */
                    users => dispatch(success(users)),
                    /** @param {Error} error */
                    error => dispatch(failure(error.toString()))
                );
        };

        function request() { return { type: userConstants.GETALL_REQUEST } }
        /** @param {any[]} users */
        function success(users) { return { type: userConstants.GETALL_SUCCESS, users } }
        /** @param {string} error */
        function failure(error) { return { type: userConstants.GETALL_FAILURE, error } }
    }

    // prefixed function name with underscore because delete is a reserved word in javascript
    /** @param {number} id */
    function _delete(id) {
        return /** @param {Function} dispatch */ dispatch => {
            dispatch(request(id));

            userService.delete(id)
                .then(
                    /** @param {any} user */
                    user => dispatch(success(id)),
                    /** @param {Error} error */
                    error => dispatch(failure(id, error.toString()))
                );
        };

        /** @param {number} id */
        function request(id) { return { type: userConstants.DELETE_REQUEST, id } }
        /** @param {number} id */
        function success(id) { return { type: userConstants.DELETE_SUCCESS, id } }
        /**
         * @param {number} id 
         * @param {string} error
         */
        function failure(id, error) { return { type: userConstants.DELETE_FAILURE, id, error } }
    }