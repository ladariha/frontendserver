"use strict";
const path = require("path");
const express = require("express");

exports.init = (server, app, logger, config) => {

    const assets = config.location[0] === "/" ? config.location : path.join(__dirname, "..", config.location);

    app.use("/", express.static(assets, {
        lastModified: true,
        redirect: true,
        dotfiles: "ignore",
        etag: true
    }));
    logger.log(`Assets location: ${assets}`);
    return app;
};