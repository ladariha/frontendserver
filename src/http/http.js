"use strict";


const http = {
    BadRequest: function (response, msg) {
        response.writeHead(400, {
            "Content-Type": typeof msg === "string" ? "text/plain" : "application/json"
        });
        response.write(JSON.stringify(msg));
        response.end();
    },
    DatabaseError: function (response, msg) {
        response.writeHead(500, {
            "Content-Type": "text/plain"
        });
        response.write(msg);
        response.end();
    },
    Ok: function (response, data) {
        setTimeout(function () {
            response.writeHead(200, {
                "Content-Type": typeof data === "string" ? "text/plain" : "application/json"
            });
            response.write(JSON.stringify(data));
            response.end();
        }, 500);
    },
    Created: function (response, data) {
        setTimeout(function () {
            response.writeHead(201, {
                "Content-Type": typeof data === "string" ? "text/plain" : "text/html"
            });
            response.write(JSON.stringify(data));
            response.end();
        }, 1000);
    },
    Accepted: function (response, data) {
        setTimeout(function () {
            response.writeHead(202, {
                "Content-Type": typeof data === "string" ? "text/plain" : "application/json"
            });
            response.write(JSON.stringify(data));
            response.end();
        }, 1000);
    },
    GeneralError: function (response, data) {
        response.writeHead(500, {
            "Content-Type": typeof data === "string" ? "text/plain" : "application/json"
        });
        response.write(JSON.stringify(data));
        response.end();
    },
    Unauthorized: function (response, msg) {
        response.writeHead(401, {
            "Content-Type": typeof msg === "string" ? "text/plain" : "application/json"
        });
        response.write(JSON.stringify(msg));
        response.end();
    },
    NoContent: function (response) {
        response.writeHead(204, {
            "Content-Type": "text/plain"
        });
        response.end();
    },
    AuthenticationTimeout: function (response, msg) {
        response.writeHead(419, {
            "Content-Type": "text/plain"
        });
        response.write(msg);
        response.end();
    },
    NotFound: function (response, msg) {
        response.writeHead(404, {
            "Content-Type": typeof msg === "string" ? "text/plain" : "application/json"
        });
        response.write(JSON.stringify(msg));
        response.end();
    },
    respond: function (errorType, msg, res) {
        if (this.hasOwnProperty(errorType)) {
            this[errorType](res, msg);
        } else {
            setTimeout(function () {
                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                res.write("error");
                res.end();
            }, 500);
        }
    }
};


module.exports = http;
