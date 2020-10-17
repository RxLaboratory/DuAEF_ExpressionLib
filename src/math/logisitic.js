/**
    * The logistic function (sigmoid)<br />
    * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
    * @function
    * @param {Number} value The value
    * @param {Number} [midValue=0] The midpoint value, at which the function returns max/2
    * @param {Number} [min=0] The minimum return value
    * @param {Number} [max=1] The maximum return value
    * @param {Number} [rate=1] The logistic growth rate or steepness of the function
    * @return {Number} The result in the range [min, max] (excluding min and max)
    */
function logistic( value, midValue, min, max, rate)
{
    var exp = -rate*(value - midValue);
    var result = 1 / (1 + Math.pow(Math.E, exp));
    return result * (max-min) + min;
}