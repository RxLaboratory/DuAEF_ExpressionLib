/**
 * Animatable equivalent to loopIn('cycle') and loopIn('offset').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {Boolean} o Wether to offset or cycle
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float|float[]} The new value
 * @function
 */
 function cycleIn( t, nK, o, vAtTime ) {
	if (numKeys <= 1) return value;
	
	var lastKeyIndex = numKeys;
	if (nK >= 2)
	{
		nK = nK - 1;
		lastKeyIndex = 1 + nK;
		if (lastKeyIndex > numKeys) lastKeyIndex = numKeys;
	}
	
	var loopStartTime = key( 1 ).time;
	var loopEndTime = key( lastKeyIndex ).time;
	var loopDuration = loopEndTime - loopStartTime;
	
	if (t >= loopStartTime) return value;
	
	var timeSpent = loopStartTime - t;
	var numLoops = Math.floor( timeSpent / loopDuration );
	var loopTime = loopDuration - timeSpent;
	if (numLoops > 0) loopTime = loopDuration - ( timeSpent - numLoops * loopDuration );
	var r = vAtTime( loopStartTime + loopTime );
	if (o) r -= ( key( lastKeyIndex ).value - key( 1 ).value ) * ( numLoops + 1 );
	return r;
}
