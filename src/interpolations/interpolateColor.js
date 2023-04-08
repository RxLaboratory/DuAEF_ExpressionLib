/**
 * Fixes interpolation of colors by using HSL or a smart HSL taking the smallest path
 * @function
 * @param {number} [t=time] The value to interpolate and extrapolate
 * @param {int} [mode=2] How to interpolate the colors, one of: 0 for 'RGB', 1 for 'HSL', or 2 for 'smartHSL'
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number[]} [colorA=[0,0,0,0]] The first color
 * @param {number[]} [colorB=[1,1,1,1]] The second color
 * @param {function} [interpolationMethod=ease] The interpolation function, like linear(), easeIn(), easeOut(), etc.<br/>
 * Or any other method taking the same five arguments.
 * @category ExpressionLibrary
 */
function interpolateColor(t, mode, tMin, tMax, colorA, colorB, interpolationMethod) {
    if (typeof t === 'undefined') t = time;
    if (typeof mode === 'undefined') mode = 'smartHSL';
    if (typeof tMin === 'undefined') tMin = 0;
    if (typeof tMax === 'undefined') tMax = 1;
    if (typeof colorA === 'undefined') colorA = [0,0,0,0];
    if (typeof colorB === 'undefined') colorB = [1,1,1,1];
    if (typeof interpolationMethod === 'undefined') interpolationMethod = ease;
        
    var result = [0,0,0,0];
    
    if (mode == 2 || mode == 1) {
        var a = rgbToHsl(colorA);
        var b = rgbToHsl(colorB);
        var dist = Math.abs( a[0] - b[0] );
    
        result = interpolationMethod(t, tMin, tMax, a, b);
        
        if (dist > 0.5 && mode == 'smartHSL') {
            var hA = a[0];
            var hB = b[0];
            var h = hA;
            dist = 1-dist;
            if (hA < hB) {
                var limit = hA / dist * tMax;
                if (t < limit) h = interpolationMethod(t, tMin, limit, hA, 0);
                else h = interpolationMethod(t, limit, tMax, 1, hB);
            }
            else {
                var limit = (1-hA) / dist * tMax;
                if (t < limit) h = interpolationMethod(t, tMin, limit, hA, 1);
                else h = interpolationMethod(t, limit, tMax, 0, hB);
            }
            result = [h, r[1], r[2], r[3]];
        }
        result = hslToRgb(result);
    }
    else result = interpolationMethod(time, tMin, tMax, a, b);
    
    return result;
}