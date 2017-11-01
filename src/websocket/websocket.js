"use strict";

const WebSocket = require("ws");
const WS_ENDPOINT = "/_ws";

exports.init = (server, app) => {

    const wss = new WebSocket.Server({noServer: true});
    server.on("upgrade", (request, socket, head) => {
        if (request.url.startsWith(WS_ENDPOINT)) {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit("connection", ws, request);
            });
        }
    });

    wss.on("connection", function connection(ws, req) {
        if (req.url.startsWith(WS_ENDPOINT)) {
            ws.on("message", function incoming(message) {

            });
            ws.send("something");
        }
    });

    return Promise.resolve(app);
};