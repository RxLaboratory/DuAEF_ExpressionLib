/**
 * Animatable equivalent to loopIn('pingpong').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float} The new value
 * @function
 */
 function pingPongIn( t, nK, vAtTime ) {
	if (numKeys <= 1) return value;
	
	var lasttKeyIndex = numKeys;
	if (nK >= 2)
	{
		nK = nK - 1;
		lasttKeyIndex = 1 + nK;
		if (lasttKeyIndex > numKeys) lasttKeyIndex = numKeys;
	}
	
	var loopStartTime = key( 1 ).time;
	var loopEndTime = key( lasttKeyIndex ).time;
	var loopDuration = loopEndTime - loopStartTime;
	
	if (t >= loopStartTime) return value;
	
	var timeSpent = loopStartTime - t;
	var numLoops = Math.floor( timeSpent / loopDuration );
	var loopTime = timeSpent;
	if (numLoops > 0)
	{
		loopTime = timeSpent - numLoops * loopDuration;
		if (numLoops % 2 != 0) loopTime = loopDuration - loopTime;
	}
	return vAtTime( loopStartTime + loopTime );
}