import logo from '../logo.svg';
import React from 'react';
import { 
  createMuiTheme,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Grid,
  makeStyles,
  Theme
} from '@material-ui/core';
import { ThemeProvider, createStyles } from '@material-ui/styles';
import { Router, Route } from 'react-router-dom';

import './App.css';
import {history} from '../_infrastructure/history';
import { Posts } from '../Posts';

const useStyles = makeStyles((theme: Theme) => createStyles({
  '@global': {
    '.root': {
        height: '100%',
        backgroundColor: theme.palette.background.default
      } 
  },
  grid: {
    flexGrow: 1,
    position: 'relative',
    height: '100%',
    display: 'flex',
    marginTop: '75px'
  },
  logo: {
    height: '4rem'
  },
  title: {
    fontFamily: 'cf_anarchyregular !important',
    '& span': {
      fontFamily: 'saira_stencil_oneregular'
    }
  },
  titleToolbar: {
    justifyContent: 'center'
  }
}));

const App: React.FC = () => {
  const theme = createMuiTheme({
    palette: {},
  });

  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Grid container className={classes.grid}>
          <AppBar position="fixed" color="inherit">
            <Toolbar className={classes.titleToolbar}>
              <img src={logo} alt="logo" className={classes.logo} />
              <Typography variant="h3" className={classes.title}>
                narchy <span>for Sale</span>
              </Typography>
            </Toolbar>
          </AppBar>
          <Router history={history}>
            <Route path="/" component={Posts} />
          </Router>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
