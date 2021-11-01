/**
 * Bounce, to be used when the speed is 0.
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {float} elasticity The elasticity, which controls the amplitude and frequence according to the last known velocity
 * @param {float} damping Damping
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float|float[]} The new value
 * @function
 * @requires getPrevKey
 * @requires bezierInterpolation
 */
function bounce(t, elasticity, damping, vAtTime) {
  
    // Nothing without elasticity
      if (elasticity == 0) return value;
      
      // Needs keyframes
      if (numKeys < 2) return value;
      
      // The nearest key is the first one
      if (nearestKey(t).index == 1) return value;
      
      // Get the velocity and speed
      var pVelocity = ( vAtTime(t) - vAtTime( t - .01 ) ) * 100;
      var pSpeed = length( pVelocity );
  
      // Too fast
      if (pSpeed >= 0.001 ) return value;
      
      //check start and current time
      var bounceStart = 0;
      var bounceTime = 0;
  
      //follow through starts at previous key
    var bouceKey = getPrevKey(t, thisProperty);
    bounceStart = bouceKey.time;
  
    // Time spent since start time
      bounceTime = t - bounceStart;
      
      // Last velocity
      pVelocity = ( vAtTime( bounceStart ) - vAtTime( bounceStart - thisComp.frameDuration * .5 ) );
      var bounceValue = ( pVelocity / thisComp.frameDuration ) ;
      
      
      var cycleDamp = Math.exp(bounceTime * damping * .1);
      var damp = Math.exp(bounceTime * damping) / (elasticity / 2);
      var cycleDuration = 1 / (elasticity * 2);
      
    //round to whole frames for better animation
      cycleDuration = Math.round(timeToFrames(cycleDuration));
      cycleDuration = framesToTime(cycleDuration);
      var midDuration = cycleDuration / 2;
      var maxValue = bounceValue * midDuration;
      
    //check which cycle it is and cycvarime
      var cycvarime = bounceTime;
      // the number of cycles where we "cheat" which are rounded to two frames
      var numEndCycles = 1;
      
      while (cycvarime > cycleDuration) {
          cycvarime = cycvarime - cycleDuration;
          cycleDuration = cycleDuration / cycleDamp;
          //round everything to whole frames for better animation
          cycleDuration = Math.round(timeToFrames(cycleDuration));
          //this is where we cheat to continue to bounce on cycles < 2 frames
          if (cycleDuration < 2) {
              cycleDuration = 2;
              numEndCycles++;
          }
          cycleDuration = framesToTime(cycleDuration);
          midDuration = cycleDuration / 2;
          maxValue = bounceValue * midDuration / damp;
          if (numEndCycles > 100 / damping && maxValue < 0.001 ) return value;
      }
      
      if (cycvarime < midDuration) bounceValue = bezierInterpolation(cycvarime, 0, midDuration, 0, maxValue, [0, .1, .33, 1]);
      else bounceValue = bezierInterpolation(cycvarime, midDuration, cycleDuration, maxValue, 0, [.66, 0, 1, .9]);
      
      var prevValue = valueAtTime(bounceStart - thisComp.frameDuration);
      var startValue = valueAtTime(bounceStart);
      if (value instanceof Array) {
          for (var i = 0; i < prevValue.length; i++) {
              if (prevValue[i] > startValue[i]) bounceValue[i] = Math.abs(fThrough[i]);
              if (prevValue[i] < startValue[i]) bounceValue[i] = -Math.abs(fThrough[i]);
          }
      } else {
          if (prevValue > startValue) bounceValue = Math.abs(bounceValue);
          if (prevValue < startValue) bounceValue = -Math.abs(bounceValue);
      }
  
      return bounceValue + value;
  }