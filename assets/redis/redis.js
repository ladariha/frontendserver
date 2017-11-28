{
    "use strict";

    let counter = 0;

    function CoreSSE(url) {
        this.url = url;
        this._Channel = EventSource;
        this._source = null;
        this.isConnected = false;
        this.callbacks = {};
        this.latestES = null;
        this.name = "SSE";

        this._checkInterval = -1;
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

    CoreSSE.prototype.reconnect = function () {
        if (this._source === null || this._source.readyState === this._Channel.CLOSED) {
            window.clearInterval(this._checkInterval);
            this.isConnected = false;
            this.listen();
        }
    };

    CoreSSE.prototype.listen = function () {
        let self = this;
        if (this.isConnected) {
            return;
        }
        this._source = new this._Channel(this._buildUrl());
        this._checkInterval = window.setInterval(() => {
            self.reconnect();
        }, 5000);

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

        this._source.addEventListener("close", function (e) {
            self.isConnected = false;
            self.callbacks.open && self.callbacks.close(e);
            window.setTimeout(() => self.listen(), 5000);
        }, false);

        this._source.addEventListener("error", function (e) {

            if (e.readyState === self._Channel.CLOSED && (CORE.getProp(["currentTarget", "CORE_ID"], e) === self.latestES)) {
                self.isConnected = false;
                self.callbacks.close && self.callbacks.close(e);
            }
            self._source.close();
            window.setTimeout(() => self.listen(), 5000);
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


    function connect(client) {
        client
            .onOpen(() => {
                window.document.getElementById("output").innerHTML += `\n<span class="system">[${new Date()}]</span>&nbsp;${client.name} Connection established`;
            })
            .onError(e => {
                window.document.getElementById("output").innerHTML += `\n<span class="critical">[${new Date()}]</span>&nbsp;${client.name} error ${JSON.stringify(e)}`;
            })
            .onClose(() => {
                window.document.getElementById("output").innerHTML += `\n<span class="system">[${new Date()}]</span>&nbsp;${client.name} Connection closed`;
            })
            .onMessage(e => {
                window.document.getElementById("output").innerHTML += `\n<span>[${new Date()}]</span>&nbsp;${client.name} Received: ${e.data}`;
            })
            .listen();
        return client;
    }


    function CoreWS(url) {
        CoreSSE.call(this, url);
        this.name = "WebSocket";
        this._Channel = WebSocket;
    }

    CoreWS.prototype = Object.create(CoreSSE.prototype);


    function connectSSE() {
        connect(new CoreSSE("http://localhost:18081/_redis?topics=topics/images/status"));
    }


    function connectWS() {
        const cl = connect(new CoreWS("ws://localhost:18081/_ws"));
        window.setInterval(() => {
            cl._source.send("aaa");
        }, 5000);
    }

    function createImage() {
        window.document.getElementById("output").innerHTML += `<p> Sending request to create image&nbsp;<span>[${new Date()}]</span></p>`;
        fetch("http://localhost:18081/_redis/api", {method: "post"})
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
    window.document.getElementById("connectBtn2").addEventListener("click", connectWS);
    window.document.getElementById("createImageBtn").addEventListener("click", createImage);
}
