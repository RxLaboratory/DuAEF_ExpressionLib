/**
 * Gets the world position of a layer.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Layer} other The other layer
 * @param {Layer} [origin=thisLayer] The origin
 * @param {number} [t=time] Time from when to get the position
 * @return {number[]} The world position
 * @requires getLayerWorldPos
 * @category ExpressionLibrary
 */
function getLayerDistance(other, origin, t) {
    if (typeof origin === 'undefined') origin = thisLayer;
    if (typeof t === 'undefined') t = time;
    var p1 = getLayerWorldPos(t, other);
    var p2 = getLayerWorldPos(t, origin);
	return length(p1, p2);
}
