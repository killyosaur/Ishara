// @ts-check
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, List, ListItem, Typography, Button } from '@material-ui/core';

import { userActions } from '../_actions';
import {LoginLink} from '../_components';

class HomePage extends Component {
    componentDidMount() {
        this.props.dispatch(userActions.getAll());
    }

    /** @param {number} id */
    handleDeleteUser(id) {
        return () => this.props.dispatch(userActions.delete(id));
    }

    render() {
        const { user, users } = this.props;

        return (
            <Grid>
                <Typography component="h2" variant="h1" gutterBottom>
                    Hi {user.firstName}!
                </Typography>
                <Typography component="p" variant="body1" gutterBottom>
                    You're logged in with React!!
                </Typography>
                <Typography component="h3" gutterBottom>
                    All registered users:
                </Typography>
                {users.loading && <Typography component="em">Loading users...</Typography>}
                {
                    users.items &&
                    <List component="ul">
                    {
                        users.items.map(/**
                             * @param {any} user
                             */
                            user =>
                                <ListItem component="li" key={user.id}>
                                    {`${user.firstName} ${user.lastName}`}
                                    {
                                        user.deleting ? <Typography component="em"> - Deleting...</Typography>
                                        : user.deleteError ? <Typography component="span" color="error"> - ERROR: {user.deleteError}</Typography>
                                        :  <Typography component="span"><Button onClick={this.handleDeleteUser(user.id)}>Delete</Button></Typography>
                                    }
                                </ListItem>
                            )
                    }
                    </List>
                }
                <Typography component="p">
                    <Button component={LoginLink}>Logout</Button>
                </Typography>
            </Grid>
        );
    }
}

/** @param {any} state */
function mapStateToProps(state) {
    const { users, authentication } = state;
    const { user } = authentication;
    return {
        user,
        users
    };
}

const connectedHomePage = connect(mapStateToProps)(HomePage);
export { connectedHomePage as HomePage };
