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
  }
}));

const App: React.FC = () => {
  const theme = createMuiTheme({
    palette: {
      type: 'dark'
    },
    props: {
      MuiTypography: {
        variantMapping: {
          subtitle1: 'small'
        }    
      }
    }
  });

  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Grid container className={classes.grid}>
          <AppBar position="fixed" color="inherit">
            <Toolbar>
              <Typography variant="h6">
                Anarchy for Sale
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
