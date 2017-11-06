"use strict";

const Redis = require("ioredis");
const Logger = require("../logger/logger");
const SSE = require("sse-express");
const uuid = require("uuid");
const isNull = require("../util/util").isNull;

let defaultConfiguration = null;
const DEFAULT_REDIS_PORT = 6379;
const RECONNECTION_LIMIT = 100;
const DEFAULT_REDIS_HOST = "127.0.0.1";
const OPTIONAL_CONFIG_PARAMS = ["password", "family", "db"];
const REDIS_API_PATH = "/_redis";
const REDIS_API_PATH_REST = "/_redis/api";

// "master" redis client so that we don't need to create a new client for each REST request
let masterRedisClient = null;

function _getRedisClient(clientConfiguration) {
    return defaultConfiguration ? new Redis(Object.assign(clientConfiguration, defaultConfiguration)) : null;
}

/**
 * Returns a new redis client and bind close event from request to closing the redis connection
 * @param req
 */
function getRedis(req) {
    const logger = Logger.getLogger("Redis /_redis " + (req ? `#${req.id}` : "master client"));
    const redis = _getRedisClient({
        retryStrategy: function (times) {
            logger.log(`retrying ${times}`);
            if (redis.__frontendServerForceQuit || times > RECONNECTION_LIMIT) {// from docs: When the return value isn't a number, ioredis will stop trying to reconnect, and the connection will be lost forever if the user doesn't call redis.connect() manually.
                return false;
            }
            return Math.min(times * 50, 2000);
        }
    });


    if (req) {
        // utility method to prevent redis from reconnecting in retryStrategy()
        redis.__frontendQuit = () => {
            redis.__frontendServerForceQuit = true;
            redis.quit();
        };
        req.on("close", () => {
            // close connection to redis when clients connection has been closed
            logger.log("client connection closed, closing redis client");
            redis.__frontendQuit();
        });
    }

    return redis;
}

/**
 * Returns master redis client (and initialize it if needed)
 * @returns {*}
 */
function getMasterRedisClient() {
    if (!masterRedisClient) {
        masterRedisClient = getRedis();
    }

    return masterRedisClient;
}

function handleCreateImageRequest(req, res) {

    const newUuid = uuid.v4();
    getMasterRedisClient().publish("topics/images", `newImage/${newUuid}`);

    res.status(202).json({
        uuid: newUuid,
        topic: "topics/images/status"
    });
}

function handleNewSubscription(res, logger, err, code) {
    if (err) {
        logger.log(err);
    }
    res.sse("message", {"redis": {topic: "INFO", message: `_subscribed count: ${code}`}});
}

function handleSSEListenEvent(req, res) {
    // get a new redis client
    const logger = Logger.getLogger("Redis /_redis " + req.id);
    const redis = getRedis(req, res);


    // send the client a confirmation
    res.sse("message", {"data": "initialized"});

    // subscribe to specific topics
    redis.subscribe("topics/images/status", "REGULAR", "BROADCAST/SSE", (err, code) => handleNewSubscription(res, logger, err, code));

    // or just subscribe to regex pattern
    redis.psubscribe("*", (err, code) => handleNewSubscription(res, logger, err, code));

    redis.on("message", (channel, message) => res.sse("message", {"redis": {topic: "", message, channel}}));
    redis.on("pmessage", (pattern, channel, message) => res.sse("message", {"redis": {topic: "", message, channel}}));

}


exports.init = (server, app, logger, config) => {
    if (config) {
        if (typeof config === "string") { // redisUrl
            defaultConfiguration = config;
        } else {
            defaultConfiguration = {
                port: config.port || DEFAULT_REDIS_PORT,
                host: config.host || DEFAULT_REDIS_HOST
            };

            OPTIONAL_CONFIG_PARAMS.forEach(property => {
                if (!isNull(config[property])) {
                    defaultConfiguration[property] = config[property];
                }
            });
        }

        // SSE endpoint, client can subscribe to messages from redis
        app.get(REDIS_API_PATH, SSE, handleSSEListenEvent);

        // sample way to handle POST request that will publish message to redis
        app.post(REDIS_API_PATH_REST, handleCreateImageRequest);

    }
    logger.log(`Redis configured to '${JSON.stringify(defaultConfiguration)}'`);
    return Promise.resolve(app);
};
