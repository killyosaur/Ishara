import { Collapse, Divider, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Typography } from "@material-ui/core";
import { DeleteForever } from "@material-ui/icons";
import React, { FC, useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Link } from "react-router-dom";
import { postActions } from "../_actions";
import { User } from "../_models";
import { RootState } from "../_reducers";

type BaseProps = {
    classes: Record<"text" | "toolbar" | "drawerHeader" | "drawerPaper" | "textNew" | "nested" | "list", string>,
    defaultOpen: boolean,
    user: User
};

function mapStateToProps(state: RootState) {
    const { posts } = state;

    const postArray = posts.posts.map(u => u.post);

    return {
        posts: {
            items: postArray,
            loading: posts.loading,
            loaded: posts.loaded
        }
    };
}

const connector = connect(mapStateToProps);

type Props = BaseProps & ConnectedProps<typeof connector>;

const PostsNavSection: FC<Props> = props => {
    const [open, setOpen] = useState(false);
    const {classes, dispatch, user, posts, defaultOpen} = props;

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        const { id } = event.currentTarget;

        postActions.delete(user.id || '', id)(dispatch);
    }

    const handleClick = () => {
        setOpen(!open);
    };

    useEffect(() => {
        setOpen(defaultOpen);

        if (!posts.loading && !posts.loaded)
            postActions.getAll(user.id || '')(dispatch);
    }, [user, dispatch, posts, defaultOpen]);

    return (
        <div>
            <ListItem button data-open="openPosts" onClick={handleClick}>
                <ListItemText primary="Posts" />
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="ul" disablePadding>
                    <ListItem button className={classes.nested} component={Link} to="/post"><ListItemText className={classes.textNew} primary="Create New Post" /></ListItem>
                    {posts.loading && <Typography component="em">Loading posts...</Typography>}
                    {
                        posts.items.map(p =>
                            <ListItem button className={classes.nested} key={p.id} component={Link} to={"/post/" + p.id}>
                                <ListItemText className={classes.text} primary={p.title} />
                                <ListItemSecondaryAction>
                                    <IconButton aria-label="Delete" name="post" id={p.id} onClick={handleDelete}>
                                        <DeleteForever />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        )
                    }
                </List>
            </Collapse>
            <Divider />
        </div>);
};

export default connector(PostsNavSection);