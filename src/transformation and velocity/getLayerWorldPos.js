/**
 * Gets the world position of a layer.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [l=thisLayer] The layer
 * @return {number[]} The world position
 */
function getLayerWorldPos(t, l) {
	if (typeof t === 'undefined') t = time;
	if (typeof l === 'undefined') l = thisLayer;
	if (l.hasParent) return l.parent.toWorld(l.position, t);
	return l.position.valueAtTime(t);
}
