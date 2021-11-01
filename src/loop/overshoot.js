/**
 * Overshoot animation, to be used when the speed is 0.
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {float} elasticity The elasticity, which controls the amplitude and frequence according to the last known velocity
 * @param {float} damping Damping
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float|float[]} The new value
 * @function
 * @requires getPrevKey
 */
function overShoot(t, elasticity, damping, vAtTime) {

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
	var oShootStart = 0;
	var oShootTime = 0;
  
    //follow through starts at previous key
    var oShootKey = getPrevKey(t, thisProperty);
    oShootStart = oShootKey.time;

    // Time spent since start time
	oShootTime = t - oShootStart;
	
	// Last velocity
	pVelocity = ( vAtTime( oShootStart ) - vAtTime( oShootStart - thisComp.frameDuration * .5 ) );

	// damping ratio
	var damp = Math.exp(oShootTime * damping);
	// sinus evolution 
	var sinus = elasticity * oShootTime * 2 * Math.PI;
	//sinus
	sinus = Math.sin(sinus);
	// elasticity
	sinus = (.3 / elasticity) * sinus;
	// damping
	sinus = sinus / damp;
	// Stop when too small
	if (Math.abs(sinus) < .00001) return value;
	// Result from velocity
	var oShoot = ( pVelocity / thisComp.frameDuration ) * sinus;
	
	return oShoot+value;
}