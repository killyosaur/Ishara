// @ts-check
export function authHeader() {
    // return authorization header with jwt token
    var request = localStorage.getItem('user');

    let user = request ? JSON.parse(request) : null;

    if (user && user.token) {
        return new Headers({ 'Authorization': 'Bearer ' + user.token });
    } else {
        return new Headers();
    }
}
