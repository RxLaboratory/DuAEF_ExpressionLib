/**
 * Animatable equivalent to loopOut('cycle') and loopOut('offset').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {Boolean} o Wether to offset or cycle
 * @returns {float|float[]} The new value
 * @function
 */
function cycleOut( t, nK, o ) {
	if (numKeys <= 1) return value;
	
	var firstKeyIndex = 1;
	if (nK >= 2)
	{
		nK = nK - 1;
		firstKeyIndex = numKeys - nK;
		if (firstKeyIndex < 1) firstKeyIndex = 1;
	}
	
	var loopStartTime = key( firstKeyIndex ).time;
	var loopEndTime = key( numKeys ).time;
	var loopDuration = loopEndTime - loopStartTime;
	
	if (t <= loopEndTime) return value;
	
	var timeSpent = t - loopEndTime;
	var numLoops = Math.floor( timeSpent / loopDuration );
	var loopTime = timeSpent;
	if (numLoops > 0) loopTime = timeSpent - numLoops * loopDuration;
	var r = valueAtTime( loopStartTime + loopTime );
	if (o) r += ( key( numKeys ).value - key( firstKeyIndex ).value ) * ( numLoops + 1 );
	return r;
}