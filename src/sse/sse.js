"use strict";

const SSE = require("sse-express");
const frontend = require("../frontendServer");

exports.init = (server, app, logger, config, route_path) => {
    if (config) {
        // SSE endpoint
        app.get(route_path, SSE, (req, res) => {
            frontend._newSSEConnection(req, res);
            // res.sse("message", {"data": "initialized"});
        });
    }
    return Promise.resolve(app);
};
