"use strict";

const Redis = require("ioredis");
const uuid = require("uuid");
const Logger = require("../logger/logger");
const isNull = require("../util/util").isNull;

// "master" redis client so that we don't need to create a new client for each REST request
let masterRedisClient = null;
let defaultConfiguration = null;
const DEFAULT_REDIS_PORT = 6379;
const RECONNECTION_LIMIT = 100;
const DEFAULT_REDIS_HOST = "127.0.0.1";
const OPTIONAL_CONFIG_PARAMS = ["password", "family", "db"];

function _getRedisClient(clientConfiguration) {
    return defaultConfiguration ? new Redis(Object.assign(clientConfiguration, defaultConfiguration)) : null;
}

/**
 * Returns a new redis client and bind close event from request to closing the redis connection
 * @param req
 */
function getRedis(request) {
    const logger = Logger.getLogger("Redis /_redis " + (request ? `#${request.id}` : "master client"));
    const redis = _getRedisClient({
        retryStrategy: function (times) {
            logger.log(`retrying ${times}`);
            if (redis.__frontendServerForceQuit || times > RECONNECTION_LIMIT) {// from docs: When the return value isn't a number, ioredis will stop trying to reconnect, and the connection will be lost forever if the user doesn't call redis.connect() manually.
                return false;
            }
            return Math.min(times * 50, 2000);
        }
    });


    if (request) {
        // utility method to prevent redis from reconnecting in retryStrategy()
        redis.__frontendQuit = () => {
            redis.__frontendServerForceQuit = true;
            redis.quit();
        };
        request.on("close", () => {
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


function init(config) {
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
    }
}

function handleNewSubscription(res, logger, err, code) {
    if (err) {
        logger.log(err);
    }
    res.sse("message", {"redis": {topic: "INFO", message: `_subscribed count: ${code}`}});
}

/**
 * Handles case when client makes POST request to create some resource. In such case since we don't have client's redis client, we will use "master client" (think of it as cached pool of connections)
 * to publish a new message and reply to client immediately
 * @param req
 * @param res
 */
function handleCreateImageRequest(req, res) {

    const newUuid = uuid.v4();
    getMasterRedisClient().publish("topics/images", `newImage/${newUuid}`);

    res.status(202).json({
        uuid: newUuid,
        topic: "topics/images/status"
    });
}

/**
 * Handles case when a client connects to SSE channel. In such case a new Redis client is created with some predefined subscriptions
 * @param req
 * @param res
 */
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


exports.init = init;
exports.getClientForRequest = getRedis;
exports.handleSSEListenEvent = handleSSEListenEvent;
exports.handleCreateImageRequest = handleCreateImageRequest;
exports.getClient = getMasterRedisClient;