/**
 * Translates a point with a layer, as if it was parented to it.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Layer} l The layer to get the translation from.
 * @param {float[]} [point=[0,0]] The [X,Y] point to translate (using world coordinates).
 * @param {float} [startT=0] The start time of the translation
 * @param {float} [endT=time] The end time of the translation
 * @return {float[]} The coordinates of the translated point.
 */
function translatePointWithLayer( l, point, startT, endT ) {
    try {
        var pos = l.fromWorld( point, startT );
    } catch ( e ) {
        var pos = [ 0, 0 ];
    }
    var prevPos = l.toWorld( pos, startT );
    var newPos = l.toWorld( pos, endT );
    return newPos - prevPos;
}
