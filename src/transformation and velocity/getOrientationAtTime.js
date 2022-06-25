/**
 * Gets the world orientation of a (2D) layer at a specific time.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Layer} l The layer to get the orientation from
 * @param {float} [t=time] The time at which to get the orientation
 * @return {float} The orientation, in degrees.
 * @category ExpressionLibrary
 */
function getOrientationAtTime( l, t ) {
    var r = 0;
    r += l.rotation.valueAtTime( t );
    while ( l.hasParent ) {
        l = l.parent;
        r += l.rotation.valueAtTime( t );
    }
    return r;
}