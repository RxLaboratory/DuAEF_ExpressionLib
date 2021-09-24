/**
 * Animatable equivalent to loopOut('continue').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @returns {float|float[]} The new value
 * @function
 */
function continueOut( t ) {
	if (numKeys <= 1) return value;
	
	var lastKey = key(numKeys);
	if (t <= lastKey.time) return value;
	
	var lastVelocity = velocityAtTime( lastKey.time - 0.001 );
	var timeSpent = t - lastKey.time;
	return lastKey.value + timeSpent * lastVelocity;
}
