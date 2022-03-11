/**
 * Gets the comp position (2D Projection in the comp) of a layer.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [l=thisLayer] The layer
 * @return {number[]} The comp position
 */
function getLayerCompPos( t, l ) {
    if (typeof t === 'undefined') t = time;
	if (typeof l === 'undefined') l = thisLayer;
    if (l.hasParent) return l.parent.toComp(l.position, t);
	return l.toComp(l.anchorPoint, t);
}