/**
 * Gets the same property as the current one but from another layer.
 * @function
 * @param {Layer} l The layer containing the needed property
 * @return {Property} The property.
 * @requires getPropFromPath
 * @requires getPropPath
 * @category ExpressionLibrary
 */
function getSameProp( l )
{
	return getPropFromPath( l, getPropPath() );
}