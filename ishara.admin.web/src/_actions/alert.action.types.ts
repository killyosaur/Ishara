import { alertConstants } from '../_constants';

export interface BaseAlertAction {
    type: string
    key: number
    options: {
        variant: 'success' | 'error' | 'info' | 'warning' | undefined
    }
    message: string
}

export interface SuccessAlertAction extends BaseAlertAction {
    type: typeof alertConstants.SUCCESS
    options: {
        variant: 'success'
    }
}

export interface ErrorAlertAction extends BaseAlertAction {
    type: typeof alertConstants.ERROR
    options: {
        variant: 'error'
    }
}

export interface InfoAlertAction extends BaseAlertAction {
    type: typeof alertConstants.INFORMATION
    options: {
        variant: 'info'
    }
}

export interface WarnAlertAction extends BaseAlertAction {
    type: typeof alertConstants.WARNING
    options: {
        variant: 'warning'
    }
}

export interface ClearAlertAction {
    type: typeof alertConstants.CLEAR
    key: number
}

export type AlertActionTypes = SuccessAlertAction | 
    ErrorAlertAction | 
    InfoAlertAction | 
    WarnAlertAction |
    ClearAlertAction;