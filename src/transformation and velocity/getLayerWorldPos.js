/**
 * Gets the world position of a layer.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [l=thisLayer] The layer
 * @return {number[]} The world position
 */
function getLayerWorldPos(t, l) {
	return l.toWorld(l.anchorPoint, t);
}
