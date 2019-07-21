// @ts-check
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Switch, Route, Link, Redirect } from 'react-router-dom';
import {
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Collapse,
    Divider,
    Drawer,
    withStyles,
    createStyles
} from '@material-ui/core';
import { DeleteForever } from '@material-ui/icons';
import { userActions, postActions } from '../_actions';
import { Form } from '../EditPage';
import {RegisterPage} from '../RegisterPage';

const styles = ({ palette, spacing, mixins }) => createStyles({
    home: {
        flexGrow: 1,
        zIndex: 1,
        position: 'relative',
        height: '100%',
        display: 'flex'
    },
    drawerHeader: {
        margin: 'auto',
        paddingTop: '1.2rem',
        textAlign: 'center'
    },
    drawerPaper: {
        position: 'relative',
        width: 250
    },
    content: {
        flexGrow: 1,
        backgroundColor: palette.background.default,
        padding: spacing(3),
        minWidth: 0, // So the Typography noWrap works
    },
    nested: {
      paddingLeft: spacing(4),
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    toolbar: mixins.toolbar
});

class HomePage extends Component {
    state = {
        openUsers: false,
        openPosts: true
    };

    componentDidMount() {
        const { user } = this.props;

        if (user.isAdmin) {
            this.props.dispatch(userActions.getAll(user.id));
            this.setState({openUsers: true });
        }

        this.props.dispatch(postActions.getAll(user.id));
    }

    /**
     * @param {{ currentTarget: any }} event
     */
    handleDelete = (event) => {
        const { name, id } = event.currentTarget;

        switch(name) {
            case 'post':
                const {user} = this.props;
                this.props.dispatch(postActions.delete(user.id, id));
                break;
            case 'user':
                this.props.dispatch(userActions.delete(user.id, id));
                break;
            default:
                break;
        }
    }
 
    /**
     * @param {{ currentTarget: { getAttribute: (arg0: string) => string; }; }} event
     */
    handleClick = (event) => {
        const openId = event.currentTarget.getAttribute('data-open');
        this.setState(/** @param {any} state */state => ({[openId]: !state[openId]}));
    }

    /**
     * @param {{ isAdmin: any; }} user
     */
    renderAdmin(user) {
        if(user.isAdmin) {
            return (
                <ListItem button data-open="openUsers" onClick={this.handleClick}>
                    <ListItemText primary="Users" />
                </ListItem>
            );
        } else {
            return (<ListItem />);
        }
    }

    render() {
        const { user, users, posts, classes } = this.props;

        return (
            <div className={classes.home}>
                <Drawer variant="permanent" classes={{paper: classes.drawerPaper}} anchor="left">
                    <div className={classes.toolbar}>
                        <Typography className={classes.drawerHeader} variant='h4'>{user.username}</Typography>
                    </div>
                    <Divider />
                    <List component="nav">
                        { this.renderAdmin(user) }
                        <Collapse in={this.state.openUsers} timeout="auto" unmountOnExit>
                            <List component="ul" disablePadding>
                                <ListItem button className={classes.nested} component={Link} to="/user"><em>Create New User</em></ListItem>
                                {users.loading && <Typography component="em">Loading users...</Typography>}
                                {
                                    users.items && users.items.map(/** @param {any} u */u =>
                                        <ListItem button className={classes.nested} key={u.id} component={Link} to={"/user/" + u.id}>
                                            {u.username}
                                            <ListItemSecondaryAction>
                                                <IconButton aria-label="Delete" name="user" id={u.id} onClick={this.handleDelete}>
                                                    <DeleteForever />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    )
                                }
                            </List>
                        </Collapse>
                        <ListItem button data-open="openPosts" onClick={this.handleClick}>
                            <ListItemText primary="Posts" />
                        </ListItem>
                        <Collapse in={this.state.openPosts} timeout="auto" unmountOnExit>
                            <List component="ul" disablePadding>
                                <ListItem button className={classes.nested} component={Link} to="/post"><em>Create New Post</em></ListItem>
                                {posts.loading && <Typography component="em">Loading posts...</Typography>}
                                {
                                    posts.items && posts.items.map(/** @param {any} p */p =>
                                        <ListItem button className={classes.nested} key={p.id} component={Link} to={"/post/" + p.id}>
                                            {p.title}
                                            <ListItemSecondaryAction>
                                                <IconButton aria-label="Delete" name="post" id={p.id} onClick={this.handleDelete}>
                                                    <DeleteForever />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    )
                                }
                            </List>
                        </Collapse>
                        <ListItem button component={Link} to="/login">Log Out</ListItem>
                    </List>
                </Drawer>
                <Grid className={classes.content}>
                    <Typography component="h2" variant="h2" gutterBottom>
                        Hi {user.firstName}!
                    </Typography>
                    <Switch>
                        <Route path="/user/:userId?" component={RegisterPage} />
                        <Route path="/post/:postId?" component={Form} />
                        <Redirect from="/" to="/post"/>
                    </Switch>
                </Grid>
            </div>
        );
    }
}

/** @param {any} state */
function mapStateToProps(state) {
    const { users, posts, authentication } = state;
    const { user } = authentication;
    return {
        user,
        users,
        posts
    };
}

const routedHomePage = withRouter(HomePage)
const connectedHomePage = connect(mapStateToProps)(routedHomePage);
const styledHomePage = withStyles(styles)(connectedHomePage);
export { styledHomePage as HomePage };
