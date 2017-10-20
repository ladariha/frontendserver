"use strict";
const logger = require("./logger/logger");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cluster = require("cluster");
const MAX_REQUESTS = 10000 + Math.round(Math.random() * 10000);
let requestCount = 0;
exports.start = config => {

    const coreModules = ["compression", "proxy", "websocket", "assets", "heartbeat"];

    if (process.env.PM2_SETUP) {
        coreModules.unshift("pm2monitor");
    }

    const MAX_JSON_SIZE = "5bm";

    let app = logger.init(express(), config.server.logger);
    const systemLogger = logger.getLogger("system", "info");
    const server = http.createServer(app);

    app.all("*", (req, res, next) => {
        requestCount++;
        if (requestCount >= MAX_REQUESTS && MAX_REQUESTS > -1) {
            systemLogger.log("Maximum number of requests reached, restarting");
            res.status(503);
            res.set("Retry-After", 7);
            res.send();
            cluster.worker.kill();
        } else {
            next();
        }
    });
    app = coreModules.reduce((acc, coreModule) => {
        return require(`./${coreModule}/${coreModule}`).init(server, acc, logger.getLogger(coreModule), config.server[coreModule]);
    }, app);
    app
        .use(bodyParser.json({limit: MAX_JSON_SIZE})) // to support JSON-encoded bodies
        .use(bodyParser.urlencoded({
            extended: true,
            limit: MAX_JSON_SIZE
        }))
        .use((err, req, res, next) => {
            require("./logger/logger").getLogger("error", "info").log(err.stack);
            res.status(500).send();
            cluster.worker.kill(); // restart on error
        });

    server.listen(config.server.port, config.server.hostname);

    systemLogger.log(`Started server on http://${config.server.hostname}:${config.server.port} in '${app.get("env")}' mode`);

};