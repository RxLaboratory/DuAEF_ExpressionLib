/**
 * Animatable equivalent to loopIn('cycle') and loopIn('offset').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {Boolean} o Wether to offset or cycle
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @param {float} [damping=0] Exponentially attenuates the effect over time
 * @returns {float|float[]} The new value
 * @function
 * @requires getNextKey
 * @memberof ExpressionLibrary
 */
 function cycleIn(t, nK, o, vAtTime, damping) {
	var currentValue = vAtTime(t);
	
	  if (numKeys <= 1) return currentValue;
	  var lastKeyIndex = numKeys;
	  
	  var firstKey = getNextKey(t, thisProperty);
	  if (!firstKey) return currentValue;
	  if (firstKey.index == lastKeyIndex) return currentValue;
	  
	  if (nK >= 2) {
		  nK = nK - 1;
		  lastKeyIndex = firstKey.index + nK;
		  if (lastKeyIndex > numKeys) lastKeyIndex = numKeys;
	  }
	  
	  var loopStartTime = firstKey.time;
	  var loopEndTime = key(lastKeyIndex).time;
	  var loopDuration = loopEndTime - loopStartTime;
	  if (t >= loopStartTime) return currentValue;
	  var timeSpent = loopStartTime - t;
	  var numLoops = Math.floor(timeSpent / loopDuration);
	  var loopTime = loopDuration - timeSpent;
	  if (numLoops > 0) loopTime = loopDuration - (timeSpent - numLoops * loopDuration);
	  var r = vAtTime(loopStartTime + loopTime);
	  if (o) r -= (key(lastKeyIndex).value - firstKey.value) * (numLoops + 1);
	  
	  var damp = Math.exp(timeSpent * damping);
  
	  return (r-currentValue) / damp + currentValue;
  }