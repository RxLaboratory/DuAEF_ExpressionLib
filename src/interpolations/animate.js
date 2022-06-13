/**
 * Animates the property using the given keyframes
 * @function
 * @param {Object[]} keyframes The keyframes. An object with four properties:<br/>
 * <code>value</code> The value of the keyframe<br />
 * <code>time</code> The time of the keyframe<br />
 * <code>interpolation</code> (optional. Default: linear) A function taking 5 arguments to interpolate between this keyframe and the next one<br />
 * <code>params</code> (optional.) A sixth argument passed to the interpolation function. To be used with DuAEF interpolations.<br />
 * Note that the keyframes <strong>must be sorted</strong>. The function does not sort them, as it would have a bad impact on performance.
 * @param {string} [loopOut='none'] One of 'none', 'cycle', 'pingpong'.
 * @param {string} [loopIn='none'] One of 'none', 'cycle', 'pingpong'.
 * @param {float} [time=time] Use this to control how time flows.
 * @example
 * var keyframes = [
 *    {value: 0, time: 1, interpolation: linear},
 *    {value: 180, time: 2, interpolation: gaussianInterpolation, params: -0.5}, //You need to include the gaussianInterpolation function from DuAEF
 *    {value: 250, time: 4, interpolation: ease},
 *    {value: 360, time: 5},
 * ];
 * animate(keyframes, 'cycle', 'pingpong');
 * @return {number} the animated value.
 */
 function animate(ks, loopOut, loopIn, ct) {
    if (ks.length == 0) return value;
    if (ks.length == 1) return ks[0].value;
    if (typeof loopOut === 'undefined') loopOut = 'none';
    if (typeof loopIn === 'undefined') loopIn = 'none';
	if (typeof ct === 'undefined') ct = time;
    // times
    var startTime = ks[0].time;
    var endTime = ks[ks.length-1].time;
    var duration = endTime - startTime;
    // Loop out
    if ( ct >= endTime )
    {
        if ( loopOut == 'cycle' ) ct = ((ct - startTime) % duration) + startTime;
        else if ( loopOut == 'pingpong' ) {
            var d = duration * 2;
            ct = (ct-startTime) % d;
            if (ct > duration) ct = d - ct;
            ct += startTime;
        }
    }
    // Loop in
    else if ( ct < startTime) {
        if ( loopIn == 'cycle' ) ct = ((ct - startTime) % duration) + startTime + duration;
        else if ( loopIn == 'pingpong' ) {
            var d = duration * 2;
            ct += d;
            ct = (ct-startTime) % d;
            if (ct > duration) ct = d - ct;
            ct += startTime;
        }
    }
    // Find the right keyframe
    for (var i = 0; i < ks.length; i++) {
        var k = ks[i];
        if (k.time > ct && i == 0) return k.value;
        if (k.time == ct) return k.value;
        if (k.time < ct) {
            // it was the last one
            if (i == ks.length - 1) return k.value;
            // The next key
            var nk = ks[i+1];
            // it's not the current keyframe
            if (nk.time < ct) continue;
            if (typeof k.interpolation === 'undefined') return linear(ct, k.time, nk.time, k.value, nk.value);
            // interpolate
            if (typeof k.params === 'undefined') return k.interpolation(ct, k.time, nk.time, k.value, nk.value);
            else return k.interpolation(ct, k.time, nk.time, k.value, nk.value, k.params);
        }
    }
    // just in case...
    return value;
}