/**
 * Checks if a property is a path property.
 * @function
 * @param {Property} prop The property
 * @return {boolean} true if the property is a path property.
 */
function isPath(prop) {
    if (typeof prop !== 'object') return false;
    if (prop instanceof Array) return false;
    try {
        createPath();
        return true;
    } catch (e) {
        return false;
    }
}