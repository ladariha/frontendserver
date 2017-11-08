"use strict";
const cluster = require("cluster");
const CPU_COUNT = Math.round(require("os").cpus().length);

exports.start = () => {
    for (let i = 0; i < CPU_COUNT; i++) {
        cluster.fork();
    }

    cluster.on("online", function workeronline(worker) {
        console.log(`[${new Date().toISOString()}] Worker running, pid: ${worker.process.pid}`);
    });

    cluster.on("exit", function workeronline(worker, code, signal) {
        console.log(`[${new Date().toISOString()}] Worker ${worker.process.pid} has exited with code ${signal}, respawning`);
        cluster.fork();
    });
};