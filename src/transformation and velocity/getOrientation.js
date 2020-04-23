/**
 * Gets the world orientation of a (2D) layer.
 * @function
 * @param {Layer} l The layer to get the orientation from
 * @return {float} The orientation, in degrees.
 */
function getOrientation( l ) {
    var sign = getScaleMirror( l );
    var uTurn = getScaleUTurn( l )
    var r = l.rotation.value * sign + uTurn;
    while ( l.hasParent ) {
        l = l.parent;
        var lr = l.rotation.value;
        if (l.hasParent) {
            var s = l.parent.scale.value;
            lr *= Math.sign(s[0]*s[1]);
        }
        r += lr;
    }
    return r;
}

function getScaleMirror( l ) {
    if (typeof l === "undefined") l = thisLayer;
    var sign = 1;
    while (l.hasParent) {
      l = l.parent;
      var s = l.scale.value;
      sign *= Math.sign(s[0]*s[1]);
    }
    return sign;
}

function getScaleUTurn( l ) {
    if (typeof l === "undefined") l = thisLayer;
    var u = 1;
    while (l.hasParent) {
      l = l.parent;
      var s = l.scale.value;
      u = u*s[1];
    }
    if (u < 0) return 180;
    else return 0;
}