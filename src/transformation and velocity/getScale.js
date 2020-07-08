/**
 * Gets the world scale of a layer.
 * @function
 * @param {Layer} l The layer to get the scale from
 * @return {float[]} The scale, in percent.
 */
function getScale( l ) {
    var s = l.scale.value;
	var threeD = s.length == 3;
    while ( l.hasParent ) {
        l = l.parent;
        var ps = l.scale.value / 100;
		if (threeD && ps.length == 3) {
			s = [ s[0]*ps[0], s[1]*ps[1], s[2]*ps[2] ];
		}
		else if (threeD) {
			s = [ s[0]*ps[0], s[1]*ps[1], s[2] ];
		}
		else {
			s = [ s[0]*ps[0], s[1]*ps[1] ];
		}
    }
    return s;
}