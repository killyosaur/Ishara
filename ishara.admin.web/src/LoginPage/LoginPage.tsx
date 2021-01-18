import React, { FC, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { userActions } from '../_actions';
import {Grid, Typography, TextField, Button} from '@material-ui/core';
import { RootState } from '../_reducers';

const connector = connect(mapStateToProps);

type Props = ConnectedProps<typeof connector>;

const LoginPage: FC<Props> = props => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;

        if(name === 'username') {
            setUsername(value);
        } else if(name === 'password') {
            setPassword(value);
        }
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const {dispatch} = props;

        if(username && password) {
            userActions.login(username, password)(dispatch);
        }

        setUsername('');
        setPassword('');
    };

    return (
        <Grid container direction="column" alignContent="center" alignItems="center">
            <Grid item xs={12}>
                <Typography component="h1" variant="h2">Login</Typography>
            </Grid>
            <form name="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            id="standard-name"
                            label="Username"
                            name="username"
                            value={username}
                            onChange={handleChange}
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
                            onChange={handleChange}
                            autoComplete="current-password"
                            margin="normal"
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Button variant="contained" color="primary" type="submit">Login</Button>
                        {
                            props.loggingIn &&
                            <img alt="logging in" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                        }
                    </Grid>
                </Grid>
            </form>
        </Grid>
    );
};

function mapStateToProps(state: RootState) {
    const { loggingIn } = state.authentication;
    return {
        loggingIn
    };
}

const connectedLoginPage = connector(LoginPage);
export { connectedLoginPage as LoginPage };
