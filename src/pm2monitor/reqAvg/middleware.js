"use strict";
const probe = require("./probe")();
module.exports = (req, res, next) => {
    probe.mark();
    next();
};