/**
    * The inverse logistic function (inverse sigmoid)
    * @function
    * @param {Number} v The variable
    * @param {Number} [midValue=0] The midpoint value, at which the function returns max/2 in the original logistic function
    * @param {Number} [min=0] The minimum return value of the original logistic function
    * @param {Number} [max=1] The maximum return value of the original logistic function
    * @param {Number} [rate=1] The logistic growth rate or steepness of the original logistic function
    * @return {Number} The result
    */
function inverseLogistic ( v, midValue, min, max, rate)
{
    if (typeof midValue === 'undefined') midValue = 0;
    if (typeof min === 'undefined') min = 0;
    if (typeof max === 'undefined') max = 1;
    if (typeof rate === 'undefined') rate = 1;

    if (v == min) return 0;
    
    return midValue - Math.log( (max-min)/(v-min) - 1) / rate;
}