"use strict";
// core NodeJS modules
const fs = require("fs");
const path = require("path");

// own modules and configs
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")).toString());
const logger = require("./logger/logger");

// 3rd party modules
const express = require("express");
const bodyParser = require("body-parser");
// server initialization
const coreModules = ["compression", "proxy", "websocket", "assets", "heartbeat"];
const MAX_JSON_SIZE = "5bm";

let app = logger.init(express(), config.server.logger);
const server = require("http").createServer(app);
const io = require("socket.io")(server);

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
    });

server.listen(config.server.port, config.server.hostname);

require("./logger/logger").getLogger("system", "info")
    .log(`Started server on http://${config.server.hostname}:${config.server.port} in '${app.get("env")}' mode`);