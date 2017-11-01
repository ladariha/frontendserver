"use strict";

const cluster = require("cluster");

function reverse(arr, left, right) {
    while (left < right) {
        let temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++;
        right--;
    }
    return arr;
}

function rotate(arr, k) {
    const l = arr.length;
    arr = reverse(arr, 0, l - 1);
    arr = reverse(arr, 0, k - 1);
    arr = reverse(arr, k, l - 1);
    return arr;
}

/**
 * From list of possible API endpoints (passed via config.json), this will select a suitable endpoint to use and will serve the information
 * at /_api for client
 * @param server
 * @param app
 * @param logger
 * @param config
 * @returns {*}
 */
exports.init = (server, app, logger, apiEndpoints) => {
    const clusterID = cluster.worker.id;
    const initalApiEndpoinIndex = clusterID % apiEndpoints.length;
    let endpoints = rotate(apiEndpoints.slice(), apiEndpoints.length - initalApiEndpoinIndex); // copy the array

    return new Promise((resolve) => {
        setTimeout(() => {
            app.get("/_api", (req, res) => {

                // FIXME
                // here there should be HTTP request to each API endpoint (in order of endpoints arr) to check if the endpoint is alive/able to accept requests
                // in case client's API call fails with some predefined error (503?), client would ask this frontend server for a new endpoint by requesting the /_api endpoint

                res.status(200).json({
                    _wid: clusterID,
                    preferred: endpoints[0],
                    endpoints: apiEndpoints
                });
            });
            resolve(app);
        }, 2000);
    });
};