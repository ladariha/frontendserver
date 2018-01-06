"use strict";
const path = require("path");
const express = require("express");

exports.init = (server, app, logger, config, route_path) => {

    const assets = config.location[0] === "/" ? config.location : path.join(__dirname, "..", config.location);

    app.use(route_path, express.static(assets, {
        lastModified: true,
        redirect: true,
        dotfiles: "ignore",
        etag: true
    }));
    logger.log(`Assets location: ${assets}`);
    return Promise.resolve(app);
};