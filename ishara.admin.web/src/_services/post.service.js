import { authHeader } from '../_helpers';
import { handleResponse } from './handleResponse';
import settings from '../settings.js';

export const postService = {
    getAll,
    create,
    update,
    delete: _delete
}

/** @param {string} userId */
async function getAll(userId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    const response = await fetch(`${settings.api}/users/${userId}/posts`,requestOptions);
    return handleResponse(response);
}

/** @param {string} userId, @param {any} post */
async function create(userId, post) {
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
    };

    const response = await fetch(`${settings.api}/users/${userId}/posts`,requestOptions);
    return handleResponse(response);
}

/** @param {string} userId, @param {any} post */
async function update(userId, post) {
    const requestOptions = {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
    };

    const response = await fetch(`${settings.api}/users/${userId}/posts/${post.id}`,requestOptions);
    return handleResponse(response);
}

// prefixed function name with underscore because delete is a reserved word in javascript
/** @param {string} userId, @param {string} id */
async function _delete(userId, id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    const response = await fetch(`${settings.api}/users/${userId}/posts/${id}`,requestOptions);
    return handleResponse(response);
}
