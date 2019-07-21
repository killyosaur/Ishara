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
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    userService.logout();
    return { type: userConstants.LOGOUT };
}

/**
 * @param {any} user
 * @param {string} userId
 */
function register(userId, user) {
    return /** @param {Function} dispatch */ dispatch => {
        dispatch(request(user));

        userService.register(userId, user)
            .then(
                /** @param {any} user */
                user => {
                    dispatch(success(user));
                    history.push('/user');
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

    /**
     * @param {string} userId
     */
    function getAll(userId) {
        return /** @param {Function} dispatch */ dispatch => {
            dispatch(request());

            userService.getAll(userId)
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
    /**
     * @param {string} id
     * @param {string} userId
     */
    function _delete(userId, id) {
        return /** @param {Function} dispatch */ dispatch => {
            dispatch(request(id));

            userService.delete(userId, id)
                .then(
                    /** @param {any} user */
                    user => dispatch(success(id)),
                    /** @param {Error} error */
                    error => dispatch(failure(id, error.toString()))
                );
        };

        /** @param {string} id */
        function request(id) { return { type: userConstants.DELETE_REQUEST, id } }
        /** @param {string} id */
        function success(id) { return { type: userConstants.DELETE_SUCCESS, id } }
        /**
         * @param {string} id 
         * @param {string} error
         */
        function failure(id, error) { return { type: userConstants.DELETE_FAILURE, id, error } }
    }