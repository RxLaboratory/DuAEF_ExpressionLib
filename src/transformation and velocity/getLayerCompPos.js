/**
 * Gets the comp position (2D Projection in the comp) of a layer.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [l=thisLayer] The layer
 * @return {number[]} The comp position
 */
function getLayerCompPos( t, l ) {
    return l.toComp( l.anchorPoint, t );
}