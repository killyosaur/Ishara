// @ts-check
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Grid, TextField, Button, Typography} from '@material-ui/core';

import { userActions } from '../_actions';
import {LoginLink} from '../_components';

class RegisterPage extends Component {
    /** @param {any} props */
    constructor(props) {
        super(props);

        this.state = {
            user: {
                firstName: '',
                lastName: '',
                username: '',
                password: ''
            },
            submitted: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /** @param {any} e */
    handleChange(e) {
        const { name, value } = e.target;
        const { user } = this.state;
        this.setState({
            user: {
                ...user,
                [name]: value
            }
        });
    }

    /** @param {any} e */
    handleSubmit(e) {
        e.preventDefault();

        this.setState({ submitted: true });
        const { user } = this.state;
        const { dispatch } = this.props;
        if(user.firstName && user.lastName && user.username && user.password) {
            dispatch(userActions.register(user));
        }
    }

    render() {
        const { registering } = this.props;
        const { user } = this.state;

        return (
            <Grid>
                <Typography component="h2">Register</Typography>
                <form name="form" onSubmit={this.handleSubmit}>
                    <TextField
                        id="standard-firstname"
                        label="First Name"
                        name="firstName"
                        value={user.firstName}
                        onChange={this.handleChange}
                        margin="normal"
                        fullWidth
                        required
                    />
                    <TextField
                        id="standard-lastname"
                        label="Last Name"
                        name="lastName"
                        value={user.lastName}
                        onChange={this.handleChange}
                        margin="normal"
                        fullWidth
                        required
                    />
                    <TextField
                        id="standard-username"
                        label="Username"
                        name="username"
                        value={user.username}
                        onChange={this.handleChange}
                        margin="normal"
                        fullWidth
                        required
                    />
                    <TextField
                        id="password-input"
                        label="Password"
                        type="password"
                        name="password"
                        value={user.password}
                        onChange={this.handleChange}
                        autoComplete="current-password"
                        margin="normal"
                        fullWidth
                        required
                    />
                    <Button variant="contained" color="primary" type="submit">Register</Button>
                    {
                        registering &&
                        <img alt="registering" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                    }
                    <Button component={LoginLink}>Cancel</Button>
                </form>
            </Grid>
        );
    }
}

/** @param {any} state */
function mapStateToProps(state) {
    const { registering } = state.registration;
    return {
        registering
    };
}

const connectedRegisterPage = connect(mapStateToProps)(RegisterPage);
export { connectedRegisterPage as RegisterPage };