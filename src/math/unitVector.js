/**
 * Creates a unit vector along a given axis
 * @function
 * @param {Number} dimensions 
 * @param {Number} axis 
 * @returns {Number[]}
 * @category ExpressionLibrary
 */
function unitVector(dimensions, axis) {
    var vec = new Array(dimensions)
    for (var i = 0; i < dimensions; i++) {
        if (i == axis) vec[i] = 1;
        else vec[i] = 0;
    }
    return vec;
}