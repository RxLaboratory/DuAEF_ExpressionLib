/**
 * Animatable equivalent to loopIn('pingpong').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @param {float} [damping=0] Exponentially attenuates the effect over time
 * @returns {float} The new value
 * @function
 * @requires getNextKey
 * @memberof ExpressionLibrary
 */
 function pingPongIn(t, nK, vAtTime, damping) {
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
	  var loopTime = timeSpent;
	  if (numLoops > 0) {
		  loopTime = timeSpent - numLoops * loopDuration;
		  if (numLoops % 2 != 0) loopTime = loopDuration - loopTime;
	  }
	  
	  var damp = Math.exp(timeSpent * damping);
	  
	  return ( vAtTime(loopStartTime + loopTime) - currentValue) / damp + currentValue;
  }