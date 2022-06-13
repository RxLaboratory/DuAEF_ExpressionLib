/**
 * Gets the previous key where there is no motion before it
 * @function
 * @param {number} [t=time] Time at which to get the key
 * @param {Property} [prop=thisProperty] The property from which to get the key
 * @return {Key|null} The key, or null if there's no key before.
 * @requires isStill
 * @requires getPrevKey
 * @memberof ExpressionLibrary
 */
function getPrevStartKey(t, prop) {
    if (typeof t === 'undefined') t = time;
    if (typeof prop === 'undefined') prop = thisProperty;
    
    var k = getPrevKey(t, prop);
    if (!k) return null;
    
    var i = k.index;
    while (i > 0) {
      if (isStill( k.time - thisComp.frameDuration )) return k;
      k = key(k.index - 1);
    }
    return k;
  }
  