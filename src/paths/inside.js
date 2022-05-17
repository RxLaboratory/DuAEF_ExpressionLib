/**
 * Checks if a point is inside a given polygon.
 * @function
 * @name inside
 * @param {float[]} point A 2D point [x, y]
 * @param {float[][]} points The vertices of the polygon
 * @returns {object} An object with two properties:  
 * - `inside (bool)` is true if the point is inside the polygon
 * - `closestVertex` is the index of the closest vertex of the polygon
 */
function inside( point, points ) {
    var x = point[ 0 ],
        y = point[ 1 ];
    var result = 0;
    var inside = false;
    for ( var i = 0, j = points.length - 1; i < points.length; j = i++ ) {
        var xi = points[ i ][ 0 ],
            yi = points[ i ][ 1 ];
        var xj = points[ j ][ 0 ],
            yj = points[ j ][ 1 ];
        var intersect = ( ( yi > y ) != ( yj > y ) ) &&
            ( x <
                ( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi );
        if ( intersect ) inside = !inside;

        var t1 = length( points[ i ], point );
        var t2 = length( points[ result ], point );
        if ( t1 < t2 ) {
            result = i;
        }
    }
    return { inside: inside, closestVertex: result };
};