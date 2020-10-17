/**
 * Gets the key immediately after the given time<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] Time at which to get the key
 * @return {Key|null} The key, or null if there's no key before.
 */
function getNextKey(t) {
    if (numKeys == 0) return null;
    var nKey = nearestKey(t);
    if (nKey.time >= t) return nKey;
    if (nKey.index < numKeys) return key(nKey.index + 1);
    return null;
  }
  