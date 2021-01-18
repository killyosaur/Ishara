import React from 'react';
import { useSelector } from 'react-redux';
import { Snackbar, makeStyles, Theme } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/core/Alert';
import { BaseAlertAction } from '../_actions';

const Alert = React.forwardRef((props: AlertProps, ref) => 
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

const useStyles = makeStyles((theme: Theme) => ({
    root: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
    alert: {
      width: '100%',
    },
  })
);

function Notifier() {
    const classes = useStyles();
    const notification = useSelector((state: { alert: BaseAlertAction }) => state.alert);

    return (<Snackbar open={!!notification?.message}>
        <Alert severity={notification?.options?.variant || 'success'} className={classes.alert}>
            {notification?.message}
        </Alert>
    </Snackbar>);
}

export default Notifier