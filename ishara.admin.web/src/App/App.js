// @ts-check
import React, { Component } from 'react';
import { Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Grid, withStyles, createStyles } from '@material-ui/core';
import { SnackbarProvider, withSnackbar } from 'notistack';

import { history } from '../_helpers';
import { alertActions } from '../_actions';
import { PrivateRoute } from '../_components';
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

class App extends Component {
  /** @param {any} props */
  constructor(props) {
    super(props);

    const { dispatch } = this.props;
    history.listen(() => {
      // clear alert on location change
      dispatch(alertActions.clear());
    })
  }

  render() {
    const { alert, classes } = this.props;

    return (
      <React.Fragment>
        <Grid container className={classes.root}>
            { alert.message && 
              <div className={`alert ${alert.type}`}>{alert.message}</div>
            }
            <Router history={history}>
              <Grid item xs={12}>
                  <Route path="/login" component={LoginPage} />
                  <PrivateRoute exact path="/" component={HomePage} />
                  <PrivateRoute exact path="/user/:userId?" component={HomePage} />
                  <PrivateRoute exact path="/post/:postId?" component={HomePage} />
              </Grid>
            </Router>
        </Grid>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { alert } = state;
  return {
    alert
  };
}

const SnackApp = withSnackbar(App);
const StyledComponent = withStyles(styles)(SnackApp);
const ConnectedApp = connect(mapStateToProps)(StyledComponent);

function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={1}>
      <ConnectedApp />
    </SnackbarProvider>
  );
}

export { IntegrationNotistack as App};
