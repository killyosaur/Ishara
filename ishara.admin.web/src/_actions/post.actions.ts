import { postConstants } from '../_constants';
import { postService } from '../_services';
import { alertActions } from '.';
import { Post } from '../_models';
import { PostCreateFailureActionType, PostCreateRequestActionType, PostCreateSuccessActionType, PostDeleteFailureActionType, PostDeleteRequestActionType, PostDeleteSuccessActionType, PostGetAllFailureActionType, PostGetAllRequestActionType, PostGetAllSuccessActionType, PostUpdateFailureActionType, PostUpdateRequestActionType, PostUpdateSuccessActionType } from './post.action.types';

export const postActions = {
    update,
    create,
    getAll,
    delete: _delete
};

function create(userId: string, post: Post) {
    return (dispatch: Function) => {
        dispatch(request(userId, post));

        postService.create(userId, post)
            .then(
                postId => {
                    post.id = postId;
                    dispatch(success(userId, post));
                    dispatch(alertActions.success('Post successful'));
                },
                /** @param {Error} error */
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
        };

    function request(userId: string, post: Post): PostCreateRequestActionType { return { type: postConstants.CREATE_REQUEST, payload: {userId, post} } }
    function success(userId: string, post: Post): PostCreateSuccessActionType { return { type: postConstants.CREATE_SUCCESS, payload: {userId, post} } }
    function failure(error: Error): PostCreateFailureActionType { return { type: postConstants.CREATE_FAILURE, payload: {error} } }
}

function update(userId: string, post: Post) {
    return (dispatch: Function) => {
        dispatch(request(userId, post));

        postService.update(userId, post)
            .then(
                postId => {
                    post.id = postId;
                    dispatch(success(userId, post));
                    dispatch(alertActions.success('Post update successful'));
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
        };

    function request(userId: string, post: Post): PostUpdateRequestActionType { return { type: postConstants.UPDATE_REQUEST, payload: {userId, post} } }
    function success(userId: string, post: Post): PostUpdateSuccessActionType { return { type: postConstants.UPDATE_SUCCESS, payload: {userId, post} } }
    function failure(error: Error): PostUpdateFailureActionType { return { type: postConstants.UPDATE_FAILURE, payload: {error} } }
}

function getAll(userId: string) {
    return (dispatch: Function) => {
        dispatch(request());

        postService.getAll(userId)
            .then(
                posts => dispatch(success(posts)),
                error => dispatch(failure(error.toString()))
            );
    };

    function request(): PostGetAllRequestActionType { return { type: postConstants.GETALL_REQUEST } }
    function success(posts: Post[]): PostGetAllSuccessActionType { return { type: postConstants.GETALL_SUCCESS, payload: {posts} } }
    function failure(error: Error): PostGetAllFailureActionType { return { type: postConstants.GETALL_FAILURE, payload: {error} } }
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(userId: string, id: string) {
    return (dispatch: Function) => {
        dispatch(request(id));

        postService.delete(userId, id)
            .then(
                () => dispatch(success(id)),
                error => dispatch(failure(id, error.toString()))
            );
    };

    function request(id: string): PostDeleteRequestActionType { return { type: postConstants.DELETE_REQUEST, payload: {id} } }
    function success(id: string): PostDeleteSuccessActionType { return { type: postConstants.DELETE_SUCCESS, payload: {id} } }
    function failure(id: string, error: Error): PostDeleteFailureActionType { return { type: postConstants.DELETE_FAILURE, payload: {id, error} } }
}