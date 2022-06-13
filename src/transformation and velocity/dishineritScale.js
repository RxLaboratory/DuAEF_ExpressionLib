/**
 * Removes the ancestors scale from the scale of a layer.
 * This is very useful to make a layer keep its scale without being influenced by its parents.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @example
 * //in a rotation property, just include the function and use:
 * dishineritScale();
 * //the layer will now keep its own scale.
 * @example
 * //you can also combine the result with something else
 * var result = dishineritScale();
 * result + wiggle(5,20);
 * @function
 * @param {Layer} [l=thisLayer] The layer
 * @return {float[]} The new scale value, in percent.
 * @category ExpressionLibrary
 */
function dishineritScale( l ) {
    var s = l.scale.value;
    var threeD = s.length == 3;
    while ( l.hasParent ) {
        l = l.parent;
        var ps = l.scale.value / 100;
		if (threeD && ps.length == 3) {
			s = [ s[0]/ps[0], s[1]/ps[1], s[2]/ps[2] ];
		}
		else if (threeD) {
			s = [ s[0]/ps[0], s[1]/ps[1], s[2] ];
		}
		else {
			s = [ s[0]/ps[0], s[1]/ps[1] ];
		}
    }
    return s;
}