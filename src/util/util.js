"use strict";

function isNull(x) {
    return x === null || typeof x === "undefined";
}

function isPrimitive(v) {
    const type = typeof v;
    return !isNull(v) && type !== "object" && type !== "function";
}

function isArray(v) {
    return !isNull(v) && typeof v.forEach === "function";
}

function _traverseArray(userConfig, defaults) {

    return defaults.map((v, i) => {
        if (isNull(v)) {
            return null;
        }
        if (isPrimitive(v)) {
            return isNull(userConfig[i]) ? v : userConfig[i];
        } else if (isArray(v)) {
            return _traverseArray(userConfig[i], v);
        } else {
            return _traverseObject(userConfig[i], v);
        }
    });

}

function _traverseObject(userConfig, defaults) {

    const currentConfig = {};
    for (let k of Object.keys(defaults)) {
        if (isNull(defaults[k])) {
            continue;
        }
        if (isPrimitive(defaults[k])) {
            currentConfig[k] = isNull(userConfig[k]) ? defaults[k] : userConfig[k];
        } else if (isArray(defaults[k])) {
            currentConfig[k] = _traverseArray(userConfig[k], defaults[k]);
        } else {
            currentConfig[k] = _traverseObject(userConfig[k], defaults[k]);
        }
    }

    return currentConfig;
}


exports.resolveConfiguration = (userConfig, defaults) => _traverseObject(userConfig, defaults);
exports.isNull = isNull;