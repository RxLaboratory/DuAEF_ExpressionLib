/**
    * Gets the distance of a point to a line
    * @function
    * @param {float[]} point The point [x,y]
    * @param {float[][]} line The line [ A , B ] where A and B are two points
    * @return {float} The distance
    * @category ExpressionLibrary
    */
function distanceToLine( point, line ) {
    var b = line[0];
    var c = line [1];
    var a = point;
    var line = Math.pow( length( b, c ), 2 );
    if ( line === 0 ) return Math.pow( length( a, b ), 2 );
    var d = ( ( a[ 0 ] - b[ 0 ] ) * ( c[ 0 ] - b[ 0 ] ) + ( a[ 1 ] - b[ 1 ] ) * ( c[ 1 ] - b[ 1 ] ) ) / line;
    d = Math.max( 0, Math.min( 1, d ) );
    var distance = Math.pow( length( a, [ b[ 0 ] + d * ( c[ 0 ] - b[ 0 ] ), b[ 1 ] + d * ( c[ 1 ] - b[ 1 ] ) ] ), 2 );

    return Math.sqrt( distance );
};