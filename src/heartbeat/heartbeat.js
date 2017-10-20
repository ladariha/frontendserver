"use strict";

exports.init = (server, app) => {
    app.get("/_hb", (req, res) => {
        res.status(200).json({
            startTime : app.locals.startTime.toISOString(),
            startTimestamp : app.locals.startTime.getTime()
        });
    });
    return app;
};