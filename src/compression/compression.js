"use strict";

const compression = require("compression");

exports.init = (server, app, logger, {level = 6, threshold = "10kb"} = {}) => app.use(compression({level, threshold}));