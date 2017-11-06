"use strict";

const path = require("path");

const uuid = require("uuid");
require("winston-logrotate");
const {Logger, transports} = require("winston");
const expressWinston = require("express-winston");

const LOG_TEMPLATE = "[http] Req #{{req.id}} {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms";
const LOG_DIR = path.join(__dirname, "..", "..", "logs");
const LOG_FILE_NAME = "frontend.log";

let defaultTransport = null;
let defaultLogLevel = null;

exports.init = (app, loggerConfiguration) => {
    defaultLogLevel = loggerConfiguration.logLevel;
    defaultTransport = new transports.Rotate({
        file: path.join(LOG_DIR, LOG_FILE_NAME), // this path needs to be absolute
        colorize: false,
        timestamp: () => `[${new Date().toISOString()}]`,
        json: false,
        level: defaultLogLevel,
        size: "10m",
        keep: loggerConfiguration.maxFiles,
        compress: false
    });

    return app
        .use((req, res, next) => {
            req.id = uuid.v4();
            res.set("X-Request-Id", req.id);
            res.removeHeader("X-Powered-By");
            next();
        })
        .use(expressWinston.logger({
            transports: [
                defaultTransport
            ],
            level: defaultLogLevel,
            meta: false, // optional: control whether you want to log the meta data about the request (default to true)
            msg: LOG_TEMPLATE, // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
            expressFormat: false, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
            colorStatus: false, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
            // ignoreRoute: function (req, res) {
            //     return false;
            // }, // optional: allows to skip some log messages based on request and/or response
            skip: (req, res) => {
                return res.statusCode < loggerConfiguration.minStatusCode || res.statusCode > loggerConfiguration.maxStatusCode;
            }
        }));
};

exports.getLogger = (prefix = "", logLevel = defaultLogLevel) => {
    const logger = new Logger({
        msg: prefix,
        transports: [defaultTransport]
    });

    let oldLog = logger.log;
    logger.log = function (msg) {
        oldLog.apply(this, [logLevel, `[${prefix}] ${msg}`]);
        return this;
    };

    return logger;
};
