/**
 * Generates a "zero" value for the current property, i.e. <code>0</code> or <code>[0,0]</code>, etc. according to the property type.<br />
 * Note that for path properties, this method returns a path object with three array attributes: points, inTangents, outTangents.
 * @function
 * @return {any} The zero value.
 * @category ExpressionLibrary
 */
function zero() {
    // Single value
    if (typeof thisProperty.value === "number") return 0;
    // Array (spatial, colors, etc)
    if (thisProperty.value instanceof Array) {
        var result = [0];
        for (var i = 1, n = value.length; i < n; i++) result.push(0);
        return result;
    }
    // Path
    if (isPath(thisProperty)) {
        var path = {};
        var vertices = [
            [0, 0]
        ];
        var inT = [
            [0, 0]
        ];
        var outT = [
            [0, 0]
        ];
        for (var i = 1, n = points(0).length; i < n; i++) {
            vertices.push([0, 0]);
            inT.push([0, 0]);
            outT.push([0, 0]);
        }
        path.points = vertices;
        path.inTangents = inT;
        path.outTangents = outT;
        return path;
    }
}