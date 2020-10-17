/**
    * The gaussian function<br />
    * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
    * @function
    * @param {Number} value The variable
    * @param {Number} [min=0] The minimum return value
    * @param {Number} [max=1] The maximum return value
    * @param {Number} [center=0] The center of the peak
    * @param {Number} [fwhm=1] The full width at half maximum of the curve
    * @return {Number} The result
    */
function gaussian( value, min, max, center, fwhm)
{
    if (fwhm === 0 && value == center) return max;
    else if (fwhm === 0) return 0;

    var exp = -4 * Math.LN2;
    exp *= Math.pow((value - center),2);
    exp *= 1/ Math.pow(fwhm, 2);
    var result = Math.pow(Math.E, exp);
    return result * (max-min) + min;
}