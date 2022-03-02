/**
 * Interpolates a value with a gaussian function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=0] The raising speed in the range [-1.0, 1.0].
 * @return {number} the value.
 */
function gaussianInterpolation( t, tMin, tMax, value1, value2, rate )
{
    if (typeof tMin === 'undefined') tMin = 0;
    if (typeof tMax === 'undefined') tMax = 1;
    if (typeof value1 === 'undefined') value1 = 0;
    if (typeof value2 === 'undefined') value2 = 0;
    if (typeof rate === 'undefined') rate = 0;

    // fix small bump at first value
    if (t != tMin)
    {
        var newValue1 = gaussianInterpolation( tMin, tMin, tMax, value1, value2, rate );
        var offset = newValue1 - value1;
        value1 = value1 - offset;
    }
	if (rate < 0) rate = rate*10;
	rate = linear(t, tMin, tMax, 0.25, rate);
	var r = ( 1 - rate );
    var fwhm = (tMax-tMin) * r;
    var center = tMax;
	if (t >= tMax) return value2;
    if (fwhm === 0 && t == center) return value2;
    else if (fwhm === 0) return value1;
	
    var exp = -4 * Math.LN2;
    exp *= Math.pow((t - center),2);
    exp *= 1/ Math.pow(fwhm, 2);
    var result = Math.pow(Math.E, exp);
	result = result * (value2-value1) + value1;
    return result;
}