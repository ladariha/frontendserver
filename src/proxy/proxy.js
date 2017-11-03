"use strict";

const url = require("url");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({
    ws: true,
    timeout: 0,
    secure: false // TODO
});
const PROXY_TARGET_HEADER = "x-frontend-proxy-target";
const PROXY_ENDPOINT = "/_proxy";
exports.PROXY_TARGET_HEADER = PROXY_TARGET_HEADER;
exports.init = (server, app) => {

    server.on("upgrade", function (req, socket, head) {
        if (req.url.startsWith(PROXY_ENDPOINT)) {
            let target = req.headers[PROXY_TARGET_HEADER];
            if (!target) {
                target = url.parse(req.url, true).query[PROXY_TARGET_HEADER];
            }

            proxy.ws(req, socket, head, {
                target: target,
                timeout: 0
            });
        }
    });

    app.use(PROXY_ENDPOINT, (req, res) => {
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