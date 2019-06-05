// @ts-check
import { postConstants } from '../_constants';

/** @param {{ type: string; posts: any[]; error: any; id: number; }} action */
export function posts(state = {}, action) {
  switch (action.type) {
    case postConstants.GETALL_REQUEST:
      return {
        loading: true
      };
    case postConstants.GETALL_SUCCESS:
      return {
        items: action.posts
      };
    case postConstants.GETALL_FAILURE:
      return { 
        error: action.error
      };
    case postConstants.DELETE_REQUEST:
      // add 'deleting:true' property to post being deleted
      return {
        ...state,
        items: state.items.map(/** @param {any} post */post =>
          post.id === action.id
            ? { ...post, deleting: true }
            : post
        )
      };
    case postConstants.DELETE_SUCCESS:
      // remove deleted post from state
      return {
        items: state.items.filter(/** @param {any} post */post => post.id !== action.id)
      };
    case postConstants.DELETE_FAILURE:
      // remove 'deleting:true' property and add 'deleteError:[error]' property to post 
      return {
        ...state,
        items: state.items.map(/** @param {any} post */post => {
          if (post.id === action.id) {
            // make copy of post without 'deleting:true' property
            const { deleting, ...postCopy } = post;
            // return copy of post with 'deleteError:[error]' property
            return { ...postCopy, deleteError: action.error };
          }

          return post;
        })
      };
      case postConstants.CREATE_REQUEST:
      case postConstants.CREATE_SUCCESS:
      case postConstants.CREATE_FAILURE:
      case postConstants.UPDATE_REQUEST:
      case postConstants.UPDATE_SUCCESS:
      case postConstants.UPDATE_FAILURE:
      default:
      return state
  }
}
