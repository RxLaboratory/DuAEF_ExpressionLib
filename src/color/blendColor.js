/**
 * Blends two colors together
 * @function
 * @param {float[]} colorA The first color
 * @param {float[]} colorB The second color
 * @param {float} [opacity] The opacity of the second color, overrides colorB[3].
 * @param {int} [blendlingMode=0] The blending mode, one of:<br/>
 * 0: Normal<br/>
 * 1: Add<br/>
 * 2: Lighter color<br/>
 * 3: Multiply<br/>
 * 4: Darker color<br/>
 * @return {float[]} The new color
 * @requires blendColorValue
 * @category ExpressionLibrary
 */
function blendColor(colorA, colorB, alpha, blendingMode) {
    if (typeof alpha === 'undefined') alpha = colorB[3];
    if (typeof blendingMode === 'undefined') blendingMode = 0;

    if (alpha == 0) return colorA;
    if (alpha == 1 && blendingMode == 0) return colorB;

    if (blendingMode == 0 || blendingMode == 1 || blendingMode == 3) {
        var r = blendColorValue(colorA[0], colorB[0], alpha, blendingMode);
        var g = blendColorValue(colorA[1], colorB[1], alpha, blendingMode);
        var b = blendColorValue(colorA[2], colorB[2], alpha, blendingMode);
        var a = blendColorValue(colorA[3], colorB[3], alpha, 0);
        return [r,g,b,a];
    }

    var lA = colorA[0] + colorA[1] + colorA[2];
    var lB = colorB[0] + colorB[1] + colorB[2];

    if (blendingMode == 2) {
        if (lA >= lB) return colorA;
        return blendColor( colorA, colorB, alpha, 0);
    }

    if (blendingMode == 4) {
        if (lA <= lB) return colorA;
        return blendColor( colorA, colorB, alpha, 0);
    }
}