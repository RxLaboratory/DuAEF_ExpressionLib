/**
 * Interpolates a value with an exponential function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=1] The raising speed in the range [0, inf].
 * @return {number} the value.
 * @requires linearExtrapolation
 */
function expInterpolation(t, tMin, tMax, vMin, vMax, rate)
{
	if (typeof tMin === 'undefined') tMin = 0;
   if (typeof tMax === 'undefined') tMax = 1;
   if (typeof value1 === 'undefined') value1 = 0;
   if (typeof value2 === 'undefined') value2 = 0;
   if (typeof rate === 'undefined') rate = 1;
   
    if (rate == 0) return linearExtrapolation(t, tMin, tMax, vMin, vMax);
	// Offset t to be in the range 0-Max
	tMax = ( tMax - tMin ) * rate;
	t = ( t - tMin ) * rate;
	// Compute the max
	var m = Math.exp(tMax);
	// Compute current value
	t = Math.exp(t);
	return linearExtrapolation(t, 1, m, vMin, vMax);
}