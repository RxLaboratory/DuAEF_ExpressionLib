/**
 * Clamps a value, but with a smooth interpolation according to a softness parameter
 * @param {number} value The value to limit
 * @param {number} [min=0] The minimum value
 * @param {number} [max=1] The maximum value
 * @param {number} [softness=0] The softness, a value corresponding value, from which the interpolation begins to slow down
 */
function limit(val, min, max, softness) {
    min = min + softness;
    max = max - softness;
    if ( val > max ) {
        if (softness == 0) return max;
        return max + softness - softness / ( 1 + (val - max)/softness);
    }
    if (val < min) {
        if (softness == 0) return min;
        return min - softness + softness / (1 + (min - val)/softness);
    }
    return val;
}