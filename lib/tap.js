/*global define, Rx, document*/
/**
 * taps observable implementation.
 *
 * requirements
 * 1. fired within a target boundary
 * 2. only 1 finger is supported (ignore the other fingers)
 * 3. touch should be cancelled if touchcancel is fired
 *
 * @module Tap
 * @class Tap
 */
(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['Tap'], factory);
    } else {
        // Browser globals
        root.Tap = factory(root.TapLib);
    }
}(this, function (taplib) {
    'use strict';

    var isSingleFinger = taplib.isSingleFinger,
        isTapIntention = taplib.isTapIntention,
        getTarget = taplib.getTarget,
        touch = taplib.touch,
        tapmoves,
        tapcancels,
        taps,
        DIRS;

    DIRS = ['top', 'right', 'bottom', 'left'];

    /**
     * get bounding client rectangle.
     * If `target` data-inset is set, will return
     * a extended boundary per given inset.
     *
     * if target.dataset.inset is 
     * @method getBoundary
     * @param {HTMLElement} target
     * @return {Object}
     */
    function getBoundary(target) {
        var rect,
            inset,
            bound;

        rect = target.getBoundingClientRect();

        bound = {};

        DIRS.forEach(function (dir) {
            bound[dir] = rect[dir];
        });

        if (target.dataset.inset) {
            inset = target.dataset.inset - 0;
            bound.top -= inset;
            bound.left -= inset;
            bound.right += inset;
            bound.bottom += inset;
        }

        return bound;
    }

    tapmoves = touch.moves.
        takeUntil(touch.ends).
        takeUntil(touch.cancels).
        filter(isSingleFinger);

    tapcancels = touch.starts.
        flatMap(function (touchstart) {
            var bound = getBoundary(touchstart.target);

            return tapmoves.
                filter(function (touchmove) {
                    // TODO
                    // why we need to check it's the same target.
                    return touchstart.target === touchmove.target;
                }).
                filter(function (touchmove) {
                    return !isTapIntention(touchmove.touches[0], bound);
                }).
                take(1);
        });

    taps = touch.starts.
        flatMap(function (touchstart) {
            var bound = getBoundary(touchstart.target);

            return tapmoves.
                lastOrDefault(null, touchstart).
                filter(function (touchmove) {
                    return isTapIntention(touchmove.touches[0], bound);
                }).
                takeUntil(touch.ends).
                takeUntil(touch.cancels).
                takeUntil(tapcancels);
        });

    return {
        ping: touch.starts,
        pingTarget: touch.starts.map(getTarget),
        ped: taps,
        pedTarget: taps.map(getTarget),
        cancel: tapcancels,
        cancelTarget: tapcancels.map(getTarget)
    };
}));
