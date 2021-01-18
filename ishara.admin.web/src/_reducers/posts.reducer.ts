import { ErrorPayload, IdPayload, PostActionTypes, PostPayload, PostsPayload } from '../_actions';
import { postConstants } from '../_constants';
import { PostsState, PostState } from '../_models/state';

const initialState: PostsState = {
  loading: false,
  loaded: false,
  posts: []
};

export function posts(state = initialState, action: PostActionTypes) {
  switch (action.type) {
    case postConstants.GETALL_REQUEST:
      return {
        ...state,
        loading: true
      };
    case postConstants.GETALL_SUCCESS:
      const getSuccPayload = action.payload as PostsPayload;
      return {
        ...state,
        loading: false,
        loaded: true,
        posts: getSuccPayload.posts.map<PostState>(post => {
          return {post, deleting: false};
        })
      };
    case postConstants.DELETE_REQUEST:
      // add 'deleting:true' property to post being deleted
      const delReqPayload = action.payload as IdPayload;
      return {
        ...state,
        posts: state.posts.map<PostState>(i =>
          i.post.id === delReqPayload.id
            ? { ...i, deleting: true }
            : i
        )
      };
    case postConstants.DELETE_SUCCESS:
      // remove deleted post from state
      const delSuccPayload = action.payload as IdPayload;
      return {
        ...state,
        posts: state.posts.filter(i => i.post.id !== delSuccPayload.id)
      };
    case postConstants.DELETE_FAILURE:
      const delErrPayload = action.payload as IdPayload;
      // remove 'deleting:true' property and add 'deleteError:[error]' property to post 
      return {
        ...state,
        posts: state.posts.map<PostState>(i => {
          if (i.post.id === delErrPayload.id) {
            // return copy of post with 'deleteError:[error]' property
            return { ...i, deleteError: delErrPayload.error };
          }

          return i;
        })
      };
      case postConstants.UPDATE_SUCCESS:
        const updSuccPayload = action.payload as PostPayload;
        const updPosts = state.posts.map(i => {
          if (i.post.id === updSuccPayload.post.id) {
            i.post = updSuccPayload.post;
          }

          return i;
        });
        
        return {
          ...state,
          posts: updPosts
        };
      case postConstants.CREATE_SUCCESS:
        const creSuccPayload = action.payload as PostPayload;
        const posts = [...state.posts, {post: creSuccPayload.post, deleting: false}];
        return {
          ...state,
          posts
        };
      case postConstants.GETALL_FAILURE:
      case postConstants.UPDATE_FAILURE:
      case postConstants.CREATE_FAILURE:
        const errPayload = action.payload as ErrorPayload;
        return {
          ...state,
          loaded: true,
          loading: false,
          error: errPayload.error
        }
      case postConstants.CREATE_REQUEST:
      case postConstants.UPDATE_REQUEST:
      default:
        return state
  }
}
