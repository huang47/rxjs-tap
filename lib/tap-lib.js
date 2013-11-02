/*global define, Rx, document*/
/**
 * taps observable implementation.
 *
 * requirements
 * 1. fired within a target boundary
 * 2. only 1 finger is supported (ignore the other fingers)
 * 3. touch should be cancelled if
 *     a) touchend is not fired after a fixed amount of time (say 10seconds for now)
 *     b) touchcancel is fired
 *
 * @module Taps
 * @class Taps
 */
(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['TapLib'], factory);
    } else {
        // Browser globals
        root.TapLib = factory();
    }
}(this, function () {
    'use strict';

    var taps,
        touchstarts,
        touchmoves,
        touchends,
        touchcancels,
        tapmoves,
        tapcancels;

    /**
     * transform an event stream to observable.
     *
     * @method fromHtmlEvent
     * @param {HTMLElement} node
     * @param {String} event DOM event name.
     * @return {Rx.Observable}
     */
    function fromHtmlEvent(node, event) {
        return Rx.Observable.create(function (o) {
            function handle(e) { o.onNext(e); }

            node.addEventListener(event, handle, false);

            return function () {
                node.removeEventListener(event, handle);
            };
        });
    }

    /**
     * check if given `point` is inside target boundary.
     *
     * @method isTapIntention
     * @param {Object} point touch point.
     * @param {Object} bound target boundary.
     * @return {Boolean}
     */
    function isTapIntention(point, bound) {
        return point.pageX > bound.left &&
            point.pageX < bound.right &&
            point.pageY > bound.top &&
            point.pageY < bound.bottom;
    }

    /**
     * check if it's a single finger event.
     *
     * @method isSingleFinger
     * @param {Event} touchmove touchmove.
     * @return {Boolean}
     */
    function isSingleFinger(touchmove) {
        return touchmove.touches && touchmove.touches.length === 1;
    }

    /**
     * get touched target with given `event` context.
     *
     * @private
     * @method getTarget
     * @param {Event} event touchevent context.
     * @return {HTMLElement} touched target.
     */
    function getTarget(event) {
        return event.target;
    }

    touchstarts  = fromHtmlEvent(document.body, 'touchstart');
    touchmoves   = fromHtmlEvent(document.body, 'touchmove');
    touchends    = fromHtmlEvent(document.body, 'touchend');
    touchcancels = fromHtmlEvent(document.body, 'touchcancel');

    return {
        touch: {
            starts: touchstarts,
            moves: touchmoves,
            ends: touchends,
            cancels: touchcancels
        },
        isSingleFinger: isSingleFinger,
        isTapIntention: isTapIntention,
        getTarget: getTarget
    };
}));
