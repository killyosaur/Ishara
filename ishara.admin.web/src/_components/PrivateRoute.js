// @ts-check
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const checkExpiry = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        return false;
    }

    const token = user.token.split('.');

    const jsonValue = JSON.parse(atob(token[1]));

    return Date.now() < jsonValue.exp * 1000;
}

/** @param {any} Component */
export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        checkExpiry()
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    )} />
);
