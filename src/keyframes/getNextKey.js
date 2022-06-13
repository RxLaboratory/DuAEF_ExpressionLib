/**
 * Gets the key immediately before the given time
 * @function
 * @param {number} [t=time] Time at which to get the key
 * @param {Property} [prop=thisProperty] The property from which to get the key
 * @return {Key|null} The key, or null if there's no key before.
 * @memberof ExpressionLibrary
 */
function getNextKey(t, prop) {
    if (typeof t === 'undefined') t = time;
    if (typeof prop === 'undefined') prop = thisProperty;

    if (prop.numKeys == 0) return null;
    var nKey = prop.nearestKey(t);
    if (nKey.time >= t) return nKey;
    if (nKey.index < prop.numKeys) return prop.key(nKey.index + 1);
    return null;
}