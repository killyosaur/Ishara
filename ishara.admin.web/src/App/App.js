// @ts-check
import React, { Component } from 'react';
import { Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Grid, Paper, withStyles } from '@material-ui/core';

import { history } from '../_helpers';
import { alertActions } from '../_actions';
import { PrivateRoute } from '../_components';
import { HomePage } from '../HomePage';
import { LoginPage } from '../LoginPage';
import { RegisterPage } from '../RegisterPage';
import './App.css';

const styles = /** @param {any} theme */theme => ({
  root: {
    flexGrow: 1
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
      <Grid container className={classes.root} spacing={16}>
        <Grid item xs={12}>
          <Paper>
            { alert.message && 
              <div className={`alert ${alert.type}`}>{alert.message}</div>
            }
            <Router history={history}>
              <div>
                <PrivateRoute exact path="/" component={HomePage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/register" component={RegisterPage} />
              </div>
            </Router>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  const { alert } = state;
  return {
    alert
  };
}

const styledComponent = withStyles(styles)(App);
const connectedApp = connect(mapStateToProps)(styledComponent);
export { connectedApp as App};
