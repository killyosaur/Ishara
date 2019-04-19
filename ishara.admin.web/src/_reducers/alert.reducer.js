// @ts-check
import { alertConstants } from '../_constants';

/** @param {{ type: string; message: string; }} action */
export function alert(state = {}, action) {
    switch(action.type) {
        case alertConstants.SUCCESS:
            return {
                type: 'alert-success',
                message: action.message
            };
        case alertConstants.ERROR:
            return {
                type: 'alert-danger',
                message: action.message
            };
        case alertConstants.CLEAR:
            return {};
        default:
            return state;
    }
}
