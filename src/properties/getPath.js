/**
 * Gets the path from the current property at a given time.
 * @function
 * @return {Object} A path object with three array attributes: points, inTangents, outTangents
 */
function getPath(t) {
    var path = {};
    path.points = points(t);
    path.inTangents = inTangents(t);
    path.outTangents = outTangents(t);
    return path;
}