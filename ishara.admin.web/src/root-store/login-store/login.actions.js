export const LoginActionTypes = {
    LoginAction: 'LOGIN'
};

export class Login {
    constructor(data) {
        Object.defineProperty(this, 'type', {
            get: () => { return LoginActionTypes.Login; }
        });
        this.data = data;
    }
};