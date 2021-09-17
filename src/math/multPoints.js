/**
 * Multiplies a list of points/vectors with a scalar.
 * @function
 * @param {float[][]} p The list of points
 * @param {float} w The multiplier
 * @returns {float[][]} The multiplied points
 */
function multPoints(p, w) {
    var r = [];
    for (var i = 0, n = p.length; i < n; i++) {
        r.push(p[i] * w);
    }
    return r;
}