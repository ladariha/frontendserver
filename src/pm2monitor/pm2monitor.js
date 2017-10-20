"use strict";

const pmx = require("pmx");
const countMetrics = require("./countMetrics");
exports.init = (server, app) => {

    pmx.init({
        http: true, // http metrics
        errors: true, // exceptions
        custom_probes: true,
        network: true, // network monitor
        ports: true // ports usage
    });

    app.use(countMetrics);
    return app;

};