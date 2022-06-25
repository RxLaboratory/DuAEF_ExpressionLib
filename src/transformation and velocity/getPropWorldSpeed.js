/**
 * Gets the world speed of a property.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [prop=thisProperty] The property
 * @return {number[]} The world speed
 * @requires getPropWorldVelocity
 * @category ExpressionLibrary
 */
function getPropWorldSpeed(t, prop) {
	return length(getPropWorldVelocity(t, prop));
}