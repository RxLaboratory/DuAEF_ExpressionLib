/**
 * Checks if a property is spatial
 * @param {Property} prop The property to check
 * @return {boolean} true if the property is spatial.
 */
function isSpatial(prop) {
	if (!(prop.value instanceof Array)) return false;
	if (prop.value.length != 2 && prop.value.length != 3) return false;
	try { if (typeof prop.speed !== "undefined") return true; }
	catch (e) { return false; }
}