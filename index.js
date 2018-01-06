"use strict";

const server = require("./src/index");

if (require.main === module) {
    server.init(true);
}

module.exports = (startServer = true) => {
    server.init(startServer);
};