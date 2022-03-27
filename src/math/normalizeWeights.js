/**
 * Normalizes a list of weights so their sum equals 1.0
 * @function
 * @param {float[]} weights The weights to normalize
 * @param {float} [sum] The sum of the weights; provide it if it's already computed to improve performance.
 * @returns {float[]} The normalized weights
 */
function normalizeWeights(weights, sum) {
    if(typeof sum === 'undefined') {
        sum = 0;
        for (var i = 0, n = weights.length; i < n; i++) {
          sum += weights[i];
        }
      }
    if (sum == 1 || sum == 0) return weights;
    var o = 1 - sum;
    var normalized = [];
    for (var i = 0, n = weights.length; i < n; i++) {
        var w = weights[i];
        normalized.push(w + (w / sum) * o);
    }
    return normalized;
}