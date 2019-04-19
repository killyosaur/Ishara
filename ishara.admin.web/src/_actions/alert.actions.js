// @ts-check
import { alertConstants } from '../_constants';

export const alertActions = {
    success,
    error,
    clear
};

/**  @param {string} message */
function success(message) {
    return { type: alertConstants.SUCCESS, message };
}

/** @param {string} message */
function error(message) {
    return { type: alertConstants.ERROR, message };
}

function clear() {
    return { type: alertConstants.CLEAR };
}