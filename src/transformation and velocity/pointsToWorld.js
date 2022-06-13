/**
 * Transform the points from layer to world coordinates
 * @function
 * @param {float[][]} points The points
 * @param {Layer} layer The layer
 * @return {float[][]} The points in world coordinates
 * @category ExpressionLibrary
 */
function pointsToWorld( points, layer ) {
    for (var i = 0; i < points.length; i++) {
        points[i] = layer.toWorld(points[i]);
    }
    return points;
}