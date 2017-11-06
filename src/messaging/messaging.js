"use strict";

const SSE = require("sse-express");
const MESSAGING_API_PATH = "/_redis";
const MESSAGING_API_PATH_REST = "/_redis/api";

exports.init = (server, app, logger, config) => {
    if (config) {

        const mqImpl = Object.keys(config)[0];

        const messagingClient = require(`./${mqImpl}Impl`);
        messagingClient.init(config[mqImpl], app);

        // SSE endpoint, client can subscribe to messages from redis
        app.get(MESSAGING_API_PATH, SSE, messagingClient.handleSSEListenEvent);

        // sample way to handle POST request that will publish message to redis
        app.post(MESSAGING_API_PATH_REST, messagingClient.handleCreateImageRequest);

    }

    return Promise.resolve(app);
};
