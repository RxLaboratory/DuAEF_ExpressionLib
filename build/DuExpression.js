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
function blendColorValue(colorA, colorB, alpha, blendingMode) {
if (typeof alpha === 'undefined') alpha = 1;
if (typeof blendingMode === 'undefined') blendingMode = 0;
if (alpha == 0) return colorA;
if (blendingMode == 0) {
if (alpha == 1) return colorB;
return (1-alpha)*colorA + alpha*colorB;
}
if (blendingMode == 1) {
return colorA + colorB*alpha;
}
if (blendingMode == 3) {
return blendColorValue( colorA, colorA * colorB, alpha, 0 );
}
}
function FuzzySet( name, valueNot, valueIS, shape, shapeAbove, plateauMin, plateauMax)
{
var min;
var max;
if (valueNot > valueIS){
max = valueNot;
min = valueNot - (valueNot - valueIS) * 2;
}
else
{
min = valueNot;
max = valueNot + (valueIS - valueNot) * 2;
}
if (typeof shape === "undefined") shape = "linear";
if (typeof shapeAbove === "undefined") shapeAbove = shape;
if (typeof plateauMin === "undefined") plateauMin = mean([min, max]);
if (typeof plateauMax === "undefined") plateauMax = mean([min, max]);
this.min = min;
this.max = max;
this.shapeIn = shape;
this.shapeOut = shapeAbove;
this.plateauMin = plateauMin;
this.plateauMax = plateauMax;
this.name = name;
}
FuzzySet.prototype = {
contains: function ( v, quantifier )
{
var val;
if (v instanceof FuzzyValue) val = v.crispify(false);
else val = v;
quantifier = getQuantifier(quantifier);
if (val >= this.plateauMin && val <= this.plateauMax)
{
return quantifier(1);
}
else if (val < this.plateauMin)
{
if (this.shapeIn === "constant")
{
return quantifier(1);
}
else if (this.shapeIn === "square")
{
var min = mean(this.plateauMin, this.min);
if (val >= min) return quantifier(1);
else return quantifier(0);
}
else if (this.shapeIn === "linear")
{
if (val < this.min) return quantifier(0);
else return quantifier( (val-this.min) / (this.plateauMin - this.min) );
}
else if (this.shapeIn === "sigmoid")
{
var mid = (this.plateauMin + this.min) / 2;
var rate = 6 / (this.plateauMin - this.min);
return quantifier(logistic(val, mid, 0, 1, rate));
}
else if (this.shapeIn === "gaussian")
{
var width = this.plateauMin - this.min;
return quantifier( gaussian( val, 0, 1, this.plateauMin, width));
}
else return quantifier(0);
}
else
{
if (this.shapeOut === "constant")
{
return quantifier(1);
}
else if (this.shapeOut === "square")
{
var max = mean(this.plateauMax, this.max);
if (val <= max) return quantifier(1);
else return quantifier(0);
}
else if (this.shapeOut === "linear")
{
if (val > this.max) return quantifier(0);
else return quantifier (1 - ((val - this.plateauMax ) / (this.max - this.plateauMax) ));
}
else if (this.shapeOut === "sigmoid")
{
var mid = (this.plateauMax + this.max) / 2;
var rate = 6 / (this.max - this.plateauMax);
return quantifier( 1 - logistic(val, mid, 0, 1, rate));
}
else if (this.shapeOut === "gaussian")
{
var width = this.max - this.plateauMax;
return quantifier( gaussian( val, 0, 1, this.plateauMax, width) );
}
else return quantifier(0);
}
},
getValues: function ( veracity )
{
if (typeof veracity === "undefined") veracity = 0.5;
if (veracity instanceof FuzzyVeracity) veracity = veracity.veracity;
var defaultValue = mean( [this.plateauMin, this.plateauMax] );
if ( this.shapeIn === "constant" && this.shapeOut === "constant" ) return [ this.min, this.plateauMin, defaultValue, this.plateauMax, this.max];
var crisp = [];
if (veracity >= 1) crisp = [this.plateauMin, defaultValue, this.plateauMax];
if (this.shapeIn === "constant" && veracity == 1)
{
crisp.push(this.min);
}
else if (this.shapeIn === "square")
{
if (veracity >= 0.5) crisp.push( this.plateauMin );
else crisp.push( this.min );
}
else if (this.shapeIn === "linear")
{
range = this.plateauMin - this.min;
crisp.push( this.min + range * veracity );
}
else if (this.shapeIn === "sigmoid")
{
mid = (this.plateauMin + this.min) / 2;
crisp.push( inverseLogistic(veracity, mid, 0, 1, 1) );
}
else if (this.shapeIn === "gaussian")
{
var width = this.plateauMin - this.min;
var g = inverseGaussian( veracity, 0, 1, this.plateauMin, width);
crisp.push( g[0] );
}
if (this.shapeOut === "constant" && veracity == 1)
{
crisp.push(this.max);
}
if (this.shapeOut === "square")
{
if (veracity >= 0.5) crisp.push( this.plateauMax );
else crisp.push( this.max );
}
else if (this.shapeOut === "linear")
{
range = this.max - this.plateauMax;
crisp.push( this.max + 1 - (range * veracity) );
}
else if (this.shapeOut === "sigmoid")
{
mid = (this.plateauMax + this.max) / 2;
crisp.push( inverseLogistic( 1-veracity, mid, 0, 1, 1 ) );
}
else if (this.shapeOut === "gaussian")
{
width = this.max - this.plateauMax;
var g = inverseGaussian( 1-veracity, 0, 1, this.plateauMax, width);
crisp.push( g[1] );
}
for(var i = 0, num = crisp.length; i < num; i++)
{
if ( crisp[i] > this.max ) crisp[i] = this.max;
if ( crisp[i] < this.min ) crisp[i] = this.min;
}
return crisp.sort();
},
crispify: function ( quantifier, veracity )
{
quantifier = getQuantifier(quantifier);
var v;
if (typeof veracity === "undefined") v = quantifier();
else if (veracity instanceof FuzzyVeracity) v = veracity.veracity;
else v = veracity;
v = quantifier(v, true).veracity;
return this.getValues( v );
}
};
function FuzzyValue( val )
{
if (typeof unit === "undefined") unit = "";
if (typeof val === "undefined") val = 0;
this.val = val;
this.sets = [];
this.report = [];
this.reportEnabled = false;
this.numRules = 0;
}
FuzzyValue.prototype = {
IS: function(fuzzyset, quantifier)
{
var v = fuzzyset.contains( this, quantifier );
return v;
},
IS_NOT: function (fuzzyset, quantifier)
{
var x = fuzzyset.contains( this.val, quantifier );
return x.NEGATE();
},
SET: function ( fuzzyset,  quantifier, v )
{
if (typeof v === "undefined") v = new FuzzyVeracity(1);
quantifier = getQuantifier(quantifier);
this.numRules++;
v.ruleNum = this.numRules;
for (var i = 0, num = this.sets.length; i < num; i++)
{
var s = this.sets[i].fuzzyset;
if (fuzzyset.name == s.name)
{
this.sets[i].quantifiers.push(quantifier);
this.sets[i].veracities.push(v);
return;
}
}
var s = {};
s.fuzzyset = fuzzyset;
s.quantifiers = [quantifier];
s.veracities = [v];
this.sets.push( s );
},
crispify: function ( clearSets )
{
if (typeof clearSets === "undefined") clearSets = true;
if (this.sets.length == 0) return this.val;
var crisp = 0;
this.report = [];
function ruleSorter(a, b)
{
return a.number - b.number;
}
var sumWeights = 0;
for (var i = 0, num = this.sets.length; i < num; i++)
{
var s = this.sets[i];
for( var j = 0, numV = s.veracities.length; j < numV; j++)
{
var v = s.veracities[j];
var q = s.quantifiers[j];
var vals = s.fuzzyset.crispify( q, v );
var val;
var ver;
val = mean(vals);
crisp += val * v.veracity;
ver = v.veracity;
sumWeights += ver;
if (this.reportEnabled)
{
for (var iVals = 0, numVals = vals.length; iVals < numVals; iVals++)
{
vals[iVals] = Math.round(vals[iVals]*1000)/1000;
}
var reportRule = [];
reportRule.push( "Rule #" + v.ruleNum +": Set " + fuzzyset.toString() + " (" + q.toString() + ")" );
reportRule.push( "Gives val: " + Math.round(val*1000)/1000 + " from these values: [ " + vals.join(", ") + " ]");
reportRule.push( "With a veracity of: " + Math.round(ver*1000)/1000 );
reportRule.number = v.ruleNum;
this.report.push( reportRule );
}
}
}
if (sumWeights != 0) crisp = crisp / sumWeights;
if (this.reportEnabled) this.report.sort(ruleSorter);
if (clearSets)
{
this.val = crisp;
this.sets = [];
}
return crisp;
},
toNumber: this.crispify,
toFloat: this.crispify,
defuzzify: this.crispify
};
function FuzzyVeracity( veracity )
{
if (typeof above === "undefined") above = false;
this.veracity = veracity;
}
FuzzyVeracity.prototype = {
NEGATE: function()
{
return new FuzzyVeracity( 1 - this.veracity );
},
AND: function( other )
{
var x = this.veracity;
var y = other.veracity;
var v = 0;
v = Math.min(x, y);
return new FuzzyVeracity( v );
},
OR: function( other )
{
var x = this.veracity;
var y = other.veracity;
var v = 0;
v = Math.max(x, y);
return new FuzzyVeracity( v );
},
XOR: function( other )
{
var x = this.veracity;
var y = other.veracity;
var v = 0;
v = x+y - 2*Math.min(x,y);
return new FuzzyVeracity( v );
},
IS_NOT: this.XOR,
DIFFERENT: this.XOR,
NXR: function( other )
{
var x = this.veracity;
var y = other.veracity;
var v = 0;
v = 1-x-y + 2*Math.min(x,y);
return new FuzzyVeracity( v );
},
IS: this.NXR,
EQUALS: this.NXR,
IMPLIES: function( other )
{
var x = this.veracity;
var y = other.veracity;
var v = 0;
v = 1-Math.min(x, 1-y);
return new FuzzyVeracity( v );
},
WITH: this.IMPLIES,
HAS: this.IMPLIES,
DOES_NOT_IMPLY: function( other )
{
var x = this.veracity;
var y = other.veracity;
var v = 0;
v = Math.min(x, 1-y);
return new FuzzyVeracity( v );
},
WITHOUT: this.DOES_NOT_IMPLY,
DOES_NOT_HAVE: this.DOES_NOT_IMPLY,
NAND: function( other )
{
var x = this.veracity;
var y = other.veracity;
var v = 0;
v = 1 - Math.min(x, y);
return new FuzzyVeracity( v );
},
NOT_BOTH: this.NAND,
NOR: function( other )
{
var x = this.veracity;
var y = other.veracity;
var v = 0;
v = 1 - Math.max(x, y);
return new FuzzyVeracity( v );
},
NONE: this.NOR,
WEIGHTED: function( other, weight )
{
var x = this.veracity;
var y = other.veracity;
var v = (1-w)*x +  w*y;
return new FuzzyVeracity( v );
}
};
function FuzzyLogic( )
{
this.veracity = new FuzzyVeracity(0);
this.sets = [];
}
FuzzyLogic.prototype = {
newValue: function (val, unit)
{
return new FuzzyValue( val, unit );
},
newVeracity: function (veracity)
{
return new FuzzyVeracity(veracity);
},
newSet: function ( name, extremeValue, referenceValue, shape, shapeAbove, plateauMin, plateauMax)
{
return new FuzzySet(name, extremeValue, referenceValue, shape, shapeAbove, plateauMin, plateauMax);
},
IF: function ( veracity )
{
this.veracity = veracity;
return veracity;
},
THEN: function ( val, fuzzyset, quantifier )
{
val.SET(fuzzyset, quantifier, this.veracity);
}
};
function getQuantifier( name )
{
if (typeof name === "undefined") name = "moderately";
if (name == "not" || name == "less") {
function qObj (v, inverse) {
if (typeof v === "undefined") return 0;
var p = inverse ? 0 : 1;
return new FuzzyVeracity( p );
}
return qObj;
}
if (name == "slightly") return createQuantifier( 1/3 );
if (name == "somewhat") return createQuantifier( 0.5 );
if (name == "moderately") return createQuantifier( 1 );
if (name == "very") return createQuantifier( 2 );
if (name == "extremely") return createQuantifier( 3 );
function qObj (v, inverse) {
if (typeof v === "undefined") return 1;
var p = inverse ? 1 : 0;
return new FuzzyVeracity( p );
}
return qObj;
}
function createQuantifier( q )
{
function qObj (v, inverse) {
if (typeof v === "undefined") return Math.pow( 0.5, 1/q);
var p = inverse ? 1/q : q;
return new FuzzyVeracity( Math.pow(v, p) );
}
return qObj;
}
function FuzzyVeracity( v, f )
{
if (typeof f === 'undefined') f = 1;
this.veracity = v;
this.factor = f;
}
FuzzyVeracity.prototype = {
NEGATE: function() {
return new FuzzyVeracity(1 - this.veracity, 0.5);
},
AND: function(other) {
var x = this.veracity * this.factor;
var y = other.veracity * other.factor;
var v = x*y;
return new FuzzyVeracity( v );
},
OR: function(other) {
var x = this.veracity * this.factor;
var y = other.veracity * other.factor;
var v = x + y - x*y;
return new FuzzyVeracity( v );
},
DIFFERENT: function(other) {
var x = this.veracity * this.factor;
var y = other.veracity * other.factor;
var v = x+y - 2*x*y;
return new FuzzyVeracity( v );
},
EQUALS: function(other) {
var x = this.veracity * this.factor;
var y = other.veracity * other.factor;
var v = 1-x-y + 2*x*y;
return new FuzzyVeracity( v );
},
};
function animate(ks, loopOut, loopIn, ct) {
if (ks.length == 0) return value;
if (ks.length == 1) return ks[0].value;
if (typeof loopOut === 'undefined') loopOut = 'none';
if (typeof loopIn === 'undefined') loopIn = 'none';
if (typeof ct === 'undefined') ct = time;
var startTime = ks[0].time;
var endTime = ks[ks.length-1].time;
var duration = endTime - startTime;
if ( ct >= endTime )
{
if ( loopOut == 'cycle' ) ct = ((ct - startTime) % duration) + startTime;
else if ( loopOut == 'pingpong' ) {
var d = duration * 2;
ct = (ct-startTime) % d;
if (ct > duration) ct = d - ct;
ct += startTime;
}
}
else if ( ct < startTime) {
if ( loopIn == 'cycle' ) ct = ((ct - startTime) % duration) + startTime + duration;
else if ( loopIn == 'pingpong' ) {
var d = duration * 2;
ct += d;
ct = (ct-startTime) % d;
if (ct > duration) ct = d - ct;
ct += startTime;
}
}
for (var i = 0; i < ks.length; i++) {
var k = ks[i];
if (k.time > ct && i == 0) return k.value;
if (k.time == ct) return k.value;
if (k.time < ct) {
if (i == ks.length - 1) return k.value;
var nk = ks[i+1];
if (nk.time < ct) continue;
if (typeof k.interpolation === 'undefined') return linear(ct, k.time, nk.time, k.value, nk.value);
if (typeof k.params === 'undefined') return k.interpolation(ct, k.time, nk.time, k.value, nk.value);
else return k.interpolation(ct, k.time, nk.time, k.value, nk.value, k.params);
}
}
return value;
}
function bezierInterpolation(t, tMin, tMax, value1, value2, bezierPoints) {
if (typeof tMin === 'undefined') tMin = 0;
if (typeof tMax === 'undefined') tMax = 1;
if (typeof value1 === 'undefined') value1 = 0;
if (typeof value2 === 'undefined') value2 = 0;
if (typeof bezierPoints === 'undefined') bezierPoints = [0.33,0.0,0.66,1.0];
if (arguments.length !== 5 && arguments.length !== 6) return (value1+value2)/2;
var a = value2 - value1;
var b = tMax - tMin;
if (b == 0) return (value1+value2)/2;
var c = clamp((t - tMin) / b, 0, 1);
if (!(bezierPoints instanceof Array) || bezierPoints.length !== 4) bezierPoints = [0.33,0.0,0.66,1];
return a * h(c, bezierPoints) + value1;
function h(f, g) {
var x = 3 * g[0];
var j = 3 * (g[2] - g[0]) - x;
var k = 1 - x - j;
var l = 3 * g[1];
var m = 3 * (g[3] - g[1]) - l;
var n = 1 - l - m;
var d = f;
for (var i = 0; i < 5; i++) {
var z = d * (x + d * (j + d * k)) - f;
if (Math.abs(z) < 1e-3) break;
d -= z / (x + d * (2 * j + 3 * k * d));
}
return d * (l + d * (m + d * n));
}
}
function expInterpolation(t, tMin, tMax, vMin, vMax, rate)
{
if (typeof tMin === 'undefined') tMin = 0;
if (typeof tMax === 'undefined') tMax = 1;
if (typeof value1 === 'undefined') value1 = 0;
if (typeof value2 === 'undefined') value2 = 0;
if (typeof rate === 'undefined') rate = 1;
if (rate == 0) return linearExtrapolation(t, tMin, tMax, vMin, vMax);
tMax = ( tMax - tMin ) * rate;
t = ( t - tMin ) * rate;
var m = Math.exp(tMax);
t = Math.exp(t);
return linearExtrapolation(t, 1, m, vMin, vMax);
}
function gaussianInterpolation( t, tMin, tMax, value1, value2, rate )
{
if (typeof tMin === 'undefined') tMin = 0;
if (typeof tMax === 'undefined') tMax = 1;
if (typeof value1 === 'undefined') value1 = 0;
if (typeof value2 === 'undefined') value2 = 0;
if (typeof rate === 'undefined') rate = 0;
if (value1 == value2) return value1;
if (t >= tMax) return value2;
if (t <= tMin) return value1;
if (t != tMin)
{
var newValue1 = gaussianInterpolation( tMin, tMin, tMax, value1, value2, rate );
var offset = newValue1 - value1;
value1 = value1 - offset;
}
if (rate < 0) rate = rate*10;
rate = linear(t, tMin, tMax, 0.25, rate);
var r = ( 1 - rate );
var fwhm = (tMax-tMin) * r;
var center = tMax;
if (t >= tMax) return value2;
if (fwhm === 0 && t == center) return value2;
else if (fwhm === 0) return value1;
var exp = -4 * Math.LN2;
exp *= Math.pow((t - center),2);
exp *= 1/ Math.pow(fwhm, 2);
var result = Math.pow(Math.E, exp);
result = result * (value2-value1) + value1;
return result;
}
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
function integrateLinearKeys( prop ) {
if (typeof prop === 'undefined') prop = thisProperty;
var nK = prop.numKeys;
if (nK < 2) return prop.value*(time - inPoint);
if (prop.key(1).time > time ) return prop.value*(time - inPoint);
var result = prop.key(1).value * (prop.key(1).time - inPoint);
for (var i = 2; i <= nK; i++){
if ( prop.key(i).time > time ) break;
var k1 = prop.key(i-1);
var k2 = prop.key(i);
result += (k1.value + k2.value) * (k2.time - k1.time)/2;
}
result += (prop.value + prop.key(i-1).value) * (time - prop.key(i-1).time) / 2;
return result;
}
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
function linearExtrapolation( t, tMin, tMax, value1, value2 )
{
if (tMax == tMin) return (value1+value2) / 2;
return value1 + (( t - tMin) / (tMax - tMin)) * (value2 - value1);
}
function logInterpolation(t, tMin, tMax, vMin, vMax, rate)
{
if (typeof tMin === 'undefined') tMin = 0;
if (typeof tMax === 'undefined') tMax = 1;
if (typeof value1 === 'undefined') value1 = 0;
if (typeof value2 === 'undefined') value2 = 0;
if (typeof rate === 'undefined') rate = 1;
if (rate == 0) return linearExtrapolation(t, tMin, tMax, vMin, vMax);
tMax = ( tMax - tMin ) * rate + 1;
t = ( t - tMin ) * rate + 1;
if (t <= 1) return vMin;
var m = Math.log(tMax);
var v = Math.log(t);
return linearExtrapolation(v, 0, m, vMin, vMax);
}
function logisticInterpolation( t, tMin, tMax, value1, value2, rate, tMid )
{
if (typeof tMin === 'undefined') tMin = 0;
if (typeof tMax === 'undefined') tMax = 1;
if (typeof value1 === 'undefined') value1 = 0;
if (typeof value2 === 'undefined') value2 = 0;
if (typeof rate === 'undefined') rate = 1;
if (typeof tMid === 'undefined') tMid = (tMin+tMax)/2;
if (rate == 0) return linearExtrapolation(t, tMin, tMax, value1, value2);
t = logistic( t, tMid, tMin, tMax, rate);
var m = logistic( tMin, tMid, tMin, tMax, rate);
var M = logistic( tMax, tMid, tMin, tMax, rate);
return linearExtrapolation( t, m, M, value1, value2);
}
function getNextKey(t, prop) {
if (typeof t === 'undefined') t = time;
if (typeof prop === 'undefined') prop = thisProperty;
if (prop.numKeys == 0) return null;
var nKey = prop.nearestKey(t);
if (nKey.time >= t) return nKey;
if (nKey.index < prop.numKeys) return prop.key(nKey.index + 1);
return null;
}
function getNextStopKey(t, prop) {
if (typeof t === 'undefined') t = time;
if (typeof prop === 'undefined') prop = thisProperty;
var k = getNextKey(t, prop);
if (!k) return null;
var i = k.index;
while (i < prop.numKeys) {
if (isStill( k.time + thisComp.frameDuration )) return k;
k = key(k.index + 1);
}
return k;
}
function getPrevKey(t, prop) {
if (typeof t === 'undefined') t = time;
if (typeof prop === 'undefined') prop = thisProperty;
if (prop.numKeys == 0) return null;
var nKey = prop.nearestKey(t);
if (nKey.time <= t) return nKey;
if (nKey.index > 1) return prop.key(nKey.index - 1);
return null;
}
function getPrevStartKey(t, prop) {
if (typeof t === 'undefined') t = time;
if (typeof prop === 'undefined') prop = thisProperty;
var k = getPrevKey(t, prop);
if (!k) return null;
var i = k.index;
while (i > 0) {
if (isStill( k.time - thisComp.frameDuration )) return k;
k = key(k.index - 1);
}
return k;
}
function isAfterLastKey() {
if (numKeys == 0) return false;
var nKey = nearestKey(time);
return nKey.time <= time && nKey.index == numKeys;
}
function isKeyTop(k, axis) {
var prevSpeed = velocityAtTime(k.time - thisComp.frameDuration/2);
var nextSpeed = velocityAtTime(k.time + thisComp.frameDuration/2);
if (value instanceof Array) {
prevSpeed = prevSpeed[axis];
nextSpeed = nextSpeed[axis];
}
if (Math.abs(prevSpeed) < 0.01 || Math.abs(nextSpeed) < 0.01) return true;
return prevSpeed * nextSpeed < 0;
}
function bounce(t, elasticity, damping, vAtTime) {
if (elasticity == 0) return value;
if (numKeys < 2) return value;
if (nearestKey(t).index == 1) return value;
var pVelocity = ( vAtTime(t) - vAtTime( t - .01 ) ) * 100;
var pSpeed = length( pVelocity );
if (pSpeed >= 0.001 ) return value;
var bounceStart = 0;
var bounceTime = 0;
var bouceKey = getPrevKey(t, thisProperty);
bounceStart = bouceKey.time;
bounceTime = t - bounceStart;
pVelocity = ( vAtTime( bounceStart ) - vAtTime( bounceStart - thisComp.frameDuration * .5 ) );
var bounceValue = ( pVelocity / thisComp.frameDuration ) ;
var cycleDamp = Math.exp(bounceTime * damping * .1);
var damp = Math.exp(bounceTime * damping) / (elasticity / 2);
var cycleDuration = 1 / (elasticity * 2);
cycleDuration = Math.round(timeToFrames(cycleDuration));
cycleDuration = framesToTime(cycleDuration);
var midDuration = cycleDuration / 2;
var maxValue = bounceValue * midDuration;
var cycvarime = bounceTime;
var numEndCycles = 1;
while (cycvarime > cycleDuration) {
cycvarime = cycvarime - cycleDuration;
cycleDuration = cycleDuration / cycleDamp;
cycleDuration = Math.round(timeToFrames(cycleDuration));
if (cycleDuration < 2) {
cycleDuration = 2;
numEndCycles++;
}
cycleDuration = framesToTime(cycleDuration);
midDuration = cycleDuration / 2;
maxValue = bounceValue * midDuration / damp;
if (numEndCycles > 100 / damping && maxValue < 0.001 ) return value;
}
if (cycvarime < midDuration) bounceValue = bezierInterpolation(cycvarime, 0, midDuration, 0, maxValue, [0, .1, .33, 1]);
else bounceValue = bezierInterpolation(cycvarime, midDuration, cycleDuration, maxValue, 0, [.66, 0, 1, .9]);
var prevValue = valueAtTime(bounceStart - thisComp.frameDuration);
var startValue = valueAtTime(bounceStart);
if (value instanceof Array) {
for (var i = 0; i < prevValue.length; i++) {
if (prevValue[i] > startValue[i]) bounceValue[i] = Math.abs(bounceValue[i]);
if (prevValue[i] < startValue[i]) bounceValue[i] = -Math.abs(bounceValue[i]);
}
} else {
if (prevValue > startValue) bounceValue = Math.abs(bounceValue);
if (prevValue < startValue) bounceValue = -Math.abs(bounceValue);
}
return bounceValue + value;
}
function continueIn(t, damping) {
if (numKeys <= 1) return value;
var firstKey = getNextKey(t, thisProperty);
if (!firstKey) return value;
var firstVelocity = velocityAtTime(firstKey.time + 0.001);
var timeSpent = firstKey.time - t;
var damp = Math.exp(timeSpent * damping);
return (-timeSpent * firstVelocity) / damp + firstKey.value;
}
function continueOut(t, damping) {
if (numKeys <= 1) return value;
var lastKey = getPrevKey(t, thisProperty);
if (!lastKey) return value;
var lastVelocity = velocityAtTime(lastKey.time - 0.001);
var timeSpent = t - lastKey.time;
var damp = Math.exp(timeSpent * damping);
return lastKey.value + (timeSpent * lastVelocity) / damp;
}
function cycleIn(t, nK, o, vAtTime, damping) {
var currentValue = vAtTime(t);
if (numKeys <= 1) return currentValue;
var lastKeyIndex = numKeys;
var firstKey = getNextKey(t, thisProperty);
if (!firstKey) return currentValue;
if (firstKey.index == lastKeyIndex) return currentValue;
if (nK >= 2) {
nK = nK - 1;
lastKeyIndex = firstKey.index + nK;
if (lastKeyIndex > numKeys) lastKeyIndex = numKeys;
}
var loopStartTime = firstKey.time;
var loopEndTime = key(lastKeyIndex).time;
var loopDuration = loopEndTime - loopStartTime;
if (t >= loopStartTime) return currentValue;
var timeSpent = loopStartTime - t;
var numLoops = Math.floor(timeSpent / loopDuration);
var loopTime = loopDuration - timeSpent;
if (numLoops > 0) loopTime = loopDuration - (timeSpent - numLoops * loopDuration);
var r = vAtTime(loopStartTime + loopTime);
if (o) r -= (key(lastKeyIndex).value - firstKey.value) * (numLoops + 1);
var damp = Math.exp(timeSpent * damping);
return (r-currentValue) / damp + currentValue;
}
function cycleOut(t, nK, o, vAtTime, damping) {
var currentValue = vAtTime(t);
if (numKeys <= 1) return currentValue;
var firstKeyIndex = 1;
var lastKey = getPrevKey(t, thisProperty);
if (!lastKey) return currentValue;
if (lastKey.index == firstKeyIndex) return currentValue;
if (nK >= 2) {
nK = nK - 1;
firstKeyIndex = lastKey.index - nK;
if (firstKeyIndex < 1) firstKeyIndex = 1;
}
var loopStartTime = key(firstKeyIndex).time;
var loopEndTime = key(lastKey.index).time;
var loopDuration = loopEndTime - loopStartTime;
if (t <= loopEndTime) return currentValue;
var timeSpent = t - loopEndTime;
var numLoops = Math.floor(timeSpent / loopDuration);
var loopTime = timeSpent;
if (numLoops > 0) loopTime = timeSpent - numLoops * loopDuration;
var r = vAtTime(loopStartTime + loopTime);
if (o) r += (key(lastKey.index).value - key(firstKeyIndex).value) * (numLoops + 1);
var damp = Math.exp(timeSpent * damping);
return (r-currentValue) / damp + currentValue;
}
function overShoot(t, elasticity, damping, vAtTime) {
if (elasticity == 0) return value;
if (numKeys < 2) return value;
if (nearestKey(t).index == 1) return value;
var pVelocity = ( vAtTime(t) - vAtTime( t - .01 ) ) * 100;
var pSpeed = length( pVelocity );
if (pSpeed >= 0.001 ) return value;
var oShootStart = 0;
var oShootTime = 0;
var oShootKey = getPrevKey(t, thisProperty);
oShootStart = oShootKey.time;
oShootTime = t - oShootStart;
pVelocity = ( vAtTime( oShootStart ) - vAtTime( oShootStart - thisComp.frameDuration * .5 ) );
var damp = Math.exp(oShootTime * damping);
var sinus = elasticity * oShootTime * 2 * Math.PI;
sinus = Math.sin(sinus);
sinus = (.3 / elasticity) * sinus;
sinus = sinus / damp;
if (Math.abs(sinus) < .00001) return value;
var oShoot = ( pVelocity / thisComp.frameDuration ) * sinus;
return oShoot+value;
}
function pingPongIn(t, nK, vAtTime, damping) {
var currentValue = vAtTime(t);
if (numKeys <= 1) return currentValue;
var lastKeyIndex = numKeys;
var firstKey = getNextKey(t, thisProperty);
if (!firstKey) return currentValue;
if (firstKey.index == lastKeyIndex) return currentValue;
if (nK >= 2) {
nK = nK - 1;
lastKeyIndex = firstKey.index + nK;
if (lastKeyIndex > numKeys) lastKeyIndex = numKeys;
}
var loopStartTime = firstKey.time;
var loopEndTime = key(lastKeyIndex).time;
var loopDuration = loopEndTime - loopStartTime;
if (t >= loopStartTime) return currentValue;
var timeSpent = loopStartTime - t;
var numLoops = Math.floor(timeSpent / loopDuration);
var loopTime = timeSpent;
if (numLoops > 0) {
loopTime = timeSpent - numLoops * loopDuration;
if (numLoops % 2 != 0) loopTime = loopDuration - loopTime;
}
var damp = Math.exp(timeSpent * damping);
return ( vAtTime(loopStartTime + loopTime) - currentValue) / damp + currentValue;
}
function pingPongOut(t, nK, vAtTime, damping) {
var currentValue = vAtTime(t);
if (numKeys <= 1) return currentValue;
var firstKeyIndex = 1;
var lastKey = getPrevKey(t, thisProperty);
if (!lastKey) return currentValue;
if (lastKey.index == firstKeyIndex) return currentValue;
if (nK >= 2) {
nK = nK - 1;
firstKeyIndex = lastKey.index - nK;
if (firstKeyIndex < 1) firstKeyIndex = 1;
}
var loopStartTime = key(firstKeyIndex).time;
var loopEndTime = key(lastKey.index).time;
var loopDuration = loopEndTime - loopStartTime;
if (t <= loopEndTime) return currentValue;
var timeSpent = t - loopEndTime;
var numLoops = Math.floor(timeSpent / loopDuration);
var loopTime = loopDuration - timeSpent;
if (numLoops > 0) {
loopTime = timeSpent - numLoops * loopDuration;
if (numLoops % 2 == 0) loopTime = loopDuration - loopTime;
}
var damp = Math.exp(timeSpent * damping);
return ( vAtTime(loopStartTime + loopTime) - currentValue) / damp + currentValue;
}
function addPoints(p1, p2, w) {
var n = p1.length;
if (p2.length > n) n = p2.length;
var r = [];
for (var i = 0; i < n; i++) {
if (i >= p1.length) {
r.push(p2[i] * w);
continue;
}
if (i >= p2.length) {
r.push(p1[i]);
continue;
}
r.push(p1[i] + p2[i] * w);
}
return r;
}
if (typeof Math.cbrt === 'undefined') {
Math.cbrt = (function(pow) {
return function cbrt(x){
return x < 0 ? -pow(-x, 1/3) : pow(x, 1/3);
};
})(Math.pow);
}
function distanceToLine( point, line ) {
var b = line[0];
var c = line [1];
var a = point;
var line = Math.pow( length( b, c ), 2 );
if ( line === 0 ) return Math.pow( length( a, b ), 2 );
var d = ( ( a[ 0 ] - b[ 0 ] ) * ( c[ 0 ] - b[ 0 ] ) + ( a[ 1 ] - b[ 1 ] ) * ( c[ 1 ] - b[ 1 ] ) ) / line;
d = Math.max( 0, Math.min( 1, d ) );
var distance = Math.pow( length( a, [ b[ 0 ] + d * ( c[ 0 ] - b[ 0 ] ), b[ 1 ] + d * ( c[ 1 ] - b[ 1 ] ) ] ), 2 );
return Math.sqrt( distance );
};
function gaussian( value, min, max, center, fwhm)
{
if (typeof min === 'undefined') min = 0;
if (typeof max === 'undefined') max = 1;
if (typeof center === 'undefined') center = 0;
if (typeof fwhm === 'undefined') fwhm = 1;
if (fwhm === 0 && value == center) return max;
else if (fwhm === 0) return 0;
var exp = -4 * Math.LN2;
exp *= Math.pow((value - center),2);
exp *= 1/ Math.pow(fwhm, 2);
var result = Math.pow(Math.E, exp);
return result * (max-min) + min;
}
function inverseGaussian ( v, min, max, center, fwhm)
{
if (typeof min === 'undefined') min = 0;
if (typeof max === 'undefined') max = 1;
if (typeof center === 'undefined') center = 0;
if (typeof fwhm === 'undefined') fwhm = 1;
if (v == 1) return [center, center];
if (v === 0) return [center + fwhm/2, center - fwhm/2];
if (fwhm === 0) return [center, center];
var result = (v-min)/(max-min);
result = Math.log( result ) * Math.pow(fwhm,2);
result = result / ( -4 * Math.LN2 );
result = Math.sqrt( result );
return [ result + center, -result + center ];
}
function inverseLogistic ( v, midValue, min, max, rate)
{
if (typeof midValue === 'undefined') midValue = 0;
if (typeof min === 'undefined') min = 0;
if (typeof max === 'undefined') max = 1;
if (typeof rate === 'undefined') rate = 1;
if (v == min) return 0;
return midValue - Math.log( (max-min)/(v-min) - 1) / rate;
}
function isZero(a)
{
if (a instanceof Array)
{
for ( var i = 0; i < a.length; i++ )
{
if ( a[i] != 0 ) return false;
}
}
else if (a != 0) return false;
return true;
}
function logistic( value, midValue, min, max, rate)
{
if (typeof midValue === 'undefined') midValue = 0;
if (typeof min === 'undefined') min = 0;
if (typeof max === 'undefined') max = 1;
if (typeof rate === 'undefined') rate = 1;
var exp = -rate*(value - midValue);
var result = 1 / (1 + Math.pow(Math.E, exp));
return result * (max-min) + min;
}
function mean( values )
{
var num = values.length;
var result = 0;
for (var i = 0; i < num; i++)
{
result += values[i];
}
return result / num;
}
function multPoints(p, w) {
var r = [];
for (var i = 0, n = p.length; i < n; i++) {
r.push(p[i] * w);
}
return r;
}
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
function randomUnitVector( dimensions ) {
var angle = random(0, 2*Math.PI);
if (dimensions == 2) {
return [Math.cos(angle), Math.sin(angle)];
}
else if (dimensions == 3) {
var z = random(-1, 1);
var f = Math.sqrt(1-z*z);
return [
f*Math.cos(angle),
f*Math.sin(angle),
z
];
}
else {
return null;
}
}
if (typeof Math.sign === 'undefined') Math.sign = function(x) { return ((x > 0) - (x < 0)) || +x; };
function subPoints(p1, p2, w) {
var n = p1.length;
if (p2.length > n) n = p2.length;
var r = [];
for (var i = 0; i < n; i++) {
if (i >= p1.length) {
r.push(-p2[i] * w);
continue;
}
if (i >= p2.length) {
r.push(p1[i]);
continue;
}
r.push(p1[i] - p2[i] * w);
}
return r;
}
function unitVector(dimensions, axis) {
var vec = new Array(dimensions)
for (var i = 0; i < dimensions; i++) {
if (i == axis) vec[i] = 1;
else vec[i] = 0;
}
return vec;
}
function addPath(path1, path2, path2weight) {
var vertices = addPoints(path1.points, path2.points, path2weight);
var inT = addPoints(path1.inTangents, path2.inTangents, path2weight);
var outT = addPoints(path1.outTangents, path2.outTangents, path2weight);
var path = {};
path.points = vertices;
path.inTangents = inT;
path.outTangents = outT;
return path;
}
function inside( point, points ) {
var x = point[ 0 ],
y = point[ 1 ];
var result = 0;
var inside = false;
for ( var i = 0, j = points.length - 1; i < points.length; j = i++ ) {
var xi = points[ i ][ 0 ],
yi = points[ i ][ 1 ];
var xj = points[ j ][ 0 ],
yj = points[ j ][ 1 ];
var intersect = ( ( yi > y ) != ( yj > y ) ) &&
( x <
( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi );
if ( intersect ) inside = !inside;
var t1 = length( points[ i ], point );
var t2 = length( points[ result ], point );
if ( t1 < t2 ) {
result = i;
}
}
return { inside: inside, closestVertex: result };
};
function multPath(path, weight) {
var vertices = multPoints(path.points, weight);
var inT = multPoints(path.inTangents, weight);
var outT = multPoints(path.outTangents, weight);
var path = {};
path.points = vertices;
path.inTangents = inT;
path.outTangents = outT;
return path;
}
function subPath(path1, path2, path2weight) {
var vertices = subPoints(path1.points, path2.points, path2weight);
var inT = subPoints(path1.inTangents, path2.inTangents, path2weight);
var outT = subPoints(path1.outTangents, path2.outTangents, path2weight);
var path = {};
path.points = vertices;
path.inTangents = inT;
path.outTangents = outT;
return path;
}
function checkDuikEffect(fx, duikMatchName) {
if (fx.numProperties  < 3) return false;
try { if (fx(2).name != duikMatchName) return false; }
catch (e) { return false; }
return true;
}
function checkEffect(fx, propIndex, propName) {
if (fx.numProperties  < propIndex) return false;
if (!!$.engineName) {
if ( fx(propIndex).name != propName ) return false;
}
else {
try { if (fx(propIndex).name != propName) return false; }
catch (e) { return false; }
}
return true;
}
function getEffectLayer( fx, ind ) {
try { var l = fx( ind ); return l; }
catch ( e ) { return null; }
}
function getPath(t) {
var path = {};
path.points = points(t);
path.inTangents = inTangents(t);
path.outTangents = outTangents(t);
return path;
}
function getPropFromPath( l, p )
{
prop = l;
for ( var i = p.length - 1; i >= 0; i-- )
prop = prop(p[i]);
return prop;
}
function getPropPath()
{
var path = [];
var prop = thisProperty;
ok = true;
while( ok )
{
try {
path.push( prop.propertyIndex );
prop = prop.propertyGroup();
}
catch (e) { ok = false; }
}
return path;
}
function getSameProp( l )
{
return getPropFromPath( l, getPropPath() );
}
function isLayer( prop ) {
try { if ( prop.index ) return true; }
catch (e) { return false; }
}
function isPath(prop) {
try {
createPath();
return true;
} catch (e) {
return false;
}
}
function isPosition(prop) {
return  prop === position;
}
function isSpatial(prop) {
if (typeof prop === 'undefined') prop = thisProperty;
if (!(prop.value instanceof Array)) return false;
if (prop.value.length != 2 && prop.value.length != 3) return false;
try { if (typeof prop.speed !== "undefined") return true; }
catch (e) { return false; }
}
function isStill(t, threshold, axis) {
if (typeof t === 'undefined') t = time;
if (typeof threshold === 'undefined') threshold = 0.01;
if (typeof axis === 'undefined') axis = -1;
var d = valueAtTime(t) - valueAtTime(t + thisComp.frameDuration*.1);
if (d instanceof Array) {
if (axis >= 0) return Math.abs(d[axis]) <= threshold;
for (var i = 0; i < d.length; i++) {
if (Math.abs(d[i]) > threshold) return false;
}
return true;
} else return Math.abs(d) <= threshold;
}
function lastActiveTime( prop, t ) {
if ( prop.valueAtTime(t) ) return t;
while( t > 0 )
{
var prevKey = getPrevKey( t, prop );
if ( !prevKey ) break;
if ( prevKey.value ) return t;
t = prevKey.time - .001;
}
return 0;
}
function nextActiveTime( prop, t )
{
if ( prop.valueAtTime(t) ) return t;
while( t < thisComp.duration )
{
var nextKey = getNextKey( t + .001, prop );
if ( !nextKey ) break;
t = nextKey.time;
if ( nextKey.value ) return t;
}
return 0;
}
function zero() {
if (typeof thisProperty.value === "number") return 0;
if (thisProperty.value instanceof Array) {
var result = [0];
for (var i = 1, n = value.length; i < n; i++) result.push(0);
return result;
}
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
function addNoise( val, quantity ) {
var randomValue = random(0.9,1.1);
var noiseValue = noise(valueAtTime(0) * randomValue);
noiseValue = noiseValue * (quantity / 100);
return val * ( noiseValue + 1 );
}
function dishineritRotation( l ) {
if (typeof l === 'undefined') l = thisLayer;
var r = l.rotation.value;
while ( l.hasParent ) {
l = l.parent;
var s = l.scale.value;
r -= l.rotation.value * Math.sign(s[0]*s[1]);
}
return r;
}
function dishineritScale( l ) {
var s = l.scale.value;
var threeD = s.length == 3;
while ( l.hasParent ) {
l = l.parent;
var ps = l.scale.value / 100;
if (threeD && ps.length == 3) {
s = [ s[0]/ps[0], s[1]/ps[1], s[2]/ps[2] ];
}
else if (threeD) {
s = [ s[0]/ps[0], s[1]/ps[1], s[2] ];
}
else {
s = [ s[0]/ps[0], s[1]/ps[1] ];
}
}
return s;
}
function fromGroupToLayer( point ) {
var matrix = getGroupTransformMatrix();
return matrix.applyToPoint( point );
}
function fromLayerToGroup( point ) {
var matrix = getGroupTransformMatrix().inverse();
return matrix.applyToPoint( point );
}
function getCompScale( l, t ) {
var originalWidth = length( l.anchorPoint, [ l.width, 0 ] );
var anchorInComp = l.toComp( l.anchorPoint, t );
var widthInComp = l.toComp( [ l.width, 0 ], t );
var newWidth = length(anchorInComp, widthInComp);
return newWidth / originalWidth;
}
function getGroupTransformMatrix( prop ) {
var matrix = new Matrix();
var shapeGroups = [];
var parentProp = prop.propertyGroup(1);
while( parentProp && !isLayer(parentProp) )
{
try { if ( parentProp.transform ) shapeGroups.push( parentProp.transform ); }
catch (e) {}
parentProp = parentProp.propertyGroup(1);
}
for (var i = shapeGroups.length - 1; i >= 0; i--)
{
var group = shapeGroups[i];
matrix.translate( group.position.value );
matrix.rotate( group.rotation.value );
var aPX = -( group.anchorPoint.value[ 0 ] * group.scale.value[ 0 ] / 100 );
var aPY = -( group.anchorPoint.value[ 1 ] * group.scale.value[ 1 ] / 100 );
matrix.translate( [ aPX, aPY ] );
matrix.scale( group.scale.value / 100 );
}
return matrix;
}
function getLayerCompPos( t, l ) {
if (typeof t === 'undefined') t = time;
if (typeof l === 'undefined') l = thisLayer;
if (l.hasParent) return l.parent.toComp(l.position, t);
return l.toComp(l.anchorPoint, t);
}
function getLayerDistance(other, origin, t) {
if (typeof origin === 'undefined') origin = thisLayer;
if (typeof t === 'undefined') t = time;
var p1 = getLayerWorldPos(t, other);
var p2 = getLayerWorldPos(t, origin);
return length(p1, p2);
}
function getLayerWorldPos(t, l) {
if (typeof t === 'undefined') t = time;
if (typeof l === 'undefined') l = thisLayer;
if (l.hasParent) return l.parent.toWorld(l.position, t);
return l.position.valueAtTime(t);
}
function getLayerWorldSpeed(t, l) {
return length(getWorldVelocity(t, l));
}
function getLayerWorldVelocity(t, l) {
return (getLayerWorldPos(t, l) - getLayerWorldPos(t - 0.01, l)) * 100;
}
function getOrientation( l ) {
var sign = getScaleMirror( l );
var uTurn = getScaleUTurn( l )
var r = l.rotation.value * sign + uTurn;
while ( l.hasParent ) {
l = l.parent;
var lr = l.rotation.value;
if (l.hasParent) {
var s = l.parent.scale.value;
lr *= Math.sign(s[0]*s[1]);
}
r += lr;
}
return r;
}
function getScaleMirror( l ) {
var sign = 1;
while (l.hasParent) {
l = l.parent;
var s = l.scale.value;
sign *= Math.sign(s[0]*s[1]);
}
return sign;
}
function getScaleUTurn( l ) {
var u = 1;
while (l.hasParent) {
l = l.parent;
var s = l.scale.value;
u = u*s[1];
}
if (u < 0) return 180;
else return 0;
}
function getOrientationAtTime( l, t ) {
var r = 0;
r += l.rotation.valueAtTime( t );
while ( l.hasParent ) {
l = l.parent;
r += l.rotation.valueAtTime( t );
}
return r;
}
function getPropWorldSpeed(t, prop) {
return length(getPropWorldVelocity(t, prop));
}
function getPropWorldValue(t, prop) {
if (typeof t === 'undefined') t = time;
if (typeof prop === 'undefined') prop = thisProperty;
if (isPosition(prop)) return getLayerWorldPos(t, thisLayer);
return thisLayer.toWorld(prop.valueAtTime(t), t);
}
function getPropWorldVelocity(t, prop) {
return (getPropWorldValue(t + 0.005, prop) - getPropWorldValue(t - 0.005, prop)) * 100;
}
function getScale( l ) {
var s = l.scale.value;
var threeD = s.length == 3;
while ( l.hasParent ) {
l = l.parent;
var ps = l.scale.value / 100;
if (threeD && ps.length == 3) {
s = [ s[0]*ps[0], s[1]*ps[1], s[2]*ps[2] ];
}
else if (threeD) {
s = [ s[0]*ps[0], s[1]*ps[1], s[2] ];
}
else {
s = [ s[0]*ps[0], s[1]*ps[1] ];
}
}
return s;
}
function isLayerFlipped( l ) {
if (typeof l === "undefined") l = thisLayer;
var signX = Math.sign( l.scale.value[0] );
var signY = Math.sign( l.scale.value[1] );
return signX != signY;
}
function Matrix() {
/*!
2D Transformation Matrix v2.7.5 LT
(c) Epistemex.com 2014-2018
License: MIT
*/
var me = this, _el;
me._t = me.transform;
me.a = me.d = 1;
me.b = me.c = me.e = me.f = 0;
}
Matrix.prototype = {
rotate: function(angle) {
angle = degreesToRadians(angle);
var
cos = Math.cos(angle),
sin = Math.sin(angle);
return this._t(cos, sin, -sin, cos, 0, 0)
},
rotateFromVector: function(x, y) {
return this.rotate(typeof x === "number" ? Math.atan2(y, x) : Math.atan2(x.y, x.x))
},
scale: function(s) {
return this._t(s[0], 0, 0, s[1], 0, 0);
},
shear: function(sx, sy) {
return this._t(1, sy, sx, 1, 0, 0)
},
skew: function(ax, ay) {
return this.shear(Math.tan(ax), Math.tan(ay))
},
setTransform: function(a, b, c, d, e, f) {
var me = this;
me.a = a;
me.b = b;
me.c = c;
me.d = d;
me.e = e;
me.f = f;
return me._x()
},
translate: function(t) {
return this._t(1, 0, 0, 1, t[0], t[1]);
},
transform: function(a2, b2, c2, d2, e2, f2) {
var
me = this,
a1 = me.a,
b1 = me.b,
c1 = me.c,
d1 = me.d,
e1 = me.e,
f1 = me.f;
/* matrix column order is:
*	a c e
*	b d f
*	0 0 1
*/
me.a = a1 * a2 + c1 * b2;
me.b = b1 * a2 + d1 * b2;
me.c = a1 * c2 + c1 * d2;
me.d = b1 * c2 + d1 * d2;
me.e = a1 * e2 + c1 * f2 + e1;
me.f = b1 * e2 + d1 * f2 + f1;
return me._x()
},
multiply: function(m) {
return this._t(m.a, m.b, m.c, m.d, m.e, m.f)
},
inverse: function(cloneContext) {
var
me = this,
m  = new Matrix(cloneContext ? me.context : null),
dt = me.determinant();
if (dt === 0) throw "Matrix not invertible.";
m.a = me.d / dt;
m.b = -me.b / dt;
m.c = -me.c / dt;
m.d = me.a / dt;
m.e = (me.c * me.f - me.d * me.e) / dt;
m.f = -(me.a * me.f - me.b * me.e) / dt;
return m
},
decompose: function() {
var
me		= this,
a		 = me.a,
b		 = me.b,
c		 = me.c,
d		 = me.d,
acos	  = Math.acos,
atan	  = Math.atan,
sqrt	  = Math.sqrt,
pi		= Math.PI,
translate = {x: me.e, y: me.f},
rotation  = 0,
scale	 = {x: 1, y: 1},
skew	  = {x: 0, y: 0},
determ	= a * d - b * c,
r, s;
if (a || b) {
r = sqrt(a * a + b * b);
rotation = b > 0 ? acos(a / r) : -acos(a / r);
scale = {x: r, y: determ / r};
skew.x = atan((a * c + b * d) / (r * r));
}
else if (c || d) {
s = sqrt(c * c + d * d);
rotation = pi * 0.5 - (d > 0 ? acos(-c / s) : -acos(c / s));
scale = {x: determ / s, y: s};
skew.y = atan((a * c + b * d) / (s * s));
}
else {
scale = {x: 0, y: 0};
}
return {
translate: translate,
rotation : rotation,
scale	: scale,
skew	 : skew
}
},
determinant: function() {
return this.a * this.d - this.b * this.c
},
applyToPoint: function(pt) {
var me = this;
var x = pt[0] * me.a + pt[1] * me.c + me.e;
var y = pt[0] * me.b + pt[1] * me.d + me.f;
var result = [x,y];
if (pt.length == 3) result.push(pt[2]);
return result;
},
isIdentity: function() {
var me = this;
return me.a === 1 && !me.b && !me.c && me.d === 1 && !me.e && !me.f
},
isInvertible: function() {
return !this._q(this.determinant(), 0)
},
isValid: function() {
return !(this.a * this.d)
},
isEqual: function(m) {
var
me = this,
q = me._q;
return  q(me.a, m.a) &&
q(me.b, m.b) &&
q(me.c, m.c) &&
q(me.d, m.d) &&
q(me.e, m.e) &&
q(me.f, m.f)
},
clone: function(noContext) {
return new Matrix(noContext ? null : this.context).multiply(this)
},
_q: function(f1, f2) {
return Math.abs(f1 - f2) < 1e-14
},
_x: function() {
var me = this;
try { if (me.context)
me.context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);
} catch(e) {}
return me
}
};
function pointsToWorld( points, layer ) {
for (var i = 0; i < points.length; i++) {
points[i] = layer.toWorld(points[i]);
}
return points;
}
function shapePointsToLayer( prop ) {
var points = prop.points();
var matrix = getGroupTransformMatrix( prop );
for (var i = 0; i < points.length; i++) {
points[i] = matrix.applyToPoint( points[i] );
}
return points;
}
function translatePointWithLayer( l, point, startT, endT ) {
try {
var pos = l.fromWorld( point, startT );
} catch ( e ) {
var pos = [ 0, 0 ];
}
var prevPos = l.toWorld( pos, startT );
var newPos = l.toWorld( pos, endT );
return newPos - prevPos;
}
