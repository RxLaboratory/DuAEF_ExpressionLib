/**
 * Checks the next time at which the property value was not 0. (meant to be used on boolean property, works on single dimension properties too).
 * @param {Property} prop The property to check
 * @param {float} t The time after which to run the check
 * @returns {float} The next active time after t
 * @function
 * @requires getNextKey
 * @category ExpressionLibrary
 */
function nextActiveTime( prop, t )
{
	if ( prop.valueAtTime(t) ) return t;
	
	while( t < thisComp.duration )
	{
		var nextKey = getNextKey( t + .001, prop );
		if ( !nextKey ) break;
		t = nextKey.time;
		if ( nextKey.value ) return t;
	}
	return 0;
}
