"use strict";
const pmx = require("pmx");
const pmxProbe = pmx.probe();

/**
 * Metric to show number of requests per second since startup time
 * @param app
 */
module.exports = app => pmxProbe.metric({
    name: "Avg request per sec",
    value: () => (1000 * app.locals.requestCount / (Date.now() - app.locals.startTime.getTime())).toFixed(2)
});