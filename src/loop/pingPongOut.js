/**
 * Animatable equivalent to loopOut('pingpong').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @returns {float} The new value
 * @function
 */
function pingPongOut( t, nK ) {
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
	var loopTime = loopDuration - timeSpent;
	if (numLoops > 0)
	{
		loopTime = timeSpent - numLoops * loopDuration;
		if (numLoops % 2 == 0) loopTime = loopDuration - loopTime;
	}
	return valueAtTime( loopStartTime + loopTime );
}
