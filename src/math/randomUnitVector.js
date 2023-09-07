/**
 * Generates a unit vector in 2 or 3 dimensions
 * @function
 * @param {Number} dimensions The number of dimensions, either 2 or 3
 * @returns {Number[]} The vector
 * @category ExpressionLibrary
 */
function randomUnitVector( dimensions ) {
    var angle = random(0, 2*Math.PI);
    if (dimensions == 2) {
        return [Math.cos(angle), Math.sin(angle)];
    }
    else if (dimensions == 3) {
        var z = random(-1, 1);
        var f = Math.sqrt(1-z*z);
        return [
            f*Math.cos(angle),
            f*Math.sin(angle),
            z
        ];
    }
    else {
        // NOT IMPLEMENTED
        return null;
    }
}
