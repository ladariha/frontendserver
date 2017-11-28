"use strict";

const logger = require("../logger/logger").getLogger("ErrorLogger", "error");


/**
 * General error to be passed as parameter to promise's reject function
 * @param {string} type
 * @param {Error|string} [err]

 * @returns {PromiseError}
 */
function PromiseError(type, err) {
    if (err instanceof PromiseError) {
        return err;
    }
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.type = type;
    if (typeof err === "string") {
        this.message = err;
        logger.log(`${this.type} : ${this.message}\n ${this.stack}`);
    } else if (err !== null && typeof err !== "undefined") {
        this.message = err.message;
        logger.log(`${this.type} : ${this.message} \n ${err.stack}`);
    } else {
        this.message = "error";
    }
}

PromiseError.BadRequest = "BadRequest";
PromiseError.FileAlreadyExists = "FileAlreadyExists";
PromiseError.GeneralError = "GeneralError";
PromiseError.WebSocketFormatError = "WebSocketFormatError";
PromiseError.UnsupportedOperation = "UnsupportedOperation";
PromiseError.DatabaseError = "DatabaseError";
PromiseError.Unauthorized = "Unauthorized";
PromiseError.NotFound = "NotFound";
PromiseError.createGeneralError = err => new PromiseError(PromiseError.GeneralError, err);
module.exports = PromiseError;
