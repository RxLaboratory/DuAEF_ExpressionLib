/**
 * Gets the world instant velocity of a layer.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] The time when to get the velocity
 * @param {Layer} [l=thisLayer] The layer
 * @return {number[]} The velocity.
 * @requires getLayerWorldPos
 */
function getLayerWorldVelocity(t, l) {
	return (getLayerWorldPos(t, l) - getLayerWorldPos(t - 0.01, l)) * 100;
}