"use strict";

exports.init = (server, app, logger, config, route_path) => {
    app.get(route_path, (req, res) => {
        res.status(200).json({
            startTime: app.locals.startTime.toISOString(),
            startTimestamp: app.locals.startTime.getTime()
        });
    });
    return Promise.resolve(app);
};