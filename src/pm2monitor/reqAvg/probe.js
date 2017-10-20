"use strict";
const pmx = require("pmx");
const pmxProbe = pmx.probe();

module.exports = () => pmxProbe.meter({
    name: "Avg req/sec in last 60seconds",
    samples: 1,  // This is per second. To get per min set this value to 60,
    timeframe: 60 // timeframe over which events will be analyzed
});

