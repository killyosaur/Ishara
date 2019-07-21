import React, {Component} from 'react';
import { connect } from 'react-redux';
import {
    TextField, Button, Grid, withStyles, createStyles
} from '@material-ui/core';
import { postActions } from '../_actions';

import 'date-fns';
import {format, isDate} from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

const styles = theme => createStyles({
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
        width: '45%',
        marginRight: '5%',
    },
    timePicker: {
        width: '45%',
        marginLeft: '5%',
    },
});

const defaultState = {
    title: '',
    content: '',
    modifiedOn: '',
    authorId: '',
    publishedOn: null
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
                    ...defaultState,
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
                    ...defaultState,
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

    handleChangeDate = (date) => {
        const { post } = this.state;

        this.setState({
            post: {
                ...post,
                publishedOn: date
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
                        rows="18"
                        value={post.content} />
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <Grid container className={classes.grid} justify="center">
                            <KeyboardDatePicker
                                margin="normal"
                                id="mui-pickers-date"
                                label="Date Published On"
                                name="publishedOn"
                                className={classes.datePicker}
                                value={post.publishedOn}
                                onChange={this.handleChangeDate}
                                labelFunc={date => isDate(date) ? format(date, 'yyyy-MMM-dd') : ''}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                            <KeyboardTimePicker
                                margin="normal"
                                id="mui-pickers-time"
                                label="Time Published On"
                                name="publishedOn"
                                className={classes.timePicker}
                                value={post.publishedOn}
                                onChange={this.handleChangeDate}
                                labelFunc={date => isDate(date) ? format(date, 'hh:mm b') : ''}
                                KeyboardButtonProps={{
                                    'aria-label': 'change time',
                                }}
                            />
                        </Grid>
                      </MuiPickersUtilsProvider>
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