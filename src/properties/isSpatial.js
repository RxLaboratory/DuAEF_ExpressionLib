/**
 * Checks if a property is spatial
 * @function
 * @param {Property} [prop=thisProperty] The property to check
 * @return {boolean} true if the property is spatial.
 * @category ExpressionLibrary
 */
function isSpatial(prop) {
	if (typeof prop === 'undefined') prop = thisProperty;
	if (!(prop.value instanceof Array)) return false;
	if (prop.value.length != 2 && prop.value.length != 3) return false;
	try { if (typeof prop.speed !== "undefined") return true; }
	catch (e) { return false; }
}