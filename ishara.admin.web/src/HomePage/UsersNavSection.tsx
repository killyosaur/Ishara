import { Collapse, Divider, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Typography } from "@material-ui/core";
import { DeleteForever } from "@material-ui/icons";
import React, { FC, useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Link } from "react-router-dom";
import { userActions } from "../_actions";
import { User } from "../_models";
import { RootState } from "../_reducers";

type BaseProps = {
    classes: Record<"text" | "toolbar" | "drawerHeader" | "drawerPaper" | "textNew" | "nested" | "list", string>,
    defaultOpen: boolean,
    user: User
};

function mapStateToProps(state: RootState) {
    const { users } = state;

    const userArray = users.users.map(u => u.user);

    return {
        users: {
            items: userArray,
            loading: users.loading,
            loaded: users.loaded
        }
    };
}

const connector = connect(mapStateToProps);

type Props = BaseProps & ConnectedProps<typeof connector>;

const UsersNavSection: FC<Props> = props => {
    const [open, setOpen] = useState(false);
    const {classes, dispatch, user, users, defaultOpen} = props;

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        const { id } = event.currentTarget;

        userActions.delete(user.id || '', id)(dispatch);
    }

    const handleClick = () => {
        setOpen(!open);
    };

    useEffect(() => {
        setOpen(defaultOpen);

        if (!users.loading && !users.loaded)
            userActions.getAll(user.id || '')(dispatch);
    }, [user, dispatch, users, defaultOpen]);

    return (
        <div>
            <ListItem button data-open="openusers" onClick={handleClick}>
                <ListItemText primary="users" />
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="ul" disablePadding>
                    <ListItem button className={classes.nested} component={Link} to="/user"><ListItemText className={classes.textNew} primary="Create New user" /></ListItem>
                    {users.loading && <Typography component="em">Loading users...</Typography>}
                    {
                        users.items.map(u =>
                            <ListItem button className={classes.nested} key={u.id} component={Link} to={"/user/" + u.id}>
                                <ListItemText className={classes.text} primary={u.username} />
                                {user.username !== u.username && (
                                <ListItemSecondaryAction>
                                    <IconButton aria-label="Delete" name="user" id={u.id} onClick={handleDelete}>
                                        <DeleteForever />
                                    </IconButton>
                                </ListItemSecondaryAction>
                                )}
                            </ListItem>)
                    }
                </List>
            </Collapse>
            <Divider />
       </div>);
};

export default connector(UsersNavSection);