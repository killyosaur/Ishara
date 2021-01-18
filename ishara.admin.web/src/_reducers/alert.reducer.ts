import { AlertActionTypes, BaseAlertAction } from '../_actions';
import { alertConstants } from '../_constants';
import {AlertState} from '../_models/state';

const initialState: AlertState = { message: '', variant: undefined, key: 0 };
export function alert(state = initialState, action: AlertActionTypes) {
    switch(action.type) {
        case alertConstants.SUCCESS:
        case alertConstants.ERROR:
        case alertConstants.INFORMATION:
        case alertConstants.WARNING:
            var baseAction = action as BaseAlertAction;
            return {
                    key: action.key,
                    message: baseAction.message,
                    options: {
                        ...baseAction.options
                    }
                };
        case alertConstants.CLEAR:
            return initialState;
        default:
            return state;
    }
}
