/**
 * Integrates the (linear) keyframe values. Useful to animate frequencies!
 * cf. {@link http://www.motionscript.com/articles/speed-control.html} for more explanation.
 * @function
 * @param {Property} [prop=thisProperty] The property with the keyframes.
 * @memberof ExpressionLibrary
 */
function integrateLinearKeys( prop ) {
    if (typeof prop === 'undefined') prop = thisProperty;
    var nK = prop.numKeys;

    if (nK < 2) return prop.value*(time - inPoint);
    if (prop.key(1).time > time ) return prop.value*(time - inPoint);

    var result = prop.key(1).value * (prop.key(1).time - inPoint);

    for (var i = 2; i <= nK; i++){
        if ( prop.key(i).time > time ) break;
        var k1 = prop.key(i-1);
        var k2 = prop.key(i);
        result += (k1.value + k2.value) * (k2.time - k1.time)/2;
    }
    result += (prop.value + prop.key(i-1).value) * (time - prop.key(i-1).time) / 2;
    
    return result;
}