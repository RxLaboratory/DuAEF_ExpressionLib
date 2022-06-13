/**
 * Checks if a property is a path property.
 * @function
 * @param {Property} prop The property
 * @return {boolean} true if the property is a path property.
 * @category ExpressionLibrary
 */
function isPath(prop) {
    try {
        createPath();
        return true;
    } catch (e) {
        return false;
    }
}