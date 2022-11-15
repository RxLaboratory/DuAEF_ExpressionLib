/**
 * Checks if the layer has been flipped (scale sign is not the same on both axis).
 * @function
 * @param {Layer} [l=thisLayer] The layer
 * @return {bool} Whether the layer is flipped
 * @category ExpressionLibrary
 * @requires sign
 */
function isLayerFlipped( l ) {
    if (typeof l === "undefined") l = thisLayer;
    var signX = Math.sign( l.scale.value[0] );
    var signY = Math.sign( l.scale.value[1] );
    return signX != signY;
}