"use strict";
// SSE
{

    var EventSource = require("eventsource");
    let counter = 0;

    function CoreSSE(url) {
        this.url = url;
        this._source = null;
        this.isConnected = false;
        this.callbacks = {};
        this.latestES = null;
    }

    CoreSSE.prototype._buildUrl = function () {
        return this.url + "?x-frontend-proxy-target=" + encodeURIComponent("http://aaa.myotherserver.cccx/ss?a=1");
    };


    CoreSSE.prototype._addListener = function (eventName, callback) {
        this.callbacks[eventName] = callback;
        return this;
    };

    CoreSSE.prototype.onOpen = function (fnc) {
        return this._addListener("open", fnc);
    };
    CoreSSE.prototype.onError = function (fnc) {
        return this._addListener("error", fnc);
    };
    CoreSSE.prototype.onClose = function (fnc) {
        return this._addListener("close", fnc);
    };

    CoreSSE.prototype.onMessage = function (fnc) {
        return this._addListener("message", fnc);
    };


    CoreSSE.prototype.listen = function () {
        let self = this;
        this._source = new EventSource(this._buildUrl());

        // marker for latest ES instance - in case 'error' event happens in older ES instance during initialization of a new ES instance so that the new instance is not closed by older event
        this._source.CORE_ID = "es_" + (++counter);
        this.latestES = this._source.CORE_ID;

        this._source.addEventListener("message", function (e) {
            self.callbacks.message && self.callbacks.message(e);
        }, false);

        this._source.addEventListener("open", function (e) {
            self.isConnected = true;
            self.callbacks.open && self.callbacks.open(e);
        }, false);

        this._source.addEventListener("error", function (e) {

            if (e.readyState === EventSource.CLOSED && (CORE.getProp(["currentTarget", "CORE_ID"], e) === self.latestES)) {
                self.isConnected = false;
                self.callbacks.close && self.callbacks.close(e);
            }
            self.callbacks.error && self.callbacks.error(e);
        }, false);

        return this;
    };

    CoreSSE.prototype.close = function (message) {
        this._source.close();
        this.latestES = null;
        this.isConnected = false;
        this.callbacks.close && this.callbacks.close(message);
    };

    new CoreSSE("http://localhost:8080/_sseproxy").onMessage(console.log).listen();


}