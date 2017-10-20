"use strict";

const countProbe = require("./count");
module.exports = function (req, res, next) {
    countProbe.inc();
    next();
};