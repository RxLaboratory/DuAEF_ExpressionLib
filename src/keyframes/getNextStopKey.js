/**
 * Gets the next key where there is no motion after it
 * @function
 * @param {number} [t=time] Time at which to get the key
 * @param {Property} [prop=thisProperty] The property from which to get the key
 * @return {Key|null} The key, or null if there's no key before.
 * @requires isStill
 * @requires getNextKey
 * @category ExpressionLibrary
 */
function getNextStopKey(t, prop) {
    if (typeof t === 'undefined') t = time;
    if (typeof prop === 'undefined') prop = thisProperty;
    
    var k = getNextKey(t, prop);
    if (!k) return null;
    
    var i = k.index;
    while (i < prop.numKeys) {
      if (isStill( k.time + thisComp.frameDuration )) return k;
      k = key(k.index + 1);
    }
    return k;
  }