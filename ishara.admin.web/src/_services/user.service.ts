import { authHeader } from '../_helpers';
import { User } from '../_models';
import { handleResponse } from './handleResponse';

export const userService = {
    login,
    logout,
    register,
    getAll,
    update,
    delete: _delete
};

const apiUrl = process.env.REACT_APP_ADMIN_API || '';

async function login(username: string, password: string): Promise<User> {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    };

    const response=await fetch(`${apiUrl}/admin/authenticate`,requestOptions);
    const user = await handleResponse<User>(response, logout);
    // store user details and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem('user', JSON.stringify(user));
    return user;
}

export function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

async function getAll(userId: string): Promise<User[]> {
    const requestOptions: RequestInit = {
        method: 'GET',
        headers: authHeader()
    };

    const response = await fetch(`${apiUrl}/admin/${userId}/users`, requestOptions);
    return handleResponse<User[]>(response, logout);
}

/**
 * @param {any} user
 * @param {any} userId
 */
async function register(userId: string, user: any) {
    const requestOptions: RequestInit = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    const response = await fetch(`${apiUrl}/admin/${userId}/users`, requestOptions);
    return handleResponse<User>(response, logout);
}

/**
 * @param {any} user
 * @param {any} userId
 */
async function update(userId: string, user: any) {
    const requestOptions: RequestInit = {
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
async function _delete(userId: string, id: string) {
    const requestOptions: RequestInit = {
        method: 'DELETE',
        headers: authHeader()
    };

    const response = await fetch(`${apiUrl}/admin/${userId}/users/${id}`,requestOptions);
    return handleResponse(response, logout);
}
