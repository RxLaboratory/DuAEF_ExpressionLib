/**
 * Clamps a value, but with a smooth interpolation according to a softness parameter
 * @function
 * @param {number|number[]} value The value to limit
 * @param {number|number[]|null} [min] The minimum value
 * @param {number|number[]|null} [max] The maximum value
 * @param {number} [softness=0] The softness, a value corresponding value, from which the interpolation begins to slow down
 * @memberof ExpressionLibrary
 */
function limit(val, min, max, softness) {
    if (typeof min === 'undefined') min = null;
    if (typeof max === 'undefined') max = null;
    if (typeof softness === 'undefined') softness = 0;

    if (min == null && max == null) return val;

    if (typeof val.length !== 'undefined') {
        var n = 0;
        if (min !== null) {
            if (typeof min.length === 'undefined') {
                min = [min];
                while(min.length < val.length) min.push(min[0]);
            }
            n = Math.max(val.length, min.length);
        }
        else if (max !== null) {
            if (typeof max.length === 'undefined') {
                max = [max];
                while(max.length < val.length) max.push(max[0]);
            }
            n = Math.max(val.length, max.length);
        }
        for (var i = 0; i < n; i++) {
            if (min !== null && max !== null) val[i] = limit(val[i], min[i], max[i], softness);
            else if (min !== null) val[i] = limit(val[i], min[i], null, softness);
            else if (max !== null) val[i] = limit(val[i], null, max[i], softness);
        }
        return val;
    }

    if (max != null) {
        if (typeof max.length !== 'undefined') max = max[0];
        max = max - softness;
        if ( val > max ) {
            if (softness == 0) return max;
            return max + softness - softness / ( 1 + (val - max)/softness);
        }
    }
    
    if (min != null) {
        if (typeof min.length !== 'undefined') min = min[0];
        min = min + softness;
        if (val < min && min != null) {
            if (softness == 0) return min;
            return min - softness + softness / (1 + (min - val)/softness);
        }
    }
    
    return val;
}