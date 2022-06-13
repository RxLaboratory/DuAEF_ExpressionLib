/**
 * Gets a property from an array of indices as returned by getPropPath.
 * @function
 * @param {Layer} l The layer containing the needed property
 * @param {int[]} p The indices to the property.
 * @return {Property} The property.
 * @category ExpressionLibrary
 */
function getPropFromPath( l, p )
{
	prop = l;
	for ( var i = p.length - 1; i >= 0; i-- )
		prop = prop(p[i]);
	return prop;
}