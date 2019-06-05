// @ts-check
import { postConstants } from '../_constants';
import { postService } from '../_services';
import { alertActions } from '.';

export const postActions = {
    update,
    create,
    getAll,
    delete: _delete
};

/** @param {string} userId, @param {any} post */
function create(userId, post) {
    return /** @param {Function} dispatch */ dispatch => {
        dispatch(request(userId, post));

        postService.create(userId, post)
            .then(
                /** @param {string} postId */
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

        /** @param {string} userId, @param {any} post */
        function request(userId, post) { return { type: postConstants.CREATE_REQUEST, userId, post } }
        /** @param {string} userId, @param {any} post */
        function success(userId, post) { return { type: postConstants.CREATE_SUCCESS, userId, post } }
        /** @param {string} error */
        function failure(error) { return { type: postConstants.CREATE_FAILURE, error } }
}

/** @param {string} userId, @param {any} post */
function update(userId, post) {
    return /** @param {Function} dispatch */ dispatch => {
        dispatch(request(userId, post));

        postService.update(userId, post)
            .then(
                /** @param {string} postId */
                postId => {
                    post.id = postId;
                    dispatch(success(userId, post));
                    dispatch(alertActions.success('Post update successful'));
                },
                /** @param {Error} error */
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
        };

        /** @param {string} userId, @param {any} post */
        function request(userId, post) { return { type: postConstants.UPDATE_REQUEST, userId, post } }
        /** @param {string} userId, @param {any} post */
        function success(userId, post) { return { type: postConstants.UPDATE_SUCCESS, userId, post } }
        /** @param {string} error */
        function failure(error) { return { type: postConstants.UPDATE_FAILURE, error } }
}

/** @param {string} userId */
function getAll(userId) {
    return /** @param {Function} dispatch */ dispatch => {
        dispatch(request());

        postService.getAll(userId)
            .then(
                /** @param {any[]} posts */
                posts => dispatch(success(posts)),
                /** @param {Error} error */
                error => dispatch(failure(error.toString()))
            );
    };

    function request() { return { type: postConstants.GETALL_REQUEST } }
    /** @param {any[]} posts */
    function success(posts) { return { type: postConstants.GETALL_SUCCESS, posts } }
    /** @param {string} error */
    function failure(error) { return { type: postConstants.GETALL_FAILURE, error } }
}

// prefixed function name with underscore because delete is a reserved word in javascript
/** @param {string} userId, @param {string} id */
function _delete(userId, id) {
    return /** @param {Function} dispatch */ dispatch => {
        dispatch(request(id));

        postService.delete(userId, id)
            .then(
                /** @param {any} user */
                () => dispatch(success(id)),
                /** @param {Error} error */
                error => dispatch(failure(id, error.toString()))
            );
    };

    /** @param {string} id */
    function request(id) { return { type: postConstants.DELETE_REQUEST, id } }
    /** @param {string} id */
    function success(id) { return { type: postConstants.DELETE_SUCCESS, id } }
    /**
     * @param {string} id 
     * @param {string} error
     */
    function failure(id, error) { return { type: postConstants.DELETE_FAILURE, id, error } }
}