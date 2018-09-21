import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Grid, Paper, Typography } from '@material-ui/core';
import {Form} from '../../components/Article';
import {HomeActionTypes} from '../../root-store/home-store';

class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Grid item xs={12}>
                <Typography variant="display2">{'Blog Module Version 1.0'}</Typography>
                <Form />
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    articles: state.home.articles
});

const mapDispatchToProps = dispatch => ({
    onDelete: id => dispatch({ type: HomeActionTypes.DeleteArticleAction, data: {id} })
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
