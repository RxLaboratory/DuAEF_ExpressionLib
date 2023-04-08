/**
 * Multiplies two sets of values, one with each other. If the lists are not the same length, additional values will be ignored
 * @function
 * @param {float[]} setA The first list
 * @param {float[]} setB The other list
 * @returns {float[]} The new values
 * @category ExpressionLibrary
 */
function multSets(setA, setB) {
    var r = [];
    var countA = setA.length;
    var countB = setB.length;
    var count = countA;
    if (countB < countA) count = countB;
    for (var i = 0; i < count; i++) {
        r.push(setA[i] * setB[i]);
    }
    return r;
}