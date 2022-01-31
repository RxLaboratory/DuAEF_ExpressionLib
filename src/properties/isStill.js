/**
 * Checks if the current property is animated at a given time.
 * @function
 * @param {number} [t=time] The time
 * @param {number} [threshold=0.01] The speed under which the property is considered still.
 * @param {number} [axis=-1] The axis to check. If < 0, will check all axis.
 * @return {boolean} true if the property does not vary.
 */
function isStill(t, threshold) {
	if (typeof t === 'undefined') t = time;
	if (typeof threshold === 'undefined') threshold = 0.01;
	if (typeof axis === 'undefined') axis = -1;
  
	var d = valueAtTime(t) - valueAtTime(t + thisComp.frameDuration*.1);
  
	if (d instanceof Array) {
	  // Check given axis
	  if (axis >= 0) return Math.abs(d[i]) >= threshold;
	  // Check all axis
	  for (var i = 0; i < d.length; i++) {
		if (Math.abs(d[i]) >= threshold) return false;
	  }
	  return true;
	} else return Math.abs(d) < threshold;
  }