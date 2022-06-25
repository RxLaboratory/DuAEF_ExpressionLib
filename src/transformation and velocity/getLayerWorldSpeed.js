/**
 * Gets the world instant speed of a layer.
 * @function
 * @param {number} [t=time] The time when to get the velocity
 * @param {Layer} [l=thisLayer] The layer
 * @return {number} A positive number. The speed.
 * @requires getLayerWorldVelocity
 * @category ExpressionLibrary
 */
function getLayerWorldSpeed(t, l) {
	return length(getWorldVelocity(t, l));
}