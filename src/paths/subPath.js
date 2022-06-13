/**
 * Substracts two paths together.<br />
 * The paths must be objects with three array attributes: points, inTangents, outTangents
 * @function
 * @param {Object} path1 First path
 * @param {Object} path2 Second path
 * @param {float} path2weight A weight to multiply the second path values
 * @returns {Object} A path object with three array attributes: points, inTangents, outTangents
 * @requires subPoints
 * @category ExpressionLibrary
 */
function subPath(path1, path2, path2weight) {
    var vertices = subPoints(path1.points, path2.points, path2weight);
    var inT = subPoints(path1.inTangents, path2.inTangents, path2weight);
    var outT = subPoints(path1.outTangents, path2.outTangents, path2weight);
    var path = {};
    path.points = vertices;
    path.inTangents = inT;
    path.outTangents = outT;
    return path;
}