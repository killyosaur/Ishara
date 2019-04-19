// @ts-check
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

/** @param {any} Component */
export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        localStorage.getItem('user')
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    )} />
);
