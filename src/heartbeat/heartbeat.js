"use strict";

exports.init = (server, app) => {
    const startTime = new Date();
    const startTimestamp = startTime.getTime();
    app.get("/_hb", (req, res) => {
        res.status(200).json({
            startTime, startTimestamp
        });
    });
    return app;
};