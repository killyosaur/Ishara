// @ts-check
import React from 'react';
import { alertConstants } from '../_constants';
import {Button} from '@material-ui/core';
import {Close} from '@material-ui/icons';

export const alertActions = {
    success,
    error,
    information,
    warning,
    clear,
    clearAll,
    remove
};

/**  @param {string} message */
function success(message) {
    return { type: alertConstants.SUCCESS, message, options: getOptions('success') };
}

/** @param {string} message */
function error(message) {
    return { type: alertConstants.ERROR, message, options: getOptions('error') };
}

/** @param {string} message */
function warning(message) {
    return { type: alertConstants.WARNING, message, options: getOptions('warn') };
}

/** @param {string} message */
function information(message) {
    return { type: alertConstants.INFORMATION, message, options: getOptions('info') };
}

/**
 * @param {any} key
 */
function clear(key) {
    return { type: alertConstants.CLEAR, key };
}

function clearAll() {
    return { type: alertConstants.CLEARALL };
}

/**
 * @param {any} key
 */
function remove(key) {
    return {type: alertConstants.REMOVE, key };
}

/**
 * @param {string} variant
 */
function getOptions(variant) {
    return {
        variant,
        action: /** @param {any} key */key => (
            <Button onClick={() => clear(key)}><Close /></Button>
        ),
        key: new Date().getTime() + Math.random()
    };
}