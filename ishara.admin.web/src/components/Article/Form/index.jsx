import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { TextField, Button, Grid, Paper, withStyles } from '@material-ui/core';
import { HomeActionTypes } from '../../../root-store/home-store';

const styles = theme => ({
    paper: {
        padding: theme.spacing.unit * 2,
        color: theme.palette.text.secondary,
        marginBottom: 10
    },
    deleteBtn: {
        float: 'right'
    }
});

class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state={
            title: '',
            body: '',
            author: ''
        };

        this.handleChangeField = this.handleChangeField.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.articleToEdit) {
            this.setState({
                title: nextProps.articleToEdit.title,
                body: nextProps.articleToEdit.body,
                author: nextProps.author
            });
        }
    }

    handleChangeField(key, event) {
        this.setState({
            [key]: event.target.value
        });
    }

    handleSubmit() {
        const {onSubmit, articleToEdit, onEdit} = this.props;
        const {title, body, author} = this.state;

        if(!articleToEdit || !articleToEdit._id) {
            return axios.post('http://localhost:8000/api/articles', {
                    title,
                    body,
                    author: author.username
                })
                .then(res => onSubmit(res.data))
                .then(() => this.setState({title: '', body: '', author: ''}));
        } else {
            return axios.patch(`http://localhost:8000/api/articles/${articleToEdit._id}`, {
                title,
                body,
                author: author.username
            })
            .then(res => onEdit(res.data))
            .then(() => this.setState({ title: '', body: '', author: '' }));
        }
    }

    render() {
        const {title, body, author} = this.state;
        const {classes, articleToEdit} = this.props;

        return (
            <form noValidate autoComplete="off">
                <Grid>
                    <Paper className={classes.paper}>
                        <TextField
                            onChange={(ev) => this.handleChangeField('title', ev)}
                            id="title"
                            label="Article Title"
                            fullWidth
                            value={title} />
                        <TextField
                            onChange={(ev) => this.handleChangeField('body', ev)}
                            id="description"
                            label="Article Description"
                            fullWidth
                            multiline
                            rows="4"
                            value={body} />
                    </Paper>
                </Grid>
                <Grid>
                    <Button variant="contained" color="primary"
                        onClick={this.handleSubmit}>Submit</Button>
                    { (!!articleToEdit && !!articleToEdit._id) ? 
                    (<Button variant="contained" className={classes.deleteBtn} color="secondary" 
                        onClick={this.handleDelete}>Delete</Button>) : null }
                </Grid>
            </form>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    onSubmit: data => dispatch({ type: HomeActionTypes.SubmitArticleAction, data }),
    onEdit: data => dispatch({ type: HomeActionTypes.EditArticleAction, data })
});

const mapStateToProps = state => ({
    articleToEdit: state.home.articleToEdit,
    author: state.login.user
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Form));