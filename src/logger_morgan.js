"use strict";

const path = require("path");
const fs = require("fs");

const morgan = require("morgan");
const uuid = require("uuid");
const logRotate = require("rotating-file-stream");

const LOG_TEMPLATE = "[:date[iso]] #:id :method :url :status :response-time ms";
const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE_NAME = "access.log";

exports.init = (app, loggerConfiguration) => {

    fs.existsSync(LOG_DIR) || fs.mkdirSync(LOG_DIR);

    // add request ID to each response and log requests
    morgan.token("id", function getId(req) {
        return req.id;
    });
    app.use((req, res, next) => {
        req.id = uuid.v4();
        res.set("X-Request-Id", req.id);
        res.removeHeader("X-Powered-By");
        next();
    });

    const logStream = logRotate(path.join(LOG_DIR, LOG_FILE_NAME), {
        size: "10M",
        interval: loggerConfiguration.interval || "1d",
        maxFiles: loggerConfiguration.maxFiles || 5,
        compress: "gzip"
    });

    app.use(morgan(LOG_TEMPLATE, {
        stream: logStream,
        skip: (req, res) => res.statusCode < loggerConfiguration.minStatusCode || res.statusCode > loggerConfiguration.maxStatusCode
    }));

    return app;
};