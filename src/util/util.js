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

    if (!isNull(userConfig) && defaults.length < 1) {
        return userConfig;
    }

    return defaults.map((v, i) => {
        if (isNull(v)) {
            return null;
        }
        if (isPrimitive(v)) {
            return isNull(userConfig[i]) ? v : userConfig[i];
        } else if (isArray(v)) {
            return _traverseArray(userConfig[i], v);
        } else {
            return _traverse(userConfig[i], v);
        }
    });

}

function _traverse(userConfig, defaults) {

    const currentConfig = {};
    const iteratedDefaults = new Set();
    for (let k of Object.keys(defaults)) {
        iteratedDefaults.add(k);
        if (isNull(defaults[k])) {
            continue;
        }
        if (isPrimitive(defaults[k])) {
            currentConfig[k] = isNull(userConfig[k]) ? defaults[k] : userConfig[k];
        } else if (isArray(defaults[k])) {
            currentConfig[k] = _traverseArray(userConfig[k], defaults[k]);
        } else {
            currentConfig[k] = _traverse(userConfig[k], defaults[k]);
        }
    }

    for (let k of Object.keys(userConfig)) {
        if (!iteratedDefaults.has(k)) {
            currentConfig[k] = userConfig[k];
        }
    }

    return currentConfig;
}


exports.resolveConfiguration = (userConfig, defaults) => _traverse(userConfig, defaults);
exports.isNull = isNull;
