"use strict";
// core NodeJS modules
const fs = require("fs");
const path = require("path");
const cluster = require("cluster");
// configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")).toString());
const frontendWorker = require("./_worker");
const frontendMaster = require("./_master");

cluster.isMaster ? frontendMaster.start(config) : frontendWorker.start(config);