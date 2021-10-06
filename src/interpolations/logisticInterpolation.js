/**
 * Interpolates a value with a logistic (sigmoid) function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=1] The raising speed in the range [0, inf].
 * @param {number} [tMid=0.5] The t value at which the interpolated value should be half way.
 * @return {number} the value.
 * @requires logistic
 * @requires linearExtrapolation
 */
function logisticInterpolation( t, tMin, tMax, value1, value2, rate, tMid )
{
    if (rate == 0) return linearExtrapolation(t, tMin, tMax, value1, value2);
    t = logistic( t, tMid, tMin, tMax, rate);
    
    // Scale to actual min/max
    var m = logistic( tMin, tMid, tMin, tMax, rate);
    var M = logistic( tMax, tMid, tMin, tMax, rate);

    return linearExtrapolation( t, m, M, value1, value2);
}
