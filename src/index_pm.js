"use strict";

/**
 * Start script for running Frontend via PM2
 */

const fs = require("fs");
const path = require("path");
// configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")).toString());
const frontendWorker = require("./_worker");
frontendWorker.start(config);
console.log("it's a go"); // this line is just to test logging....