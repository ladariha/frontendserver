"use strict";
const cluster = require("cluster");

exports.start = config => {
    for (let i = 0; i < config.server.size; i++) {
        cluster.fork();
    }

    cluster.on("online", function workeronline(worker) {
        console.log(`[${new Date().toISOString()}] Worker running, pid: ${worker.process.pid}`);
    });

    cluster.on("exit", function workeronline(worker, code, signal) {
        console.log(`[${new Date().toISOString()}] Worker ${worker.process.pid} has exited with code ${signal}`);
        cluster.fork();
    });
};