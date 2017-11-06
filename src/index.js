"use strict";
// core NodeJS modules
const fs = require("fs");
const path = require("path");
const cluster = require("cluster");
const json = require("comment-json");
// configuration
const userConfig = json.parse(fs.readFileSync(path.join(__dirname, "config.json")).toString(), null, true);
const defaultConfig = json.parse(fs.readFileSync(path.join(__dirname, "defaultConfig.json")).toString(), null, true);
const config = require("./util/util").resolveConfiguration(userConfig, defaultConfig);
const frontendWorker = require("./_worker");
const frontendMaster = require("./_master");

cluster.isMaster && !process.env.DEBUG_MODE ? frontendMaster.start(config) : frontendWorker.start(config);