'use strict';

export default {
    on,
    off,
    emit
}

const gEvents = {};

function on(eventName, cbFunc) {
    gEvents[eventName] = cbFunc;
}

function off(eventName) {
    delete gEvents[eventName];
}

function emit(eventName, ...args) {
    return gEvents[eventName](...args);
}

window.gEvents = gEvents;