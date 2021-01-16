import React, {useState} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
    TextField, Button, Grid, createStyles, Theme, makeStyles, Box
} from '@material-ui/core';
import { postActions } from '../_actions';

import 'date-fns';
import {
    LocalizationProvider,
    DateTimePicker,
} from '@material-ui/lab';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import { RootState } from '../_reducers';
import { RouteComponentProps } from 'react-router-dom';
import { Post } from '../_models';

const useStyles = makeStyles((theme: Theme) => createStyles({
    deleteBtn: {
        float: 'right'
    },
    form: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
        marginBottom: 10
    },
    grid: {
        width: '100%',
    },
    datePicker: {
        width: '100%'
    }
}));

const defaultState: Post = {
    id: '',
    title: '',
    content: '',
    modifiedOn: new Date(),
    authorId: '',
    publishedOn: null
};

const connector = connect(mapStateToProps);

interface RouteParams {
    postId?: string;
}
type Props = ConnectedProps<typeof connector> & RouteComponentProps<RouteParams>;

const Form: React.FC<Props> = (props) => {
    const {postId} = props.match.params;
    const classes = useStyles();

    const [post, setPost] = useState(defaultState);

    if(postId) {
        const {posts} = props;
        const post = posts.posts.filter(p => p.post.id === postId);

        post.length > 0 && setPost(post[0].post);
    }

    const handleChangeField = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name } = event.currentTarget;

        setPost({
            ...post,
            [name]: event.target.value
        });
    }

    const handleChangeDate = (date: Date | null) => {
        setPost({
            ...post,
            publishedOn: date
        });
    }

    const handleSubmit = () => {
        const {dispatch, user} = props;
        
        if(!user || !user.id) {
            throw new Error('no available user for editing');
        }

        let action: { (dispatch: Function): void; };
        if(!post.id) {
            action = postActions.create(user.id || '', post);
        } else {
            action = postActions.update(user.id || '', post);
        }

        action(dispatch);
    }

    const handleDelete = () => {
        const {dispatch, user} = props;

        postActions.delete(user?.id || '', post.id)(dispatch);
    }

    return (<form noValidate autoComplete="off">
        <Grid className={classes.form}>
            <TextField
                onChange={handleChangeField}
                id="title"
                name="title"
                label="Post Title"
                fullWidth
                required
                value={post.title} />
            <TextField
                onChange={handleChangeField}
                id="content"
                name="content"
                label="Post Content"
                fullWidth
                required
                multiline
                rows="18"
                value={post.content} />
            <Box sx={{display: 'flex', justifyContent: 'center'}} className={classes.grid}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                        label="Date Published On"
                        renderInput={(props) => <TextField {...props} />}
                        className={classes.datePicker}
                        value={post.publishedOn}
                        onChange={handleChangeDate}
                    />
                </LocalizationProvider>
            </Box>
        </Grid>
        <Grid>
            <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
            { 
                !!post.id ? (
                    <Button variant="contained" className={classes.deleteBtn} color="secondary" onClick={handleDelete}>Delete</Button>
                ) : null
            }
        </Grid>
    </form>);
};

function mapStateToProps(state: RootState) {
    const { authentication, posts } = state;
    const { user } = authentication;
    return {
        user,
        posts
    };
}

const connectedForm = connect(mapStateToProps)(Form);
export default connectedForm;