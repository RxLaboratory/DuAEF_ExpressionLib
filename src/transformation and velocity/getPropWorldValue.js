/**
 * Gets the world coordinates of a property.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [prop=thisProperty] The property
 * @return {number[]} The world coordinates
 * @requires getLayerWorldPos
 * @requires isPosition
 */
function getPropWorldValue(t, prop) {
	if (isPosition(prop)) return getLayerWorldPos(t);
	return thisLayer.toWorld(prop.valueAtTime(t), t);
}