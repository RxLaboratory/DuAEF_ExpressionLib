/**
 * Interpolates a value with a logistic (sigmoid) function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=1] The raising speed in the range [0, inf].
 * @param {number} [tMid] The t value at which the interpolated value should be half way. By default, (tMin+tMax)/2
 * @return {number} the value.s
 * @requires logistic
 * @requires linearExtrapolation
 * @category ExpressionLibrary
 */
function logisticInterpolation( t, tMin, tMax, value1, value2, rate, tMid )
{
    if (typeof tMin === 'undefined') tMin = 0;
    if (typeof tMax === 'undefined') tMax = 1;
    if (typeof value1 === 'undefined') value1 = 0;
    if (typeof value2 === 'undefined') value2 = 0;
    if (typeof rate === 'undefined') rate = 1;
    if (typeof tMid === 'undefined') tMid = (tMin+tMax)/2;

    if (rate == 0) return linearExtrapolation(t, tMin, tMax, value1, value2);
    t = logistic( t, tMid, tMin, tMax, rate);
    
    // Scale to actual min/max
    var m = logistic( tMin, tMid, tMin, tMax, rate);
    var M = logistic( tMax, tMid, tMin, tMax, rate);

    return linearExtrapolation( t, m, M, value1, value2);
}
