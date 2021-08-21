/**
 * Substracts two lists of points/vectors.
 * @function
 * @param {float[][]} p1 The list of points
 * @param {float[][]} p2 The other list of points
 * @param {float} w A weight to multiply the values of p2
 * @returns {float[][]} The substracted points
 */
function subPoints(p1, p2, w) {
    var n = p1.length;
    if (p2.length > n) n = p2.length;
    var r = [];
    for (var i = 0; i < n; i++) {
        if (i >= p1.length) {
            r.push(-p2[i] * w);
            continue;
        }
        if (i >= p2.length) {
            r.push(p1[i]);
            continue;
        }
        r.push(p1[i] - p2[i] * w);
    }
    return r;
}ç