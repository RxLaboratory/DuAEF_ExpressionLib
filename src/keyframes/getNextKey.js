/**
 * Gets the key immediately before the given time
 * @function
 * @param {number} t Time at which to get the key
 * @param {Property} prop The property from which to get the key
 * @return {Key|null} The key, or null if there's no key before.
 */
function getNextKey(t, prop) {
    if (prop.numKeys == 0) return null;
    var nKey = prop.nearestKey(t);
    if (nKey.time >= t) return nKey;
    if (nKey.index < prop.numKeys) return prop.key(nKey.index + 1);
    return null;
}