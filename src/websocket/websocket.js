"use strict";

const WebSocket = require("ws");
const frontend = require("../frontendServer");

exports.init = (server, app, logger, config, route_path) => {

    const wss = new WebSocket.Server({noServer: true});
    server.on("upgrade", (request, socket, head) => {
        if (request.url.startsWith(route_path)) {
            wss.handleUpgrade(request, socket, head, (ws) => {
                // wss.emit("connection", ws, request);
            });
        }
    });

    wss.on("connection", function connection(ws, req) {
        if (req.url.startsWith(route_path)) {
            frontend._newWebSocketConnection(ws, req);
            //
            // ws.on("message", function incoming(message) {
            //
            // });
            // ws.send("something");
        }
    });

    return Promise.resolve(app);
};