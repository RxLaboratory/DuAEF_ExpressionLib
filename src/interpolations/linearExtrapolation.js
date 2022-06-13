/**
 * Interpolates a value with a linear function, but also extrapolates it outside of known values.<br />
 * This method can replace <code>linear()</code>, adding extrapolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate and extrapolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @return {number} the value.
 * @category ExpressionLibrary
 */
function linearExtrapolation( t, tMin, tMax, value1, value2 )
{
  if (tMax == tMin) return (value1+value2) / 2;
  return value1 + (( t - tMin) / (tMax - tMin)) * (value2 - value1);
}
