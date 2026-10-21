// Fetching one thing that several routes can provide - quickly.
// ---------------------------------------------------------------------------
// Universalis, bolls.life and mkatolikileo.com send no CORS headers, so the
// app reads them through its own route (the Cloudflare Worker, or the
// r.jina.ai Reader) and, when that doesn't answer, through public CORS
// proxies. Trying those one after another, each with its own long timeout,
// kept the spinner up for a minute or more on a bad connection.
// IPrayFetch.first(urls, accept) instead:
//
// - fails at once when the phone is offline (the error has .offline set),
// - gives urls[0], the app's own route, a head start of HEAD_START_MS,
// - then, or as soon as that fails, asks all the other urls at the same
//   time,
// - settles on the first answer that accept() turns into a result, and
//   cancels the requests still running,
// - gives up on each request after TIMEOUT_MS.
//
// accept(text, index) returns the result, or null (or throws) when that
// answer is unusable - a proxy's error page, a page with no prayer in it -
// and the other requests carry on.
(function (global) {
    'use strict';

    var HEAD_START_MS = 6000;
    var TIMEOUT_MS = 10000;

    function isOffline() {
        return !!(global.navigator && global.navigator.onLine === false);
    }

    function failure(message) {
        var e = new Error(message);
        e.offline = isOffline();
        return e;
    }

    function first(urls, accept, opts) {
        opts = opts || {};
        var headStart = opts.headStart != null ? opts.headStart : HEAD_START_MS;
        var timeout = opts.timeout || TIMEOUT_MS;
        if (isOffline()) return Promise.reject(failure('offline'));
        if (!urls.length) return Promise.reject(failure('no route'));

        return new Promise(function (resolve, reject) {
            var controllers = [];
            var started = 0;
            var running = 0;
            var done = false;
            var restStarted = false;
            var headTimer = null;

            function stop() {
                done = true;
                clearTimeout(headTimer);
                controllers.forEach(function (c) { if (c) c.abort(); });
            }

            function start(i) {
                started++;
                running++;
                var ctrl = global.AbortController ? new global.AbortController() : null;
                controllers.push(ctrl);
                var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, timeout);
                var init = {};
                if (opts.headers) init.headers = opts.headers;
                if (ctrl) init.signal = ctrl.signal;
                global.fetch(urls[i], init)
                    .then(function (r) {
                        if (!r.ok) throw new Error('HTTP ' + r.status);
                        return r.text();
                    })
                    .then(function (text) {
                        if (done) return;
                        var result = accept(text, i);
                        if (result == null || result === false) throw new Error('unusable answer');
                        stop();
                        resolve(result);
                    })
                    .catch(function () {})
                    .then(function () {
                        clearTimeout(timer);
                        running--;
                        if (done) return;
                        if (i === 0) startRest();
                        if (running === 0 && started === urls.length) {
                            stop();
                            reject(failure('no route answered'));
                        }
                    });
            }

            function startRest() {
                clearTimeout(headTimer);
                if (restStarted || done) return;
                restStarted = true;
                for (var i = 1; i < urls.length; i++) start(i);
            }

            start(0);
            if (urls.length > 1) headTimer = setTimeout(startRest, headStart);
        });
    }

    global.IPrayFetch = { first: first, isOffline: isOffline };
})(typeof window !== 'undefined' ? window : this);
