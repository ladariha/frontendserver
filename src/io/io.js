"use strict";

const IO = require("socket.io");
const ENDPOINT = "/_channel";

exports.init = (server, app, logger) => {

    const io = IO(server, {
        path: ENDPOINT
    });
    io.on("connection", function (sock) {
        logger.log("Connected client");
        sock.on("error", e => console.error(e));
        sock.on("message", function (data, callback) {
            const d = JSON.parse(JSON.stringify(data));
            d.type = "ack";
            logger.log("sending ack");
            callback(d);
        });
        setTimeout(() => {
            sock.emit("message", {a: 1}, function (ack) {
                logger.log("Client received " + ack);
            });
        }, 2000);


    });


    return Promise.resolve(app);
};