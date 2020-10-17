/**
 * Gets the "real" scale of a layer, resulting to its scale property, the scale of its parents, and it's location in Z-space if it's 3D.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Layer} [l=thisLayer] The layer 
 * @param {number} [t=time] The time when to get the scale
 * @return {number} The scale ratio. This is not a percent, 1.0 is 100%.
 */
function getCompScale( l, t ) {
	//get ratio 
	var originalWidth = length( l.anchorPoint, [ l.width, 0 ] );
	var anchorInComp = l.toComp( l.anchorPoint, t );
	var widthInComp = l.toComp( [ l.width, 0 ], t );
	var newWidth = length(anchorInComp, widthInComp);
	return newWidth / originalWidth;
}