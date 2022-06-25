/**
 * Animatable equivalent to loopOut('continue').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {float} [damping=0] Exponentially attenuates the effect over time
 * @returns {float|float[]} The new value
 * @function
 * @requires getNextKey
 * @category ExpressionLibrary
 */
function continueOut(t, damping) {
	if (numKeys <= 1) return value;
	var lastKey = getPrevKey(t, thisProperty);
	if (!lastKey) return value;
	var lastVelocity = velocityAtTime(lastKey.time - 0.001);
	var timeSpent = t - lastKey.time;
	
	var damp = Math.exp(timeSpent * damping);

	return lastKey.value + (timeSpent * lastVelocity) / damp;
}