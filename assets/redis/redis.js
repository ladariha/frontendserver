{
    "use strict";

    let counter = 0;

    function CoreSSE(url) {
        this.url = url;
        this._source = null;
        this.isConnected = false;
        this.callbacks = {};
        this.latestES = null;
    }

    CoreSSE.prototype._buildUrl = function () {
        return this.url;
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

//


    function connectSSE() {
        new CoreSSE("http://localhost:8181/_redis")
            .onOpen(() => {
                window.document.getElementById("output").innerHTML += `\n<span class="system">[${new Date()}]</span>&nbsp;SSE Connection established`;
            })
            .onError(e => {
                window.document.getElementById("output").innerHTML += `\n<span class="critical">[${new Date()}]</span>&nbsp;SSE error ${JSON.stringify(e)}`;
            })
            .onClose(() => {
                window.document.getElementById("output").innerHTML += `\n<span class="system">[${new Date()}]</span>&nbsp;SSE Connection closed`;
            })
            .onMessage(e => {
                window.document.getElementById("output").innerHTML += `\n<span>[${new Date()}]</span>&nbsp;Received: ${e.data}`;
            })
            .listen();
    }

    function createImage() {
        window.document.getElementById("output").innerHTML += `<p> Sending request to create image&nbsp;<span>[${new Date()}]</span></p>`;
        fetch("http://localhost:8181/_redis/api", {method: "post"})
            .then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response;
            })
            .then(r => r.json())
            .then(data => {
                window.document.getElementById("output").innerHTML += `<p> Image created, response: ${JSON.stringify(data)}&nbsp;<span>[${new Date()}]</span></p>`;
            })
            .catch(console.log);
    }

    window.document.getElementById("connectBtn").addEventListener("click", connectSSE);
    window.document.getElementById("createImageBtn").addEventListener("click", createImage);
}