"use strict";

/**
 * Start script for running Frontend via PM2
 */

const fs = require("fs");
const path = require("path");
const json = require("comment-json");
// configuration
const userConfig = json.parse(fs.readFileSync(path.join(__dirname, "config.json")).toString(), null, true);
const defaultConfig = json.parse(fs.readFileSync(path.join(__dirname, "defaultConfig.json")).toString(), null, true);
const config = require("./util/util").resolveConfiguration(userConfig, defaultConfig);
const frontendWorker = require("./_worker");
frontendWorker.start(config);
console.log(`${new Date()} it's a go`); // this line is just to test logging....