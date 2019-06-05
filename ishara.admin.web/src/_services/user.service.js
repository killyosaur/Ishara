// @ts-check
import { authHeader } from '../_helpers';
import { handleResponse } from './handleResponse';
import settings from '../settings.js';

const apiUrl = settings.api;

export const userService = {
    login,
    logout,
    register,
    getAll,
    getById,
    update,
    delete: _delete
};

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

    const response=await fetch(`${apiUrl}/users/authenticate`,requestOptions);
    const user=await handleResponse(response, logout);
    // store user details and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem('user',JSON.stringify(user));
    return user;
}

export function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

async function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    const response = await fetch(`${apiUrl}/users`,requestOptions);
    return handleResponse(response, logout);
}

/** @param {string} id */
async function getById(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    const response = await fetch(`${apiUrl}/users/${id}`,requestOptions);
    return handleResponse(response, logout);
}

/** @param {any} user */
async function register(user) {
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    const response = await fetch(`${apiUrl}/users/register`,requestOptions);
    return handleResponse(response, logout);
}

/** @param {any} user */
async function update(user) {
    const requestOptions = {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    const response = await fetch(`${apiUrl}/users/${user.id}`,requestOptions);
    return handleResponse(response, logout);
}

// prefixed function name with underscore because delete is a reserved word in javascript
/** @param {string} id */
async function _delete(id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    const response = await fetch(`${apiUrl}/users/${id}`,requestOptions);
    return handleResponse(response, logout);
}


