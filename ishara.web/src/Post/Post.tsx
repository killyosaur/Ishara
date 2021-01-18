import React, {FC, useEffect} from 'react';

const Post: FC = () => {
    useEffect(() => {
        document.title = 'title of the post';
    }, []);
    return (<div></div>);
};

export {Post};