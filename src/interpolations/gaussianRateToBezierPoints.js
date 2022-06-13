/**
 * Converts a Gaussian rate (as used with <code>gaussianInterpolation</code>) to the closest possible Bézier controls for use with <code>bezierInterpolation</code>.
 * @function
 * @param {number} rate The raising speed in the range [-1.0, 1.0].
 * @return {number} the value.
 * @category ExpressionLibrary
 */
function gaussianRateToBezierPoints(rate) {
    var i = 0;
    var o = 1;
    if (rate <= -.025) {
      i = linear(rate, -0.4, -0.025, 0.17, 0.415);
      o = 1-easeIn(rate, -0.4, -0.025, 1, 0.415);
    }
    else {
      i = linear(rate, -0.025, 0.7, 0.415, 1);
      o = 1-easeOut(rate, -0.025, 0.7, 0.415, 0.15);
    }
    return [i,0,o,1];
  }