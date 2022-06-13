/**
 * Animatable equivalent to loopIn('continue').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @param {float} [damping=0] Exponentially attenuates the effect over time
 * @returns {float|float[]} The new value
 * @function
 * @requires getNextKey
 * @memberof ExpressionLibrary
 */
 function continueIn(t, damping) {
	if (numKeys <= 1) return value;
	var firstKey = getNextKey(t, thisProperty);
	if (!firstKey) return value;
	var firstVelocity = velocityAtTime(firstKey.time + 0.001);
	var timeSpent = firstKey.time - t;
	
	var damp = Math.exp(timeSpent * damping);
	
	return (-timeSpent * firstVelocity) / damp + firstKey.value;
}
