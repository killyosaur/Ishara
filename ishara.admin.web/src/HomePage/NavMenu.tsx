import { createStyles, Divider, Drawer, List, ListItem, makeStyles, Theme, Typography, Hidden, SwipeableDrawer } from "@material-ui/core";
import React, { FC, SyntheticEvent } from "react";
import { User } from "../_models";
import UsersNavSection from "./UsersNavSection";
import PostsNavSection from "./PostsNavSection";
import { userActions } from "../_actions";
import { Link } from "react-router-dom";

const drawerWidth = 250;
const drawerBleeding = 20;

const useStyles = makeStyles(({ spacing, mixins, breakpoints }: Theme) => createStyles({
    drawerHeader: {
        margin: 'auto',
        paddingTop: '1.2rem',
        paddingLeft: '1rem',
        textAlign: 'center'
    },
    drawer: {
        [breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth
        }
    },
    drawerPaper: {
        boxSizing: 'border-box',
        width: drawerWidth
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

const NavMenu: FC<{isAdmin?: boolean, isAuthor?: boolean, user: User, className: any}> = (props) => {
    const {isAdmin, isAuthor, user} = props;
    const classes = useStyles();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const logout = () => {
        userActions.logout();
    };

    const toggle = (open: boolean) => (event: SyntheticEvent<{}, KeyboardEvent | MouseEvent>) => {
        if(event && event.type === 'keydown' && ((event as SyntheticEvent<{}, KeyboardEvent>).nativeEvent.key === 'Tab' ||
        (event as SyntheticEvent<{}, KeyboardEvent>).nativeEvent.key === 'Shift')) {
            return;
        }

        setMobileOpen(open);
    };

    const menuContent = (
        <List component="nav" className={classes.list}>
            { isAdmin && (<UsersNavSection defaultOpen={!!isAdmin && !isAuthor} user={user} classes={classes} />) }
            { isAuthor && (<PostsNavSection defaultOpen={true} user={user} classes={classes} />) }
            <ListItem button component={Link} to="/login" onClick={logout}>Log Out</ListItem>
        </List>
    );

    return (
        <nav className={props.className} aria-label="">
            <Hidden smUp implementation="css">
                <SwipeableDrawer
                    anchor="left"
                    open={mobileOpen}
                    onClose={toggle(false)}
                    swipeAreaWidth={drawerBleeding}
                    disableSwipeToOpen={false}
                    ModalProps={{
                        keepMounted: true
                    }}
                    onOpen={toggle(true)}>
                        <div className={classes.toolbar}>
                            <Typography className={classes.drawerHeader} variant='h4'>{user.username}</Typography>
                        </div>
                        <Divider />
                        {menuContent}
                </SwipeableDrawer>
            </Hidden>
            <Hidden smDown implementation="css">
                <Drawer variant="permanent" classes={{paper: classes.drawerPaper}} anchor="left">
                    <div className={classes.toolbar}>
                        <Typography className={classes.drawerHeader} variant='h4'>{user.username}</Typography>
                    </div>
                    <Divider />
                    {menuContent}
                </Drawer>
            </Hidden>
        </nav>
    );
}

export default NavMenu;