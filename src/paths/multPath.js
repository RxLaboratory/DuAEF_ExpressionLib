/**
 * Multiplies a path with a scalar.<br />
 * The path must be an object with three array attributes: points, inTangents, outTangents
 * @function
 * @param {Object} path The path
 * @param {float} weight The multipliers
 * @returns {Object} A path object with three array attributes: points, inTangents, outTangents
 * @requires multPoints
 * @category ExpressionLibrary
 * @category ExpressionLibrary
 */
function multPath(path, weight) {
    var vertices = multPoints(path.points, weight);
    var inT = multPoints(path.inTangents, weight);
    var outT = multPoints(path.outTangents, weight);
    var path = {};
    path.points = vertices;
    path.inTangents = inT;
    path.outTangents = outT;
    return path;
}