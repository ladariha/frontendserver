"use strict";
const logger = require("./logger/logger");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cluster = require("cluster");

exports.start = config => {

    const MAX_REQUESTS = config.server.maxRequestsBeforeRestart; //10000 + Math.round(Math.random() * 10000);
    const coreModules = ["compression", "proxy", "websocket", "assets", "heartbeat", "apiEndpoints", "sseProxy", "messaging"];

    if (process.env.PM2_SETUP) {
        coreModules.unshift("pm2monitor");
    }

    const MAX_JSON_SIZE = "5mb";

    let app = logger.init(express(), config.server.logger);
    app.locals.startTime = new Date();
    app.locals.requestCount = 0;
    const systemLogger = logger.getLogger("system", "info");
    const server = http.createServer(app);

    if(MAX_REQUESTS > -1) {
        app.all("*", (req, res, next) => {
            app.locals.requestCount++;
            if (app.locals.requestCount >= MAX_REQUESTS && MAX_REQUESTS > -1) {
                systemLogger.log("Maximum number of requests reached, restarting");
                res.status(503);
                res.set("Retry-After", 7);
                res.send();
                cluster.worker.kill();
            } else {
                next();
            }
        });
    }
    app.use(bodyParser.json({limit: MAX_JSON_SIZE})) // to support JSON-encoded bodies
       .use(bodyParser.urlencoded({
           extended: true,
           limit: MAX_JSON_SIZE
        }));
    
    let pr = Promise.resolve(app);

    for (let coreModule of coreModules) {
        pr = pr.then(app => require(`./${coreModule}/${coreModule}`).init(server, app, logger.getLogger(coreModule), config.server[coreModule]));
    }

    pr.then(app => {
        app
            .use((err, req, res, next) => { // default error handler
                require("./logger/logger").getLogger("error", "info").log(err.stack);
                res.status(503).send(); // reply
                cluster.worker.kill(); // restart on error
            });

        server.listen(config.server.port, config.server.hostname);

        systemLogger.log(`Started server on http://${config.server.hostname}:${config.server.port} in '${app.get("env")}' mode`);
    });


};
