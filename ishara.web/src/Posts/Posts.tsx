import  React, {useState, useEffect} from 'react';
import { Grid, Paper, Typography, makeStyles, Divider } from '@material-ui/core';
import {format} from 'date-fns';
import { Post, PostService } from '../_services';
import settings from "../settings";

const emptyPosts: Post[] = [];

const useStyles = makeStyles({
    paper: {
        marginBottom: '2rem',
        padding: '15px',
        '& h4': {
            fontSize: '2rem'
        },
        '& p': {
            marginBottom: '0.5rem',
            marginTop: '0.5rem'
        },
        '& small': {
            fontSize: '0.75rem',
            display: 'inline-block',
            height: '100%'
        }
    },
    horizontalDivider: {
        borderRight: '1px rgba(255, 255, 255, 0.12) solid',
        marginRight: '0.35rem',
        paddingRight: '0.35rem'
    }
});

function Posts() {
    const classes = useStyles();
    const {pageCount} = settings;

    const [data, setData] = useState({
        posts: emptyPosts,
        total: 0,
        pages: {
            next: 0,
            prev: 0,
        }
    });

    const [page, setPage] = useState(0);
    
    useEffect(() => {
        async function fetchData() {
            const {posts, nextPage, prevPage, total} = await new PostService().getAll();
            setData({
                posts, 
                total,
                pages: { next: nextPage, prev: prevPage }
            });
        }

        fetchData();
    }, [page, pageCount])

    return (<Grid item xs={12}>
        {
            data.posts.map((p: Post) => 
            <Paper className={classes.paper} key={p.id}>
                <Typography variant="h4" component="h4">
                    {p.title}
                </Typography>
                <Divider />
                <Typography variant="body1">
                    {p.content}
                </Typography>
                <Divider />
                <Grid item xs={12} direction="row" alignItems="flex-start">
                    <Typography variant="subtitle1" className={classes.horizontalDivider}>
                        {p.author.username}
                    </Typography>
                    <Typography variant="subtitle1">
                        {format(p.publishedOn, settings.dateFormat)}
                    </Typography>
                </Grid>
            </Paper>)
        }
    </Grid>);
}

export default Posts;
