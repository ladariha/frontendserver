"use strict";
// via frontend proxy
{
    const WebSocket = require("ws");
    const socket = new WebSocket("ws://localhost:8080/_proxy?target=http%3A%2F%2Flocalhost%3A1337");
    socket.onopen = function () {
        socket.send("PROXY: hello from the client");
    };

    socket.onmessage = function (message) {
        console.log("PROXY received: " + message.data);
    };

    socket.onerror = function (error) {
        console.log("PROXY: WebSocket error: " + error);
    };

}
// to frontend directly
{
    const WebSocket = require("ws");
    const socket = new WebSocket("ws://localhost:8080/_ws");
    socket.onopen = function () {
        socket.send("DIRECT: hello from the client 2");
    };


    socket.onmessage = function (message) {
        console.log("DIRECT received: " + message.data);
    };

    socket.onerror = function (error) {
        console.log("DIRECT: WebSocket error: " + error);
    };

}