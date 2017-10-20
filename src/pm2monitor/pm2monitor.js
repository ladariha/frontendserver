"use strict";

const pmx = require("pmx");
const rps = require("./reqPerSec/count");
const ra = require("./reqAvg/reqAvg");
const histogramReqs = require("./reqHistogram/reqHistogram");

/**
 * Wrapper around all PM2 specific metrics
 * @param server
 * @param app
 * @returns {*}
 */
exports.init = (server, app) => {

    pmx.init({
        http: true, // http metrics
        errors: true, // exceptions
        custom_probes: true,
        network: true, // network monitor
        ports: true // ports usage
    });

    rps(app);
    ra(app);
    histogramReqs(app);
    return app;
};