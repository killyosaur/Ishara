// @ts-check
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { userActions } from '../_actions';
import {Grid, Typography, TextField, Button} from '@material-ui/core';

class LoginPage extends Component {
    /** @param {any} props */
    constructor(props) {
        super(props);

        // reset login status
        this.props.dispatch(userActions.logout());
    }

    state = {
        username: '',
        password: '',
        submitted: false
    };

    /** @param {any} e */
    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }

    /** @param {any} e */
    handleSubmit = (e) => {
        e.preventDefault();

        this.setState({ submitted: true });
        const { username, password } = this.state;
        const { dispatch } = this.props;
        if(username && password) {
            dispatch(userActions.login(username, password));
        }
        this.setState({
            username: "",
            password: ""
        })
    }

    render() {
        const { loggingIn } = this.props;
        const { username, password } = this.state;
        return (
            <Grid container direction="column" alignContent="center" alignItems="center">
                <Grid item xs={12}>
                    <Typography component="h1" variant="h2">Login</Typography>
                </Grid>
                <form name="form" noValidate autoComplete="off" onSubmit={this.handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                id="standard-name"
                                label="Username"
                                name="username"
                                value={username}
                                onChange={this.handleChange}
                                margin="normal"
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="outlined-password-input"
                                label="Password"
                                type="password"
                                name="password"
                                value={password}
                                onChange={this.handleChange}
                                autoComplete="current-password"
                                margin="normal"
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Button variant="contained" color="primary" type="submit">Login</Button>
                            {
                                loggingIn &&
                                <img alt="logging in" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                            }
                        </Grid>
                    </Grid>
                </form>
            </Grid>
        );
    }
}

/** @param {any} state */
function mapStateToProps(state) {
    const { loggingIn } = state.authentication;
    return {
        loggingIn
    };
}

const connectedLoginPage = connect(mapStateToProps)(LoginPage);
export { connectedLoginPage as LoginPage };
