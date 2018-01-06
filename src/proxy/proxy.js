"use strict";

const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({
    timeout: 0,
    secure: false // TODO
});
const PROXY_TARGET_HEADER = "x-frontend-proxy-target";

exports.PROXY_TARGET_HEADER = PROXY_TARGET_HEADER;
exports.init = (server, app, logger, config, route_path) => {

    app.use(route_path, (req, res) => {
        let target = req.headers[PROXY_TARGET_HEADER];
        if (!target) {
            target = req.query[PROXY_TARGET_HEADER];
        }
        proxy.web(req, res, {
            target: target,
            timeout: 0
        });
    });
    return Promise.resolve(app);
};