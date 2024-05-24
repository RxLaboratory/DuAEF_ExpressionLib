/**
 * Checks if a property is a shape layer.
 * @function
 * @param {Property} [lay=thisLayer] - The layer to test
 * @return {boolean} true if the prop is a layer
 * @category ExpressionLibrary
 */
function isShapeLayer( lay ) {
    if (typeof(lay) === 'undefined')
        lay = thisLayer;
    try { if (lay("ADBE Root Vectors Group")) return true; }
    catch (e) { return false; }
}