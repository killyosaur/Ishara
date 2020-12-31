// @ts-check
import React, { Fragment } from 'react';
import { Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Grid, withStyles, createStyles } from '@material-ui/core';

import { history } from '../_helpers';
import { alertActions } from '../_actions';
import { PrivateRoute, Notifier } from '../_components';
import { HomePage } from '../HomePage';
import { LoginPage } from '../LoginPage';

const styles = createStyles({
  root: {
    flexGrow: 1,
    position: 'relative',
    height: '100%',
    display: 'flex'
  }
});

/**
 * @param {{ classes: any; dispatch: any; }} props
 */
const App = (props) => {
  const { classes, dispatch } = props;
  history.listen(() => {
    dispatch(alertActions.clearAll())
  })

  return (
    <Fragment>
      <Notifier />
      <Grid container className={classes.root}>
          <Router history={history}>
            <Grid item xs={12}>
                <Route path="/login" component={LoginPage} />
                <PrivateRoute exact path="/" component={HomePage} />
                <PrivateRoute exact path="/user/:userId?" component={HomePage} />
                <PrivateRoute exact path="/post/:postId?" component={HomePage} />
            </Grid>
          </Router>
      </Grid>
    </Fragment>
  );
};


const StyledComponent = withStyles(styles)(App);
const ConnectedApp = connect(null)(StyledComponent);

export { ConnectedApp as App };
