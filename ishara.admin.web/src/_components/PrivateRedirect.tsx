import React from 'react';
import { Redirect, RedirectProps } from 'react-router-dom';

const checkExpiry = () => {
    const userString = localStorage.getItem('user');
    const user = userString != null ? JSON.parse(userString) : null;

    if (!user) {
        return false;
    }

    const token = user.token.split('.');

    const jsonValue = JSON.parse(atob(token[1]));

    return Date.now() < jsonValue.exp * 1000;
}

export const PrivateRedirect: React.FC<RedirectProps> = (props) => checkExpiry()
        ? (<Redirect {...props} />)
        : (<Redirect to={{ pathname: '/login', state: { from: props.path } }} />);
