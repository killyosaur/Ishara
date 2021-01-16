import {User} from '../'

export interface UserState {
    loggingIn: boolean;
    loggedIn: boolean;
    user?: User;
    error?: Error;
}

export interface UsersState {
    loading: boolean;
    loaded: boolean;
    users: {user: User, deleting: boolean, deleteError?: Error}[];
    error?: Error;
}

export interface RegisterUserState {
    registering: boolean;
    error?: Error;

}