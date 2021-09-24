/**
 * Checks the last previous time at which the property value was not 0. (meant to be used on boolean property, works on single dimension properties too).
 * @param {Property} prop The property to check
 * @param {float} t The time before which to run the check
 * @returns {float} The last active time before t
 * @function
 * @requires getPrevKey
 */
function lastActiveTime( prop, t ) {
	if ( prop.valueAtTime(t) ) return t;
	
	while( t > 0 )
	{
		var prevKey = getPrevKey( t, prop );
		if ( !prevKey ) break;
		if ( prevKey.value ) return t;
		t = prevKey.time - .001;
	}
	return 0;
}