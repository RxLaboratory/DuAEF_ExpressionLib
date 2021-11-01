/**
 * Animatable equivalent to loopIn('continue').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @returns {float|float[]} The new value
 * @function
 * @requires getNextKey
 */
 function continueIn(t) {
	if (numKeys <= 1) return value;
	var firstKey = getNextKey(t, thisProperty);
	if (!firstKey) return value;
	var firstVelocity = velocityAtTime(firstKey.time + 0.001);
	var timeSpent = firstKey.time - t;
	return firstKey.value - timeSpent * firstVelocity;
}