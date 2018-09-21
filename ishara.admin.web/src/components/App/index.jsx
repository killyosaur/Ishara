import React from 'react';
import axios from 'axios';
import { 
    Drawer,
    List,
    ListItem,
    ListItemText,
    Grid,
    Divider,
    Typography
} from '@material-ui/core';
import { withRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { LoginActionTypes } from '../../root-store/login-store';
import { HomeActionTypes } from '../../root-store/home-store';

import { Home } from '../../components'

const drawerWidth = 250;
const styles = theme => ({
    root: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex'
    },
    drawerHeader: {
        textAlign: 'center'
    },
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        minWidth: 0, // So the Typography noWrap works
    },
    toolbar: theme.mixins.toolbar
});

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {onLogin, onLoad} = this.props;

        axios('http://localhost:8000/api/users')
            .then(res => onLogin({ user: res.data.users[0] }));

        axios('http://localhost:8000/api/articles')
            .then(res => onLoad(res.data));
    }

    handleEdit(article) {
        const {setEdit} = this.props;

        setEdit(article);
    }

    render() {
        const { classes, user, articles } = this.props;
        const message = `${user ? user.firstname : ''} ${user ? user.lastname : ''}`;

        return (
            <div className={classes.root}>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper
                    }}
                    anchor="left"
                    >
                    <div className={classes.toolbar}>
                        <Typography className={classes.drawerHeader} variant='title'>{'Welcome,'}<br />{message}</Typography>
                    </div>
                    <Divider />
                    <List>
                        <ListItem button onClick={() => this.handleEdit({
                            title: '',
                            body: ''
                        })}>
                            <ListItemText primary="New Article" />
                        </ListItem>
                        {articles.map(article => (
                            <ListItem key={article._id} button onClick={() => this.handleEdit(article)}>
                                <ListItemText primary={article.title} />
                            </ListItem>
                        )
                    )}
                    </List>
                </Drawer>
                <Grid container spacing={24} className={classes.content}>
                    <Switch>
                        <Route exact path="/" component={Home} />>
                    </Switch>
                </Grid>
            </div>
        );
    }
};

App.propTypes = {
    classes: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    user: state.login.user,
    articles: state.home.articles
});

const mapDispatchToProps = dispatch => ({
    onLogin: data => dispatch({ type: LoginActionTypes.LoginAction, data }),
    onLoad: data => dispatch({ type: HomeActionTypes.HomePageLoadedAction, data }),
    setEdit: article => dispatch({ type: HomeActionTypes.SetEditAction, data: {article} })
});

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(withRouter(App)));