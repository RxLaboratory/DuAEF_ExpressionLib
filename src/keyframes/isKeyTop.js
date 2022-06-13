/**
 * Checks if the key is a maximum or minimum
 * @function
 * @param {Keyframe} k The key to check
 * @param {int} axis The axis to check for multi-dimensionnal properties
 * @return {boolean} true if the key is a maximum or minimum
 * @category ExpressionLibrary
 */
function isKeyTop(k, axis) {
	var prevSpeed = velocityAtTime(k.time - thisComp.frameDuration/2);
	var nextSpeed = velocityAtTime(k.time + thisComp.frameDuration/2);
	if (value instanceof Array) {
		prevSpeed = prevSpeed[axis];
		nextSpeed = nextSpeed[axis];
	}
	if (Math.abs(prevSpeed) < 0.01 || Math.abs(nextSpeed) < 0.01) return true;
	return prevSpeed * nextSpeed < 0;
}