import { postConstants } from "../_constants";
import { Post } from "../_models";

export interface ErrorPayload {
    error: Error;
}

export interface PostPayload {
    userId: string;
    post: Post;
}

export interface PostsPayload {
    posts: Post[];
}

export interface PostIdPayload {
    id: string;
    error?: Error;
}

export interface PostCreateRequestActionType { 
    type: typeof postConstants.CREATE_REQUEST;
    payload: PostPayload;
}
export interface PostCreateSuccessActionType { 
    type: typeof postConstants.CREATE_SUCCESS;
    payload: PostPayload;
}
export interface PostCreateFailureActionType { 
    type: typeof postConstants.CREATE_FAILURE;
    payload: ErrorPayload;
}

export interface PostDeleteRequestActionType { 
    type: typeof postConstants.DELETE_REQUEST;
    payload: PostIdPayload;
}
export interface PostDeleteSuccessActionType { 
    type: typeof postConstants.DELETE_SUCCESS;
    payload: PostIdPayload;
}
export interface PostDeleteFailureActionType { 
    type: typeof postConstants.DELETE_FAILURE;
    payload: PostIdPayload;
}

export interface PostGetAllRequestActionType { 
    type: typeof postConstants.GETALL_REQUEST;
    payload?: undefined;
}
export interface PostGetAllSuccessActionType { 
    type: typeof postConstants.GETALL_SUCCESS;
    payload: PostsPayload;
}
export interface PostGetAllFailureActionType { 
    type: typeof postConstants.GETALL_FAILURE;
    payload: ErrorPayload;
}

export interface PostUpdateRequestActionType { 
    type: typeof postConstants.UPDATE_REQUEST;
    payload: PostPayload;
}
export interface PostUpdateSuccessActionType { 
    type: typeof postConstants.UPDATE_SUCCESS;
    payload: PostPayload;
}
export interface PostUpdateFailureActionType { 
    type: typeof postConstants.UPDATE_FAILURE;
    payload: ErrorPayload;
}

export type PostActionTypes =
    PostCreateFailureActionType |
    PostCreateRequestActionType |
    PostCreateSuccessActionType |
    PostGetAllFailureActionType |
    PostGetAllRequestActionType |
    PostGetAllSuccessActionType |
    PostUpdateFailureActionType |
    PostUpdateRequestActionType |
    PostUpdateSuccessActionType |
    PostDeleteFailureActionType |
    PostDeleteRequestActionType |
    PostDeleteSuccessActionType;