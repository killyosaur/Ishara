import { createStyles, Divider, Drawer, List, ListItem, makeStyles, Theme, Typography } from "@material-ui/core";
import React, { FC } from "react";
import { User } from "../_models";
import UsersNavSection from "./UsersNavSection";
import PostsNavSection from "./PostsNavSection";
import { userActions } from "../_actions";
import { Link } from "react-router-dom";

const useStyles = makeStyles(({ spacing, mixins }: Theme) => createStyles({
    drawerHeader: {
        margin: 'auto',
        paddingTop: '1.2rem',
        paddingLeft: '1rem',
        textAlign: 'center'
    },
    drawerPaper: {
        position: 'relative',
        width: 250
    },
    text: {
        padding: spacing(1)
    },
    textNew: {
        padding: spacing(1),
        fontStyle: 'italic'
    },
    nested: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block',
        margin: 0,
        paddingTop: 0,
        paddingBottom: 0
    },
    list: {
        marginLeft: '.5rem'
    },
    toolbar: mixins.toolbar
}));

const NavMenu: FC<{isAdmin?: boolean, isAuthor?: boolean, user: User}> = (props) => {
    const {isAdmin, isAuthor, user} = props;
    const classes = useStyles();

    const logout = () => {
        userActions.logout();
    }

    return (<Drawer variant="permanent" classes={{paper: classes.drawerPaper}} anchor="left">
        <div className={classes.toolbar}>
            <Typography className={classes.drawerHeader} variant='h4'>{user.username}</Typography>
        </div>
        <Divider />
        <List component="nav" className={classes.list}>
            { isAdmin && (<UsersNavSection defaultOpen={!!isAdmin && !isAuthor} user={user} classes={classes} />) }
            { isAuthor && (<PostsNavSection defaultOpen={true} user={user} classes={classes} />) }
            <ListItem button component={Link} to="/login" onClick={logout}>Log Out</ListItem>
        </List>
    </Drawer>);
}

export default NavMenu;