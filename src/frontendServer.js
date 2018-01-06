"use strict";

function FrontendServer(app, server, port, host, logger) {
    this.app = app;
    this.server = server;
    this.port = port;
    this.host = host;
    this.logger = logger;
    this._callbacks = new Map();
}

FrontendServer.prototype.enableWebSockets = function (callback) {
    this._callbacks.set("newWebSocketConnection", callback);
    return this;
};

FrontendServer.prototype.enableSSE = function (callback) {
    this._callbacks.set("newSSEConnection", callback);
    return this;
};
FrontendServer.prototype.enableSocketIO = function (callback) {
    this._callbacks.set("newIOConnection", callback);
    return this;
};

FrontendServer.prototype._newWebSocketConnection = function (websocketChannel, request) {
    const callback = this._callbacks.get("newWebSocketConnection");
    if (callback) {
        callback(websocketChannel, request);
    }
};

FrontendServer.prototype._newSocketIOConnection = function (iosocket) {
    const callback = this._callbacks.get("newIOConnection");
    if (callback) {
        callback(iosocket);
    }
};

FrontendServer.prototype._newSSEConnection = function (request, response) {
    const callback = this._callbacks.get("newSSEConnection");
    if (callback) {
        callback(request, response);
    }
};
FrontendServer.prototype.getApp = function () {
    return this.app;
};
FrontendServer.prototype.getServer = function () {
    return this.server;
};
FrontendServer.prototype.start = function () {
    this.server.listen(this.port, this.host);
    this.logger.log(`Started server on http://${this.host}:${this.port} in '${this.app.get("env")}' mode`);
};

module.exports = FrontendServer;