import { authHeader } from '../_helpers';
import { Post } from '../_models';
import { handleResponse } from './handleResponse';

export const postService = {
    getAll,
    create,
    update,
    delete: _delete
}
const api = process.env.REACT_APP_ADMIN_API;

async function getAll(userId: string) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    const response = await fetch(`${api}/admin/${userId}/posts`,requestOptions);
    return handleResponse<Post[]>(response);
}

async function create(userId: string, post: Post) {
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
    };

    const response = await fetch(`${api}/admin/${userId}/posts`,requestOptions);
    return handleResponse<string>(response);
}

async function update(userId: string, post: Post) {
    const requestOptions = {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
    };

    const response = await fetch(`${api}/admin/${userId}/posts/${post.id}`,requestOptions);
    return handleResponse<string>(response);
}

// prefixed function name with underscore because delete is a reserved word in javascript
async function _delete(userId: string, id: string) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    const response = await fetch(`${api}/admin/${userId}/posts/${id}`,requestOptions);
    return handleResponse(response);
}
