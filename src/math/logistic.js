/**
    * The logistic function (sigmoid)
    * @function
    * @param {Number} value The value
    * @param {Number} [midValue=0] The midpoint value, at which the function returns max/2
    * @param {Number} [min=0] The minimum return value
    * @param {Number} [max=1] The maximum return value
    * @param {Number} [rate=1] The logistic growth rate or steepness of the function
    * @return {Number} The result in the range [min, max] (excluding min and max)
    * @category ExpressionLibrary
    */
function logistic( value, midValue, min, max, rate)
{
    if (typeof midValue === 'undefined') midValue = 0;
    if (typeof min === 'undefined') min = 0;
    if (typeof max === 'undefined') max = 1;
    if (typeof rate === 'undefined') rate = 1;

    var exp = -rate*(value - midValue);
    var result = 1 / (1 + Math.pow(Math.E, exp));
    return result * (max-min) + min;
}