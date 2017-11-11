{

    function updateReady(worker) {
        const wantToReloadPageAndUpdate = true;
        if (wantToReloadPageAndUpdate) {
            worker.postMessage("skipWaiting");
        }

    }

    function trackInstalling(worker) {
        worker.addEventListener("statechange", function () {
            if (worker.state === "installed") {
                updateReady(worker);
            }
        });
    }

    if (navigator.serviceWorker) {

        navigator.serviceWorker.register("/sw.js").then(function (reg) {
            if (!navigator.serviceWorker.controller) {
                return;
            }

            if (reg.waiting) {
                updateReady(reg.waiting);
                return;
            }

            if (reg.installing) {
                trackInstalling(reg.installing);
                return;
            }

            reg.addEventListener("updatefound", function () {
                trackInstalling(reg.installing);
            });
        });

        // this is triggered from SW when it calls skipWaiting();
        navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload());
    }
}