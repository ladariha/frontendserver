"use strict";
/**
 * General error to be passed as parameter to promise's reject function
 * @param {string} type
 * @param {object} msg
 * @param {object} data
 * @returns {PromiseError}
 */
function PromiseError(type, msg, data) {
    this.type = type;
    this.msg = msg || "unknown";
    this.data = data;
}

PromiseError.BadRequest = "BadRequest";
PromiseError.DatabaseError = "DatabaseError";
PromiseError.Unauthorized = "Unauthorized";
PromiseError.NotFound = "NotFound";
module.exports = PromiseError;
