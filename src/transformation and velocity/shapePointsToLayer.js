/**
 * Gets the points of the shape path in layer coordinates (applies the group transform)
 * @function
 * @param {Property} prop The property from which to get the path
 * @return {float[][]} The points in layer coordinates
 * @requires getGroupTransformMatrix
 */
function shapePointsToLayer( prop ) {
    var points = prop.points();
    var matrix = getGroupTransformMatrix( prop );
    for (var i = 0; i < points.length; i++) {
        points[i] = matrix.applyToPoint( points[i] );
    }
    return points;
}