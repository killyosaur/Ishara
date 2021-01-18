import { User } from "../_models";

interface LocalUser extends User {
    token: string;
}

export function authHeader(): Headers {
    // return authorization header with jwt token
    let request = localStorage.getItem('user');

    let user: LocalUser = request ? JSON.parse(request) : null;

    if (user && user.token) {
        return new Headers({ 'Authorization': 'Bearer ' + user.token });
    } else {
        return new Headers();
    }
}
