"use strict";
const pmx = require("pmx");
const pmxProbe = pmx.probe();

/**
 * Metric to show number of requests per second since startup time
 * @param app
 */
module.exports = app => {

    const histogram = pmxProbe.histogram({
        name: "Median of requests count in last 5m (interval 5s)",
        measurement: "median"
    });

    let lastValue = app.locals.requestCount;
    setInterval(function () {
        const newValue = app.locals.requestCount;
        histogram.update(newValue - lastValue);
        lastValue = newValue;
    }, 5000);

    return histogram;

};

