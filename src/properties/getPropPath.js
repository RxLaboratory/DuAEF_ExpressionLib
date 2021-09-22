/**
 * Gets an array of all indices needed to get the current property from the layer level.
 * @function
 * @return {int[]} All indices to the property.
 */
function getPropPath()
{
	var path = [];
	var prop = thisProperty;
	ok = true;
	while( ok )
	{	
		try {
			path.push( prop.propertyIndex );
			prop = prop.propertyGroup();
		}
		catch (e) { ok = false; }
	}
	return path;
}