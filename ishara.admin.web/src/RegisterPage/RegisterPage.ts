// @ts-check
import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom';
import {Grid, TextField, Button, Typography} from '@material-ui/core';

import { userActions } from '../_actions';

class RegisterPage extends Component {
    state = {
        editUser: {
            firstName: '',
            lastName: '',
            username: '',
            bio: '',
            password: ''
        },
        submitted: false
    };

    componentDidMount() {
        const { userId } = this.props.match.params;
        const { users } = this.props;

        if (userId && users.items) {
            this.updateUserState(userId);
        }
    }

    /**
     * @param {any} prevProps
     * @param {{ editUser: { id: any; }; }} prevState
     */
    componentDidUpdate(prevProps, prevState) {
        const { userId } = this.props.match.params;
        const { users } = this.props;

        if (users.items && userId !== prevState.editUser.id) {
            this.updateUserState(userId);
        }
    }

    updateUserState = (/** @param {string} userId */userId) => {
        const { users } = this.props;
        const editUser = users.items.filter(/** @param {{ id: string }} u */u => u.id === userId)[0] || {
            firstName: '',
            lastName: '',
            username: '',
            bio: '',
            password: ''    
        };

        this.setState({
            user: {
                ...editUser,
                password: ''
            }
        });
}

    /** @param {any} e */
    handleChange = (e) => {
        const { name, value } = e.target;
        const { editUser } = this.state;
        this.setState({
            editUser: {
                ...editUser,
                [name]: value
            }
        });
    }

    /** @param {any} e */
    handleSubmit = (e) => {
        e.preventDefault();

        this.setState({ submitted: true });
        const { editUser } = this.state;
        const { dispatch, user } = this.props;
        if(editUser.firstName && editUser.lastName && editUser.username && editUser.password) {
            dispatch(userActions.register(user.id, editUser));
        }
    }

    render() {
        const { registering } = this.props;
        const { editUser } = this.state;

        return (
            <Grid>
                <Typography component="h2">Register</Typography>
                <form name="form" onSubmit={this.handleSubmit}>
                    <TextField
                        id="standard-firstname"
                        label="First Name"
                        name="firstName"
                        value={editUser.firstName}
                        onChange={this.handleChange}
                        margin="normal"
                        fullWidth
                        required
                    />
                    <TextField
                        id="standard-lastname"
                        label="Last Name"
                        name="lastName"
                        value={editUser.lastName}
                        onChange={this.handleChange}
                        margin="normal"
                        fullWidth
                        required
                    />
                    <TextField
                        id="standard-username"
                        label="Username"
                        name="username"
                        value={editUser.username}
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
                        value={editUser.password}
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
                    <Button component={props => <Link to="/" {...props} />}>Cancel</Button>
                </form>
            </Grid>
        );
    }
}

/** @param {any} state */
function mapStateToProps(state) {
    const { users, user } = state;
    const { registering } = state.registration;
    return {
        users,
        user,
        registering
    };
}

const connectedRegisterPage = connect(mapStateToProps)(RegisterPage);
export { connectedRegisterPage as RegisterPage };