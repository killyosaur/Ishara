import React, {useEffect, useState} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import {Grid, TextField, Button, Typography, Checkbox, FormControlLabel, makeStyles} from '@material-ui/core';

import { userActions } from '../_actions';
import { RootState } from '../_reducers';
import { User } from '../_models';

const connector = connect(mapStateToProps);

const useStyles = makeStyles({
    checkboxes: {
        marginLeft: 0
    },
    buttons: {
        marginTop: '20px'
    }
})

interface RouteParams {
    userId?: string;
}
type Props = ConnectedProps<typeof connector> & RouteComponentProps<RouteParams>;

interface EditUser extends User {
    password?: string;
    isAdmin: boolean;
    isAuthor: boolean;
}

const defaultUser: EditUser = {
    username: '',
    lastName: '',
    firstName: '',
    access: [],
    bio: '',
    id: '',
    password: '',
    isAdmin: false,
    isAuthor: false
};

const RegisterPage: React.FC<Props> = props => {
    const classes = useStyles();
    const { registering, users } = props;
    const {userId} = props.match.params;
    const [editUser, setEditUser] = useState(defaultUser);

    useEffect(() => {
        if(userId) {
            const user = users.users.filter(u => u.user.id === userId);
            if(user.length > 0)
            {
                const {id, username, firstName, lastName, bio } = user[0].user;
                const isAdmin = !!user[0].user.access?.some(a => a === 'Administrator');
                const isAuthor = !!user[0].user.access?.some(a => a === 'Author');
                const newEditUser: EditUser = {id, username, firstName, lastName, bio, password: '', isAuthor, isAdmin};
    
                setEditUser(newEditUser);
            }
        }
    }, [users, userId, setEditUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, checked} = e.target;

        if (name === 'access') {
            let access = editUser.access ? [...editUser.access] : [];
            let acc = access.indexOf(value);
            if (checked && acc < 0)
                access.push(value);
            else if(!checked) {
                access.splice(acc, 1);
            }

            setEditUser({
                ...editUser,
                access,
                isAdmin: access.some(a => a === 'Administrator'),
                isAuthor: access.some(a => a === 'Author')
            });
        } else {
            setEditUser({
                ...editUser,
                [name]: value
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const {dispatch, user} = props;

        if(!user || !user.id) {
            throw new Error('Editor is not available');
        }

        if(editUser.firstName && editUser.lastName && editUser.username && editUser.password) {
            userActions.register(user.id, editUser)(dispatch);
        }
    }

    return (
        <Grid>
            <Typography component="h2">Register</Typography>
            <form name="form" onSubmit={handleSubmit}>
                <TextField
                    id="standard-firstname"
                    label="First Name"
                    name="firstName"
                    value={editUser.firstName}
                    onChange={handleChange}
                    margin="normal"
                    fullWidth
                    required
                />
                <TextField
                    id="standard-lastname"
                    label="Last Name"
                    name="lastName"
                    value={editUser.lastName}
                    onChange={handleChange}
                    margin="normal"
                    fullWidth
                    required
                />
                <TextField
                    id="standard-username"
                    label="Username"
                    name="username"
                    value={editUser.username}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    autoComplete="current-password"
                    margin="normal"
                    fullWidth
                    required
                />
                <Grid container>
                    <FormControlLabel
                        className={classes.checkboxes}
                        label="Is Admistrator"
                        control={
                            <Checkbox
                                checked={editUser.isAdmin}
                                onChange={handleChange}
                                value="Administrator"
                                name="access"
                                color="primary" />
                        } />
                    <FormControlLabel
                        className={classes.checkboxes}
                        label="Is Author"
                        control={
                            <Checkbox
                                checked={editUser.isAuthor}
                                onChange={handleChange}
                                value="Author"
                                name="access"
                                color="primary" />
                        } />
                </Grid>
                <Grid className={classes.buttons}>
                    <Button variant="contained" color="primary" type="submit">Register</Button>
                    {
                        registering &&
                        <img alt="registering" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                    }
                    <Button component={Link} to="/user">Cancel</Button>
                </Grid>
            </form>
        </Grid>
    );
};

function mapStateToProps(state: RootState) {
    const { users, authentication } = state;
    const { registering } = state.registration;
    const { user } = authentication;
    return {
        users,
        user,
        registering
    };
}

const connectedRegisterPage = connector(RegisterPage);
export { connectedRegisterPage as RegisterPage };