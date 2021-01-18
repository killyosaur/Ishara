// @ts-check
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

export const RegisterLink: React.FC<{props: LinkProps }> = props => <Link to="/register" {...props} />;

export const LoginLink: React.FC<{props: LinkProps }>  = props => <Link to="/login" {...props} />;