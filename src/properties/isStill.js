/**
 * Checks if the current property is animated at a given time.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] The time
 * @param {number} [threshold=0.1] The speed under which the property is considered still.
 * @return {boolean} true if the property does not vary.
 */
function isStill(t, threshold) {
	var d = valueAtTime(t) - valueAtTime(t + framesToTime(1));

	if (d instanceof Array) {
		for (var i = 0; i < d.length; i++) {
			d[i] = Math.abs(d[i]);
			if (d[i] >= threshold) {
				return false;
			}
		}
		return true;
	} else {
		d = Math.abs(d);
		return d < threshold;
	}
}