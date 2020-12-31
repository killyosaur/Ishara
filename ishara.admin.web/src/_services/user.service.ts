// @ts-check
import { authHeader } from '../_helpers';
import { handleResponse } from './handleResponse';

export const userService = {
    login,
    logout,
    register,
    getAll,
    update,
    delete: _delete
};

// @ts-ignore
const apiUrl = process.env.REACT_APP_ADMIN_API || '';

/**
 * @param {string} username
 * @param {string} password
 */
async function login(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    };

    const response=await fetch(`${apiUrl}/admin/authenticate`,requestOptions);
    const user=await handleResponse(response, logout);
    // store user details and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem('user',JSON.stringify(user));
    return user;
}

export function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

/**
 * @param {any} userId
 */
async function getAll(userId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    const response = await fetch(`${apiUrl}/admin/${userId}/users`,requestOptions);
    return handleResponse(response, logout);
}

/**
 * @param {any} user
 * @param {any} userId
 */
async function register(userId, user) {
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    const response = await fetch(`${apiUrl}/admin/${userId}/users`,requestOptions);
    return handleResponse(response, logout);
}

/**
 * @param {any} user
 * @param {any} userId
 */
async function update(userId, user) {
    const requestOptions = {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    const response = await fetch(`${apiUrl}/admin/${userId}/users/${user.id}`,requestOptions);
    return handleResponse(response, logout);
}

// prefixed function name with underscore because delete is a reserved word in javascript
/**
 * @param {string} id
 * @param {any} userId
 */
async function _delete(userId, id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    const response = await fetch(`${apiUrl}/admin/${userId}/users/${id}`,requestOptions);
    return handleResponse(response, logout);
}