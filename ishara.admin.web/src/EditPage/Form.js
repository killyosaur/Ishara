import React, {Component} from 'react';
import { connect } from 'react-redux';
import {
    TextField, Button, Grid, withStyles, createStyles
} from '@material-ui/core';
import { postActions } from '../_actions';

const styles = theme => createStyles({
    deleteBtn: {
        float: 'right'
    },
    form: {
        padding: theme.spacing.unit * 2,
        color: theme.palette.text.secondary,
        marginBottom: 10
    }
});

const defaultState = {
    title: '',
    content: '',
    modifiedOn: '',
    publishedOn: '',
    authorId: ''
};

class Form extends Component {
    state = {
        post: {
            ...defaultState
        },
        submitted: false
    };

    componentDidMount() {
        const { postId } = this.props.match.params;
        const { posts } = this.props;
        if(posts.items && postId) {
            const post = posts.items.filter(p => p.id === postId)[0] || defaultState;

            this.setState({
                post: {
                    ...post
                }
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { postId } = this.props.match.params;
        const {posts} = this.props;
        if (posts.items && postId !== prevState.post.id) {
            const post = posts.items.filter(p => p.id === postId)[0] || defaultState;
            
            this.setState({
                post: {
                    ...post
                },
                submitted: false
            });
        }
    }

   handleChangeField = (event) => {
        const { name } = event.currentTarget;
        const { post } = this.state;

        this.setState({
            post: {
                ...post,
                [name]: event.target.value
            }
        });
    }

    handleSubmit = () => {
        const {user} = this.props;
        const {id, title, content, publishedOn} = this.state.post;

        let action;
        if(!id) {
            action = postActions.create(user.id, {
                title, content, publishedOn
            });
        } else {
            action = postActions.update(user.id, {
                id, title, content, publishedOn
            });
        }

        this.setState({
            submitted: true
        });
        this.props.dispatch(action);
    }

    render() {
        const {post} = this.state;
        const {classes} = this.props;

        return (
            <form noValidate autoComplete="off">
                <Grid className={classes.form}>
                    <TextField
                        onChange={this.handleChangeField}
                        id="title"
                        name="title"
                        label="Post Title"
                        fullWidth
                        required
                        value={post.title} />
                    <TextField
                        onChange={this.handleChangeField}
                        id="content"
                        name="content"
                        label="Post Content"
                        fullWidth
                        required
                        multiline
                        rows="4"
                        value={post.content} />
                </Grid>
                <Grid>
                    <Button variant="contained" color="primary" onClick={this.handleSubmit}>Submit</Button>
                    { 
                        !!post.id ? (
                            <Button variant="contained" className={classes.deleteBtn} color="secondary" onClick={this.handleDelete}>Delete</Button>
                        ) : null
                    }
                </Grid>
            </form>
        );
    }
}

/** @param {any} state */
function mapStateToProps(state) {
    const { authentication, posts } = state;
    const { user } = authentication;
    return {
        user,
        posts
    };
}

const styledForm = withStyles(styles)(Form);
const connectedForm = connect(mapStateToProps)(styledForm);
export default connectedForm;