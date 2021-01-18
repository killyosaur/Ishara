// @ts-check
import React, { Fragment } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';
import { Grid, makeStyles } from '@material-ui/core';

import { history } from '../_helpers';
import { alertActions } from '../_actions';
import { PrivateRoute, Notifier, PrivateRedirect } from '../_components';
import { HomePage } from '../HomePage';
import { LoginPage } from '../LoginPage';
import { RegisterPage } from '../RegisterPage';
import { Form } from '../EditPage';
import { RootState } from '../_reducers';
import { User } from '../_models';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    position: 'relative',
    height: '100%',
    display: 'flex'
  }
});

const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector>;

function mapStateToProps(state: RootState) {
  const { authentication } = state;
  const { user } = authentication;

  const defUser: User = {username: ''};
  return {
      user: user || defUser
  };
}

const App: React.FC<Props> = (props) => {
  const classes = useStyles();
  const {dispatch, user} = props;

  history.listen(() => {
    dispatch(alertActions.clear())
  })

  const isAdmin = user?.access?.some(a => a === 'Administrator');

  const isAuthor = user?.access?.some(a => a === 'Author');

  const startPage = isAdmin && !isAuthor ? "/user" : "/post";

  return (
    <Fragment>
      <Notifier />
      <Grid container className={classes.root}>
          <Router history={history}>
            <Grid item xs={12}>
                <Switch>
                  <Route exact path="/login" component={LoginPage} />
                  <HomePage user={user} isAdmin={isAdmin} isAuthor={isAuthor}>
                    <PrivateRoute exact path="/user/:userId?" component={RegisterPage} />
                    <PrivateRoute exact path="/post/:postId?" component={Form} />
                    <PrivateRedirect from="/" to={startPage} />
                  </HomePage>
                </Switch>
            </Grid>
          </Router>
      </Grid>
    </Fragment>
  );
};

const ConnectedApp = connector(App);

export { ConnectedApp as App };
