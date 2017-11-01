"use strict";
const SSE = require("sse-express");
const PROXY_TARGET_HEADER = require("../proxy/proxy").PROXY_TARGET_HEADER;
const SSE_ENDPOINT = "/_sseproxy";

exports.init = (server, app) => {

    app.get(SSE_ENDPOINT, SSE, (req, res) => {
        let target = req.headers[PROXY_TARGET_HEADER];
        if (!target) {
            target = req.query[PROXY_TARGET_HEADER];
        }
        res.sse("message", "Welcome");
        setInterval(() => res.sse("message", new Date().toUTCString()), 1000);
    });

    return Promise.resolve(app);
};