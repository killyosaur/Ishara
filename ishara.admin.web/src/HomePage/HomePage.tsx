import React, { PropsWithChildren } from 'react';
import {
    Grid,
    Typography,
    createStyles,
    Theme,
    makeStyles
} from '@material-ui/core';
import NavMenu from './NavMenu';
import { User } from '../_models';

const useStyles = makeStyles(({ palette, spacing, mixins, breakpoints }: Theme) => createStyles({
    home: {
        height: '100%',
        display: 'flex'
    },
    content: {
        flexGrow: 1,
        backgroundColor: palette.background.default,
        padding: spacing(3),
        minWidth: 0, // So the Typography noWrap works
    },
    drawer: {
        [breakpoints.up('sm')]: {
          width: 250,
          flexShrink: 0,
        },
      },
      toolbar: mixins.toolbar
}));

type Props = PropsWithChildren<{user: User, isAdmin?: boolean, isAuthor?: boolean}>;

const HomePage: React.FC<Props> = props => {
    const classes = useStyles();
    const { user, children, isAdmin, isAuthor } = props;

    if(!user) {
        throw new Error('no valid user!');
    }

    return (
        <div className={classes.home}>
            <NavMenu user={user} isAdmin={isAdmin} isAuthor={isAuthor} className={classes.drawer} />
            <Grid className={classes.content}>
                <Typography component="h2" variant="h2" gutterBottom>
                    Hi {user.firstName}!
                </Typography>
                {children}
            </Grid>
        </div>
    );
};

export { HomePage };
