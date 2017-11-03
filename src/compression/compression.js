"use strict";

const compression = require("compression");

exports.init = (server, app, logger, {level = 6, threshold = "10kb"} = {}) => {
    app.use(compression(
        {
            level: level,
            threshold: threshold,
            filter: (req, res) => compression.filter(req, res) && res.getHeader("Content-Type") !== "text/event-stream"
        }
    ))
    ;
    return Promise.resolve(app);
};