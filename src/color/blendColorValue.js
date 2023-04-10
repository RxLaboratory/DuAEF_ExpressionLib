/**
 * Blends two colors together
 * @function
 * @param {float} colorA The first color
 * @param {float} colorB The second color
 * @param {float} [opacity=1] The opacity
 * @param {int} [blendlingMode=0] The blending mode, one of:<br/>
 * 0: Normal<br/>
 * 1: Add<br/>
 * 3: Multiply<br/>
 * @return {float} The new value
 * @category ExpressionLibrary
 */
function blendColorValue(colorA, colorB, alpha, blendingMode) {
    if (typeof alpha === 'undefined') alpha = 1;
    if (typeof blendingMode === 'undefined') blendingMode = 0;

    if (alpha == 0) return colorA;

    // Normal
    if (blendingMode == 0) {
        if (alpha == 1) return colorB;
        return (1-alpha)*colorA + alpha*colorB;
    }
    // Add
    if (blendingMode == 1) {
        return colorA + colorB*alpha;
    }
    // Multiply
    if (blendingMode == 3) {
        return blendColorValue( colorA, colorA * colorB, alpha, 0 );
    }
}