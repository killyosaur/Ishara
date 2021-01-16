import { Post } from "../";

export interface PostState {
    post: Post;
    deleting: boolean;
}

export interface PostsState {
    loading: boolean;
    loaded: boolean;
    posts: PostState[];
    error?: Error;
}