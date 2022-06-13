/**
    * The gaussian function
    * @function
    * @param {Number} value The variable
    * @param {Number} [min=0] The minimum return value
    * @param {Number} [max=1] The maximum return value
    * @param {Number} [center=0] The center of the peak
    * @param {Number} [fwhm=1] The full width at half maximum of the curve
    * @return {Number} The result
    * @memberof ExpressionLibrary
    */
function gaussian( value, min, max, center, fwhm)
{
    if (typeof min === 'undefined') min = 0;
    if (typeof max === 'undefined') max = 1;
    if (typeof center === 'undefined') center = 0;
    if (typeof fwhm === 'undefined') fwhm = 1;

    if (fwhm === 0 && value == center) return max;
    else if (fwhm === 0) return 0;

    var exp = -4 * Math.LN2;
    exp *= Math.pow((value - center),2);
    exp *= 1/ Math.pow(fwhm, 2);
    var result = Math.pow(Math.E, exp);
    return result * (max-min) + min;
}