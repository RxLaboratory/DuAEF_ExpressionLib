/**
 * Animatable equivalent to loopOut('cycle') and loopOut('offset').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {Boolean} o Wether to offset or cycle
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @param {float} [damping=0] Exponentially attenuates the effect over time
 * @returns {float|float[]} The new value
 * @function
 * @requires getPrevKey
 */
 function cycleOut(t, nK, o, vAtTime, damping) {
	var currentValue = vAtTime(t);
	
	  if (numKeys <= 1) return currentValue;
	  var firstKeyIndex = 1;
	  
	  var lastKey = getPrevKey(t, thisProperty);
	  if (!lastKey) return currentValue;
	  if (lastKey.index == firstKeyIndex) return currentValue;
	  
	  if (nK >= 2) {
		  nK = nK - 1;
		  firstKeyIndex = lastKey.index - nK;
		  if (firstKeyIndex < 1) firstKeyIndex = 1;
	  }
	  
	  var loopStartTime = key(firstKeyIndex).time;
	  var loopEndTime = key(lastKey.index).time;
	  var loopDuration = loopEndTime - loopStartTime;
	  if (t <= loopEndTime) return currentValue;
	  var timeSpent = t - loopEndTime;
	  var numLoops = Math.floor(timeSpent / loopDuration);
	  var loopTime = timeSpent;
	  if (numLoops > 0) loopTime = timeSpent - numLoops * loopDuration;
	  var r = vAtTime(loopStartTime + loopTime);
	  if (o) r += (key(lastKey.index).value - key(firstKeyIndex).value) * (numLoops + 1);
	  
	  var damp = Math.exp(timeSpent * damping);
	  
	  return (r-currentValue) / damp + currentValue;
  }