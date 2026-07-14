/* Global zoom lock: backs up the viewport meta tag + CSS touch-action rule
   for browsers (mainly iOS Safari) that still allow pinch/double-tap zoom
   through gesture events regardless of those settings. */
(function () {
    // iOS Safari fires these non-standard gesture events for pinch-zoom
    // even when touch-action/viewport restrictions are set.
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (type) {
        document.addEventListener(type, function (e) {
            e.preventDefault();
        }, { passive: false });
    });

    // Block pinch-zoom reported through touchmove (e.scale is iOS-only).
    document.addEventListener('touchmove', function (e) {
        if (e.scale !== undefined && e.scale !== 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // Block double-tap-to-zoom: suppress the second tap of a fast pair
    // without affecting normal single taps, scrolling, or form inputs.
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function (e) {
        var now = Date.now();
        if (now - lastTouchEnd <= 350) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
})();
