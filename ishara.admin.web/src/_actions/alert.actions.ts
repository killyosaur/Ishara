import { alertConstants } from '../_constants';
import {ClearAlertAction, ErrorAlertAction, InfoAlertAction, SuccessAlertAction, WarnAlertAction} from './alert.action.types'

export const alertActions = {
    success,
    error,
    information,
    warning,
    clear
};

function success(message: string): SuccessAlertAction {
    return { key: new Date().getTime() + Math.random(), type: alertConstants.SUCCESS, message, options: {variant: 'success'} };
}

function error(message: string): ErrorAlertAction {
    return { key: new Date().getTime() + Math.random(), type: alertConstants.ERROR, message, options: {variant: 'error'} };
}

function warning(message: string): WarnAlertAction {
    return { key: new Date().getTime() + Math.random(), type: alertConstants.WARNING, message, options: {variant: 'warning'} };
}

function information(message: string): InfoAlertAction {
    return { key: new Date().getTime() + Math.random(), type: alertConstants.INFORMATION, message, options: {variant: 'info'} };
}

function clear(): ClearAlertAction {
    return { type: alertConstants.CLEAR, key: 0 };
}
