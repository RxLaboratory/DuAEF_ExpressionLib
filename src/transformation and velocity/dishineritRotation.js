/**
 * Removes the ancestors rotation from the rotation of a layer.
 * This is very useful to make a layer keep its orientation without being influenced by its parents.<br />
 * @function
 * @example
 * //in a rotation property, just include the function and use:
 * dishineritRotation();
 * //the layer will now keep its own orientation.
 * @example
 * //you can also combine the result with something else
 * var result = dishineritRotation();
 * result + wiggle(5,20);
 * @function
 * @param {Layer} [l=thisLayer] The layer
 * @return {float} The new rotation value, in degrees.
 * @requires sign
 * @category ExpressionLibrary
 */
function dishineritRotation( l ) {
    if (typeof l === 'undefined') l = thisLayer;
    var r = l.rotation.value;
    while ( l.hasParent ) {
        l = l.parent;
        var s = l.scale.value;
        r -= l.rotation.value * Math.sign(s[0]*s[1]);
    }
    return r;
}