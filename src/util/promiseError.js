"use strict";

const logger = require("../logger/logger").getLogger("ErrorLogger", "error");


/**
 * General error to be passed as parameter to promise's reject function
 * @param {string} type
 * @param {Error|string} err

 * @returns {PromiseError}
 */
function PromiseError(type, err) {
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.type = type;
    if (typeof err === "string") {
        this.message = err;
        logger.log(`${this.type} : ${this.message}\n ${this.stack}`);
    } else {
        this.message = err.message;
        logger.log(`${this.type} : ${this.message} \n ${err.stack}`);
    }
}

PromiseError.BadRequest = "BadRequest";
PromiseError.FileAlreadyExists = "FileAlreadyExists";
PromiseError.GeneralError = "GeneralError";
PromiseError.DatabaseError = "DatabaseError";
PromiseError.Unauthorized = "Unauthorized";
PromiseError.NotFound = "NotFound";
module.exports = PromiseError;
