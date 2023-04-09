/**
 * Fixes interpolation of colors by using HSL or a smart HSL taking the smallest path
 * @function
 * @param {number} [t=time] The value to interpolate and extrapolate
 * @param {int} [mode=2] How to interpolate the colors, one of: 0 for 'RGB', 1 for 'HSL', or 2 for 'shortest-path HSL', 3 for 'longest-path HSL', or 4 for 'combined-RGB SL'
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number[]} [colorA=[0,0,0,0]] The first color
 * @param {number[]} [colorB=[1,1,1,1]] The second color
 * @param {function} [interpolationMethod=ease] The interpolation function, like linear(), easeIn(), easeOut(), etc.<br/>
 * Or any other method taking the same five arguments.
 * @category ExpressionLibrary
 */
function interpolateColor(t, colorspace, tMin, tMax, colorA, colorB, interpolationMethod) {
    if (typeof t === 'undefined') t = time;
    if (typeof colorspace === 'undefined') colorspace = 2;
    if (typeof tMin === 'undefined') tMin = 0;
    if (typeof tMax === 'undefined') tMax = 1;
    if (typeof colorA === 'undefined') colorA = [0, 0, 0, 0];
    if (typeof colorB === 'undefined') colorB = [1, 1, 1, 1];
    if (typeof interpolationMethod === 'undefined') interpolationMethod = ease;
    var result = [0, 0, 0, 0];
    if (colorspace > 0 && colorspace < 4) {
        var a = rgbToHsl(colorA);
        var b = rgbToHsl(colorB);
        var dist = Math.abs(a[0] - b[0]);
        result = interpolationMethod(t, tMin, tMax, a, b);
        if ((dist > 0.5 && colorspace == 2) || (dist < 0.5 && colorspace == 3)) {
            var hA = a[0];
            var hB = b[0];
            var h = hA;
            dist = 1 - dist;
            if (hA < hB) {
                var limit = hA / dist * tMax;
                if (t < limit) h = interpolationMethod(t, tMin, limit, hA, 0);
                else h = interpolationMethod(t, limit, tMax, 1, hB);
            } else {
                var limit = (1 - hA) / dist * tMax;
                if (t < limit) h = interpolationMethod(t, tMin, limit, hA, 1);
                else h = interpolationMethod(t, limit, tMax, 0, hB);
            }
            result = [h, result[1], result[2], result[3]];
        }
        result = hslToRgb(result);
    }
	else {
		var rgbResult = interpolationMethod(t, tMin, tMax, colorA, colorB);
		if (colorspace == 0) result = rgbResult;
		else {
			var a = rgbToHsl(colorA);
			var b = rgbToHsl(colorB);
			var hslResult = interpolationMethod(t, tMin, tMax, a, b);
			var h = rgbToHsl(rgbResult)[0];
			result = [h, hslResult[1], hslResult[2], hslResult[3]];
			result = hslToRgb(result);
		}
	}
    return result;
}