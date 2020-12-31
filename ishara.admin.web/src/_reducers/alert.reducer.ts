// @ts-check
import { alertConstants } from '../_constants';

/** @param {{ type: string; message: string; options: any, key: string }} action */
export function alert(state = [], action) {
    switch(action.type) {
        case alertConstants.SUCCESS:
        case alertConstants.ERROR:
        case alertConstants.INFORMATION:
        case alertConstants.WARNING:
            return [
                ...state,
                {
                    key: action.options.key,
                    message: action.message,
                    options: {
                        ...action.options
                    }
                }
            ];
        case alertConstants.CLEAR:
            return state.map(n => n.key === action.key ? {...n, dismissed: true} : { ...n });
        case alertConstants.CLEARALL:
            return state.map(n => { return {...n, dismissed: true}; });
        case alertConstants.REMOVE:
            return state.filter(notification => notification.key !== action.key)
        default:
            return state;
    }
}
