"use strict";
const fs = require("fs");
const path = require("path");
const json = require("comment-json");
// configuration
const userConfig = json.parse(fs.readFileSync(path.join(__dirname, "config.json")).toString(), null, true);
const defaultConfig = json.parse(fs.readFileSync(path.join(__dirname, "defaultConfig.json")).toString(), null, true);
const config = require("./util/util").resolveConfiguration(userConfig, defaultConfig);
const frontendWorker = require("./_worker");

exports.init = (startServer) => {
    if (!startServer) {
        return frontendWorker.init(config);
    }
    return frontendWorker.init(config)
        .then(f => {
            f.start();
            console.log("Up and running");
            return f;
        })
        .catch(e => {
            console.error(e.meesage);
            return Promise.reject(e);
        });
};