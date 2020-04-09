/**
    * The inverse gaussian function
    * @function
    * @param {Number} v The variable
    * @param {Number} [min=0] The minimum return value of the corresponding gaussian function
    * @param {Number} [max=1] The maximum return value of the corresponding gaussian function
    * @param {Number} [center=0] The center of the peak of the corresponding gaussian function
    * @param {Number} [fwhm=1] The full width at half maximum of the curve of the corresponding gaussian function
    * @return {Number[]} The two possible results, the lower is the first in the list. If both are the same, it is the maximum
    */
function inverseGaussian ( v, min, max, center, fwhm)
{
    if (typeof max === "undefined") max = 1;
    if (typeof min === "undefined") min = 0;
    if (typeof center === "undefined") center = 0;
    if (typeof fwhm === "undefined") fwhm = 1;
    if (v == 1) return [center, center];
    if (v === 0) return [center + fwhm/2, center - fwhm/2];
    if (fwhm === 0) return [center, center];

    var result = (v-min)/(max-min);
    result = Math.log( result ) * Math.pow(fwhm,2);
    result = result / ( -4 * Math.LN2 );
    result = Math.sqrt( result );
    return [ result + center, -result + center ];
}