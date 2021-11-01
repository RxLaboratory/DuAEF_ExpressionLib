/**
  * Fuzzy Logics for expressions. See {@link https://github.com/Nico-Duduf/DuFuzzyLogic} for more explanations
  * @class
  * @classdesc Fuzzy Logics for expressions. See {@link https://github.com/Nico-Duduf/DuFuzzyLogic} for more explanations
  * @author Nicolas "Duduf" Dufresne
  * @license GPL-v3
  * @copyright 2020-2021 Nicolas Dufresne and contributors
  * @requires logistic
  * @requires inverseLogistic
  * @requires gaussian
  * @requires inverseGaussian
*/

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
              //return (val-this.min) / (this.plateauMin - this.min);
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
  
      // below
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
          crisp.push( inverseLogistic(veracity, mid) );
      }
      else if (this.shapeIn === "gaussian")
      {
          var width = this.plateauMin - this.min;
          var g = inverseGaussian( veracity, 0, 1, this.plateauMin, width);
          crisp.push( g[0] );
      }
  
      //above
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
          crisp.push( inverseLogistic( 1-veracity, mid, 0, 1 ) );
      }
      else if (this.shapeOut === "gaussian")
      {
          width = this.max - this.plateauMax;
          var g = inverseGaussian( 1-veracity, 0, 1, this.plateauMax, width);
          crisp.push( g[1] );
      }
  
      // Clamp
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
  
      // Check if this set is already here
      for (var i = 0, num = this.sets.length; i < num; i++)
      {
          if (fuzzyset.name == this.sets[i].name) 
          {
              this.sets[i].quantifiers.push(quantifier);
              this.sets[i].veracities.push(v);
              return;
          }
      }
  
      //otherwise, add it
      fuzzyset.quantifiers = [quantifier];
      fuzzyset.veracities = [v];
      this.sets.push( fuzzyset );
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
  
      // get all average values
      // and veracities from the sets
      var sumWeights = 0;
      for (var i = 0, num = this.sets.length; i < num; i++)
      {
          var fuzzyset = this.sets[i];
          for( var j = 0, numV = fuzzyset.veracities.length; j < numV; j++)
          {
              // the veracity
              var v = fuzzyset.veracities[j];
              var q = fuzzyset.quantifiers[j];
              // the corresponding values
              var vals = fuzzyset.crispify( q, v );
              var val;
              var ver;
  
              val = mean(vals);
              crisp += val * v.veracity;
              ver = v.veracity;
  
              sumWeights += ver;
              
  
              // generate report
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
  
  
      //sort the report
      if (this.reportEnabled) this.report.sort(ruleSorter);
  
      if (clearSets)
      {
          // freeze all
          this.val = crisp;
          //reset sets
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

// ====== LOW-LEVEL UTILS =====

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


/**
 * Interpolates a value with a bezier curve.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a custom bézier interpolation.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number[]} [bezierPoints=[0.33,0.0,0.66,1.0]] an Array of 4 coordinates wihtin the [0.0, 1.0] range which describes the Bézier interpolation. The default mimics the native ease() function<br />
 * [ outTangentX, outTangentY, inTangentX, inTangentY ]
 * @return {number} the value.
 */
function bezierInterpolation(t, tMin, tMax, value1, value2, bezierPoints) {
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


/**
 * Interpolates a value with an exponential function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=1] The raising speed in the range [0, inf].
 * @return {number} the value.
 * @requires linearExtrapolation
 */
function expInterpolation(t, tMin, tMax, vMin, vMax, rate)
{
    if (rate == 0) return linearExtrapolation(t, tMin, tMax, vMin, vMax);
	// Offset t to be in the range 0-Max
	tMax = ( tMax - tMin ) * rate;
	t = ( t - tMin ) * rate;
	// Compute the max
	var m = Math.exp(tMax);
	// Compute current value
	t = Math.exp(t);
	return linearExtrapolation(t, 1, m, vMin, vMax);
}

/**
 * Interpolates a value with a gaussian function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=0] The raising speed in the range [-1.0, 1.0].
 * @return {number} the value.
 */
function gaussianInterpolation( t, tMin, tMax, value1, value2, rate )
{
    // fix small bump at first value
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

/**
 * Interpolates a value with a linear function, but also extrapolates it outside of known values.<br />
 * This method can replace <code>linear()</code>, adding extrapolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate and extrapolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @return {number} the value.
 */
function linearExtrapolation( t, tMin, tMax, value1, value2 )
{
  if (tMax == tMin) return (value1+value2) / 2;
  return value1 + (( t - tMin) / (tMax - tMin)) * (value2 - value1);
}


/**
 * Interpolates a value with a logarithmic function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=1] The raising speed in the range [0, inf].
 * @return {number} the value.
 * @requires linearExtrapolation
 */
 function logInterpolation(t, tMin, tMax, vMin, vMax, rate)
 {
    if (rate == 0) return linearExtrapolation(t, tMin, tMax, vMin, vMax);
    // Offset t to be in the range 0-Max
    tMax = ( tMax - tMin ) * rate + 1;
    t = ( t - tMin ) * rate + 1;
    if (t <= 1) return vMin;
    // Compute the max
    var m = Math.log(tMax);
    // Compute current value
    var v = Math.log(t);
    return linearExtrapolation(v, 0, m, vMin, vMax);
 }

/**
 * Interpolates a value with a logistic (sigmoid) function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=1] The raising speed in the range [0, inf].
 * @param {number} [tMid=0.5] The t value at which the interpolated value should be half way.
 * @return {number} the value.
 * @requires logistic
 * @requires linearExtrapolation
 */
function logisticInterpolation( t, tMin, tMax, value1, value2, rate, tMid )
{
    if (rate == 0) return linearExtrapolation(t, tMin, tMax, value1, value2);
    t = logistic( t, tMid, tMin, tMax, rate);
    
    // Scale to actual min/max
    var m = logistic( tMin, tMid, tMin, tMax, rate);
    var M = logistic( tMax, tMid, tMin, tMax, rate);

    return linearExtrapolation( t, m, M, value1, value2);
}


/**
 * Gets the key immediately before the given time
 * @function
 * @param {number} t Time at which to get the key
 * @param {Property} prop The property from which to get the key
 * @return {Key|null} The key, or null if there's no key before.
 */
function getNextKey(t, prop) {
    if (prop.numKeys == 0) return null;
    var nKey = prop.nearestKey(t);
    if (nKey.time >= t) return nKey;
    if (nKey.index < prop.numKeys) return prop.key(nKey.index + 1);
    return null;
}

/**
 * Gets the key immediately before the given time
 * @function
 * @param {number} t Time at which to get the key
 * @param {Property} prop The property from which to get the key
 * @return {Key|null} The key, or null if there's no key before.
 */
function getPrevKey(t, prop) {
    if (prop.numKeys == 0) return null;
    var nKey = prop.nearestKey(t);
    if (nKey.time <= t) return nKey;
    if (nKey.index > 1) return prop.key(nKey.index - 1);
    return null;
}

/**
 * Checks if current time is after the time of the last key in the property
 * @function
 * @return {boolean} true if time is > lastkey.time
 */
function isAfterLastKey() {
	if (numKeys == 0) return false;
	var nKey = nearestKey(time);
	return nKey.time <= time && nKey.index == numKeys;
}


/**
 * Bounce, to be used when the speed is 0.
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {float} elasticity The elasticity, which controls the amplitude and frequence according to the last known velocity
 * @param {float} damping Damping
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float|float[]} The new value
 * @function
 * @requires getPrevKey
 * @requires bezierInterpolation
 */
function bounce(t, elasticity, damping, vAtTime) {
  
    // Nothing without elasticity
      if (elasticity == 0) return value;
      
      // Needs keyframes
      if (numKeys < 2) return value;
      
      // The nearest key is the first one
      if (nearestKey(t).index == 1) return value;
      
      // Get the velocity and speed
      var pVelocity = ( vAtTime(t) - vAtTime( t - .01 ) ) * 100;
      var pSpeed = length( pVelocity );
  
      // Too fast
      if (pSpeed >= 0.001 ) return value;
      
      //check start and current time
      var bounceStart = 0;
      var bounceTime = 0;
  
      //follow through starts at previous key
    var bouceKey = getPrevKey(t, thisProperty);
    bounceStart = bouceKey.time;
  
    // Time spent since start time
      bounceTime = t - bounceStart;
      
      // Last velocity
      pVelocity = ( vAtTime( bounceStart ) - vAtTime( bounceStart - thisComp.frameDuration * .5 ) );
      var bounceValue = ( pVelocity / thisComp.frameDuration ) ;
      
      
      var cycleDamp = Math.exp(bounceTime * damping * .1);
      var damp = Math.exp(bounceTime * damping) / (elasticity / 2);
      var cycleDuration = 1 / (elasticity * 2);
      
    //round to whole frames for better animation
      cycleDuration = Math.round(timeToFrames(cycleDuration));
      cycleDuration = framesToTime(cycleDuration);
      var midDuration = cycleDuration / 2;
      var maxValue = bounceValue * midDuration;
      
    //check which cycle it is and cycvarime
      var cycvarime = bounceTime;
      // the number of cycles where we "cheat" which are rounded to two frames
      var numEndCycles = 1;
      
      while (cycvarime > cycleDuration) {
          cycvarime = cycvarime - cycleDuration;
          cycleDuration = cycleDuration / cycleDamp;
          //round everything to whole frames for better animation
          cycleDuration = Math.round(timeToFrames(cycleDuration));
          //this is where we cheat to continue to bounce on cycles < 2 frames
          if (cycleDuration < 2) {
              cycleDuration = 2;
              numEndCycles++;
          }
          cycleDuration = framesToTime(cycleDuration);
          midDuration = cycleDuration / 2;
          maxValue = bounceValue * midDuration / damp;
          if (numEndCycles > 100 / damping && maxValue < threshold) return value;
      }
      
      if (cycvarime < midDuration) bounceValue = bezierInterpolation(cycvarime, 0, midDuration, 0, maxValue, [0, .1, .33, 1]);
      else bounceValue = bezierInterpolation(cycvarime, midDuration, cycleDuration, maxValue, 0, [.66, 0, 1, .9]);
      
      var prevValue = valueAtTime(bounceStart - thisComp.frameDuration);
      var startValue = valueAtTime(bounceStart);
      if (value instanceof Array) {
          for (var i = 0; i < prevValue.length; i++) {
              if (prevValue[i] > startValue[i]) bounceValue[i] = Math.abs(fThrough[i]);
              if (prevValue[i] < startValue[i]) bounceValue[i] = -Math.abs(fThrough[i]);
          }
      } else {
          if (prevValue > startValue) bounceValue = Math.abs(bounceValue);
          if (prevValue < startValue) bounceValue = -Math.abs(bounceValue);
      }
  
      return bounceValue + value;
  }

/**
 * Animatable equivalent to loopIn('continue').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @returns {float|float[]} The new value
 * @function
 * @requires getNextKey
 */
 function continueIn(t) {
	if (numKeys <= 1) return value;
	var firstKey = getNextKey(t, thisProperty);
	if (!firstKey) return value;
	var firstVelocity = velocityAtTime(firstKey.time + 0.001);
	var timeSpent = firstKey.time - t;
	return firstKey.value - timeSpent * firstVelocity;
}

/**
 * Animatable equivalent to loopOut('continue').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @returns {float|float[]} The new value
 * @function
 * @requires getNextKey
 */
function continueOut(t) {
	if (numKeys <= 1) return value;
	var lastKey = getPrevKey(t, thisProperty);
	if (!lastKey) return value;
	var lastVelocity = velocityAtTime(lastKey.time - 0.001);
	var timeSpent = t - lastKey.time;
	return lastKey.value + timeSpent * lastVelocity;
}

/**
 * Animatable equivalent to loopIn('cycle') and loopIn('offset').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {Boolean} o Wether to offset or cycle
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float|float[]} The new value
 * @function
 * @requires getNextKey
 */
 function cycleIn(t, nK, o, vAtTime) {
	if (numKeys <= 1) return value;
	var lastKeyIndex = numKeys;
	
	var firstKey = getNextKey(t, thisProperty);
	if (!firstKey) return value;
	if (firstKey.index == lastKeyIndex) return value;
	
	if (nK >= 2) {
		nK = nK - 1;
		lastKeyIndex = firstKey.index + nK;
		if (lastKeyIndex > numKeys) lastKeyIndex = numKeys;
	}
	
	var loopStartTime = firstKey.time;
	var loopEndTime = key(lastKeyIndex).time;
	var loopDuration = loopEndTime - loopStartTime;
	if (t >= loopStartTime) return value;
	var timeSpent = loopStartTime - t;
	var numLoops = Math.floor(timeSpent / loopDuration);
	var loopTime = loopDuration - timeSpent;
	if (numLoops > 0) loopTime = loopDuration - (timeSpent - numLoops * loopDuration);
	var r = vAtTime(loopStartTime + loopTime);
	if (o) r -= (key(lastKeyIndex).value - firstKey.value) * (numLoops + 1);
	return r;
}

/**
 * Animatable equivalent to loopOut('cycle') and loopOut('offset').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {Boolean} o Wether to offset or cycle
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float|float[]} The new value
 * @function
 * @requires getPrevKey
 */
 function cycleOut(t, nK, o, vAtTime) {
	if (numKeys <= 1) return value;
	var firstKeyIndex = 1;
	
	var lastKey = getPrevKey(t, thisProperty);
	if (!lastKey) return value;
	if (lastKey.index == firstKeyIndex) return value;
	
	if (nK >= 2) {
		nK = nK - 1;
		firstKeyIndex = lastKey.index - nK;
		if (firstKeyIndex < 1) firstKeyIndex = 1;
	}
	
	var loopStartTime = key(firstKeyIndex).time;
	var loopEndTime = key(lastKey.index).time;
	var loopDuration = loopEndTime - loopStartTime;
	if (t <= loopEndTime) return value;
	var timeSpent = t - loopEndTime;
	var numLoops = Math.floor(timeSpent / loopDuration);
	var loopTime = timeSpent;
	if (numLoops > 0) loopTime = timeSpent - numLoops * loopDuration;
	var r = vAtTime(loopStartTime + loopTime);
	if (o) r += (key(lastKey.index).value - key(firstKeyIndex).value) * (numLoops + 1);
	return r;
}

/**
 * Overshoot animation, to be used when the speed is 0.
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {float} elasticity The elasticity, which controls the amplitude and frequence according to the last known velocity
 * @param {float} damping Damping
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float|float[]} The new value
 * @function
 * @requires getPrevKey
 */
function overShoot(t, elasticity, damping, vAtTime) {

	// Nothing without elasticity
	if (elasticity == 0) return value;
	
	// Needs keyframes
	if (numKeys < 2) return value;
	
	// The nearest key is the first one
	if (nearestKey(t).index == 1) return value;
	
	// Get the velocity and speed
	var pVelocity = ( vAtTime(t) - vAtTime( t - .01 ) ) * 100;
	var pSpeed = length( pVelocity );

	// Too fast
	if (pSpeed >= 0.001 ) return value;
	
	//check start and current time
	var oShootStart = 0;
	var oShootTime = 0;
  
    //follow through starts at previous key
    var oShootKey = getPrevKey(t, thisProperty);
    oShootStart = oShootKey.time;

    // Time spent since start time
	oShootTime = t - oShootStart;
	
	// Last velocity
	pVelocity = ( vAtTime( oShootStart ) - vAtTime( oShootStart - thisComp.frameDuration * .5 ) );

	// damping ratio
	var damp = Math.exp(oShootTime * damping);
	// sinus evolution 
	var sinus = elasticity * oShootTime * 2 * Math.PI;
	//sinus
	sinus = Math.sin(sinus);
	// elasticity
	sinus = (.3 / elasticity) * sinus;
	// damping
	sinus = sinus / damp;
	// Stop when too small
	if (Math.abs(sinus) < .00001) return value;
	// Result from velocity
	var oShoot = ( pVelocity / thisComp.frameDuration ) * sinus;
	
	return oShoot+value;
}

/**
 * Animatable equivalent to loopIn('pingpong').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float} The new value
 * @function
 * @requires getNextKey
 */
 function pingPongIn(t, nK, vAtTime) {
	if (numKeys <= 1) return value;
	var lastKeyIndex = numKeys;
	
	var firstKey = getNextKey(t, thisProperty);
	if (!firstKey) return value;
	if (firstKey.index == lastKeyIndex) return value;
	
	if (nK >= 2) {
		nK = nK - 1;
		lastKeyIndex = firstKey.index + nK;
		if (lastKeyIndex > numKeys) lastKeyIndex = numKeys;
	}
	
	var loopStartTime = firstKey.time;
	var loopEndTime = key(lastKeyIndex).time;
	var loopDuration = loopEndTime - loopStartTime;
	if (t >= loopStartTime) return value;
	var timeSpent = loopStartTime - t;
	var numLoops = Math.floor(timeSpent / loopDuration);
	var loopTime = timeSpent;
	if (numLoops > 0) {
		loopTime = timeSpent - numLoops * loopDuration;
		if (numLoops % 2 != 0) loopTime = loopDuration - loopTime;
	}
	return vAtTime(loopStartTime + loopTime);
}

/**
 * Animatable equivalent to loopOut('pingpong').
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float} The new value
 * @function
 * @requires getPrevKey
 */
 function pingPongOut(t, nK, vAtTime) {
	if (numKeys <= 1) return value;
	var firstKeyIndex = 1;
	
	var lastKey = getPrevKey(t, thisProperty);
	if (!lastKey) return value;
	if (lastKey.index == firstKeyIndex) return value;
	
	if (nK >= 2) {
		nK = nK - 1;
		firstKeyIndex = lastKey.index - nK;
		if (firstKeyIndex < 1) firstKeyIndex = 1;
	}
	
	var loopStartTime = key(firstKeyIndex).time;
	var loopEndTime = key(lastKey.index).time;
	var loopDuration = loopEndTime - loopStartTime;
	if (t <= loopEndTime) return value;
	var timeSpent = t - loopEndTime;
	var numLoops = Math.floor(timeSpent / loopDuration);
	var loopTime = loopDuration - timeSpent;
	if (numLoops > 0) {
		loopTime = timeSpent - numLoops * loopDuration;
		if (numLoops % 2 == 0) loopTime = loopDuration - loopTime;
	}
	return vAtTime(loopStartTime + loopTime);
}

/**
 * Adds two lists of points/vectors.
 * @function
 * @param {float[][]} p1 The list of points
 * @param {float[][]} p2 The other list of points
 * @param {float} w A weight to multiply the values of p2
 * @returns {float[][]} The added points
 */
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

/**
    * The gaussian function<br />
    * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
    * @function
    * @param {Number} value The variable
    * @param {Number} [min=0] The minimum return value
    * @param {Number} [max=1] The maximum return value
    * @param {Number} [center=0] The center of the peak
    * @param {Number} [fwhm=1] The full width at half maximum of the curve
    * @return {Number} The result
    */
function gaussian( value, min, max, center, fwhm)
{
    if (fwhm === 0 && value == center) return max;
    else if (fwhm === 0) return 0;

    var exp = -4 * Math.LN2;
    exp *= Math.pow((value - center),2);
    exp *= 1/ Math.pow(fwhm, 2);
    var result = Math.pow(Math.E, exp);
    return result * (max-min) + min;
}

/**
    * The inverse gaussian function<br />
    * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
    * @function
    * @param {Number} v The variable
    * @param {Number} [min=0] The minimum return value of the corresponding gaussian function
    * @param {Number} [max=1] The maximum return value of the corresponding gaussian function
    * @param {Number} [center=0] The center of the peak of the corresponding gaussian function
    * @param {Number} [fwhm=1] The full width at half maximum of the curve of the corresponding gaussian function
    * @return {Number[]} The two possible results, the lower is the first in the list. If both are the same, it is the maximum
    */
function inverseGaussian ( v, min, max, center, fwhm)
{
    if (v == 1) return [center, center];
    if (v === 0) return [center + fwhm/2, center - fwhm/2];
    if (fwhm === 0) return [center, center];

    var result = (v-min)/(max-min);
    result = Math.log( result ) * Math.pow(fwhm,2);
    result = result / ( -4 * Math.LN2 );
    result = Math.sqrt( result );
    return [ result + center, -result + center ];
}

/**
    * The inverse logistic function (inverse sigmoid)<br />
    * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.    * @function
    * @function
    * @param {Number} v The variable
    * @param {Number} [midValue=0] The midpoint value, at which the function returns max/2 in the original logistic function
    * @param {Number} [min=0] The minimum return value of the original logistic function
    * @param {Number} [max=1] The maximum return value of the original logistic function
    * @param {Number} [rate=1] The logistic growth rate or steepness of the original logistic function
    * @return {Number} The result
    */
function inverseLogistic ( v, midValue, min, max, rate)
{
    if (v == min) return 0;
    
    return midValue - Math.log( (max-min)/(v-min) - 1) / rate;
}

/**
    * Checks if the value is 0; works with arrays.
    * @function
    * @name isZero
    * @param {Number|Number[]} x The value(s)
    * @return {Boolean} true if all values are 0.
    */
 function isZero(a)
 {
    if (a.length)
    {
        for ( var i = 0; i < a.length; i++ )
        {
            if ( a[i] != 0 ) return false;
        }
    }
    else if (a != 0) return false;
    return true;
 }

/**
    * The logistic function (sigmoid)<br />
    * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
    * @function
    * @param {Number} value The value
    * @param {Number} [midValue=0] The midpoint value, at which the function returns max/2
    * @param {Number} [min=0] The minimum return value
    * @param {Number} [max=1] The maximum return value
    * @param {Number} [rate=1] The logistic growth rate or steepness of the function
    * @return {Number} The result in the range [min, max] (excluding min and max)
    */
function logistic( value, midValue, min, max, rate)
{
    var exp = -rate*(value - midValue);
    var result = 1 / (1 + Math.pow(Math.E, exp));
    return result * (max-min) + min;
}

/**
    * Returns the mean of a set of values
    * @function
    * @param {Number[]} values The values
    * @return {Number} The mean
    */
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

/**
 * Multiplies a list of points/vectors with a scalar.
 * @function
 * @param {float[][]} p The list of points
 * @param {float} w The multiplier
 * @returns {float[][]} The multiplied points
 */
function multPoints(p, w) {
    var r = [];
    for (var i = 0, n = p.length; i < n; i++) {
        r.push(p[i] * w);
    }
    return r;
}

/**
 * Normalizes a list of weights so their sum equals 1.0
 * @function
 * @param {float[]} weights The weights to normalize
 * @param {float} sum The sum of the weights
 * @returns {float[]} The normalized weights
 */
function normalizeWeights(weights, sum) {
    if (sum == 1 || sum == 0) return weights;
    var o = 1 - sum;
    var normalized = [];
    for (var i = 0, n = weights.length; i < n; i++) {
        var w = weights[i];
        normalized.push(w + (w / sum) * o);
    }
    return normalized;
}

/**
    * Fix for the ExtendScript engine, implements the Math.sign function.
    * @function
    * @name Math.sign
    * @param {Number} x The value
    * @return {Number} The sign, 1, -1 or 0.
    */
if (typeof Math.sign === 'undefined') Math.sign = function(x) { return ((x > 0) - (x < 0)) || +x; };

/**
 * Substracts two lists of points/vectors.
 * @function
 * @param {float[][]} p1 The list of points
 * @param {float[][]} p2 The other list of points
 * @param {float} w A weight to multiply the values of p2
 * @returns {float[][]} The substracted points
 */
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

/**
 * Adds two paths together.<br />
 * The paths must be objects with three array attributes: points, inTangents, outTangents
 * @function
 * @param {Object} path1 First path
 * @param {Object} path2 Second path
 * @param {float} path2weight A weight to multiply the second path values
 * @returns {Object} A path object with three array attributes: points, inTangents, outTangents
 * @requires addPoints
 */
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

/**
 * Multiplies a path with a scalar.<br />
 * The path must be an object with three array attributes: points, inTangents, outTangents
 * @function
 * @param {Object} path The path
 * @param {float} weight The multipliers
 * @returns {Object} A path object with three array attributes: points, inTangents, outTangents
 * @requires multPoints
 */
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

/**
 * Substracts two paths together.<br />
 * The paths must be objects with three array attributes: points, inTangents, outTangents
 * @function
 * @param {Object} path1 First path
 * @param {Object} path2 Second path
 * @param {float} path2weight A weight to multiply the second path values
 * @returns {Object} A path object with three array attributes: points, inTangents, outTangents
 * @requires subPoints
 */
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

/**
 * Checks the type of a pseudo-effect used by Duik.<br />
 * This is a workaround for the missing matchName in expressions.<br />
 * Pseudo-Effects used by Duik start with a hidden property which name is the same as the matchName of the effect itself (without the 'Pseudo/' part).
 * @function
 * @example
 * if ( checkEffect(thisLayer.effect(1), "DUIK parentConstraint2") ) { "This is the second version of the parent constraint by Duik" }
 * else { "Who knows what this is?" }
 * @param {Property} fx The effect to check
 * @param {string} duikMatchName The matchName of a pseudo-effect used by Duik (without the 'Pseudo/' part)
 * @return {boolean} True when the property at propIndex is named propName
 */
function checkDuikEffect(fx, duikMatchName) {
    if (fx.numProperties  < 3) return false;
    if (!!$.engineName) {
        if ( fx(2).name != duikMatchName ) return false;
    }
    else {
        try { if (fx(2).name != duikMatchName) return false; }
        catch (e) { return false; }
    }
    return true;
}

/**
 * Checks the type of an effect.<br />
 * This is a workaround for the missing matchName in expressions.<br />
 * It checks if the given effect has a specific property at a specific index.
 * @function
 * @example
 * if ( checkEffect(thisLayer.effect(1), 1, "Blur") ) { "The first effect is a blur!" }
 * else { "Who knows what this is?" }
 * @param {Property} fx The effect to check
 * @param {int} propIndex The index of the property
 * @param {string} propName The expected name of the property. Be careful with the internationalization of After Effects...
 * @return {boolean} True when the property at propIndex is named propName
 */
function checkEffect(fx, propIndex, propName) {
    if (fx.numProperties  < propIndex) return false;
    //Check when this is a javascript engine (without try/catch for better performance)
    if (!!$.engineName) {
        if ( fx(propIndex).name != propName ) return false;
    }
    //Check with the extendscript engine
    else {
        try { if (fx(propIndex).name != propName) return false; }
        catch (e) { return false; }
    }
    return true;
}

/**
 * Gets a layer from a layer property in an effect, without generating an error if "None" is selected with the Legacy expression engine.
 * @function
 * @param {Property} fx The effect
 * @param {int|string} ind The index or the name of the property
 * @return {Layer|null} The layer, or null if set to "None"
 */
function getEffectLayer( fx, ind ) {
	try { var l = fx( ind ); return l; }
	catch ( e ) { return null; }	
}

/**
 * Gets the path from the current property at a given time.
 * @function
 * @return {Object} A path object with three array attributes: points, inTangents, outTangents
 */
function getPath(t) {
    var path = {};
    path.points = points(t);
    path.inTangents = inTangents(t);
    path.outTangents = outTangents(t);
    return path;
}

/**
 * Gets a property from an array of indices as returned by getPropPath.
 * @function
 * @param {Layer} l The layer containing the needed property
 * @param {int[]} p The indices to the property.
 * @return {Property} The property.
 */
function getPropFromPath( l, p )
{
	prop = l;
	for ( var i = p.length - 1; i >= 0; i-- )
		prop = prop(p[i]);
	return prop;
}

/**
 * Gets an array of all indices needed to get the current property from the layer level.
 * @function
 * @return {int[]} All indices to the property.
 */
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

/**
 * Gets the same property as the current one but from another layer.
 * @function
 * @param {Layer} l The layer containing the needed property
 * @return {Property} The property.
 * @requires getPropFromPath
 * @requires getPropPath
 */
function getSameProp( l )
{
	return getPropFromPath( l, getPropPath() );
}

/**
 * Checks if a property is a layer. Useful when traversing up the property tree to stop when getting the layer.
 * @function
 * @param {Property} prop - The property to test
 * @return {boolean} true if the prop is a layer
 */
function isLayer( prop ) {
	//try catch is needed for the legacy expression engine
	try { if ( prop.index ) return true; }
	catch (e) { return false; }
}

/**
 * Checks if a property is a path property.
 * @function
 * @param {Property} prop The property
 * @return {boolean} true if the property is a path property.
 */
function isPath(prop) {
    try {
        createPath();
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Checks if a property is a transform.position property.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Property} [prop=thisProperty] The property
 * @return {boolean} true if the property is the transform.position property.
 */
function isPosition(prop) {
	return  prop === position;
}

/**
 * Checks if a property is spatial
 * @function
 * @param {Property} prop The property to check
 * @return {boolean} true if the property is spatial.
 */
function isSpatial(prop) {
	if (!(prop.value instanceof Array)) return false;
	if (prop.value.length != 2 && prop.value.length != 3) return false;
	try { if (typeof prop.speed !== "undefined") return true; }
	catch (e) { return false; }
}

/**
 * Checks if the current property is animated at a given time.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] The time
 * @param {number} [threshold=0.1] The speed under which the property is considered still.
 * @return {boolean} true if the property does not vary.
 */
function isStill(t, threshold) {
	var d = valueAtTime(t-.001) - valueAtTime(t + .001 );
	if (d instanceof Array) {
		for (var i = 0; i < d.length; i++) {
			d[i] = Math.abs(d[i]);
			if (d[i] > threshold) {
				return false;
			}
		}
		return true;
	} else {
		d = Math.abs(d);
		return d <= threshold;
	}
}

/**
 * Checks the last previous time at which the property value was not 0. (meant to be used on boolean property, works on single dimension properties too).
 * @param {Property} prop The property to check
 * @param {float} t The time before which to run the check
 * @returns {float} The last active time before t
 * @function
 * @requires getPrevKey
 */
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

/**
 * Checks the next time at which the property value was not 0. (meant to be used on boolean property, works on single dimension properties too).
 * @param {Property} prop The property to check
 * @param {float} t The time after which to run the check
 * @returns {float} The next active time after t
 * @function
 * @requires getNextKey
 */
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


/**
 * Generates a "zero" value for the current property, i.e. <code>0</code> or <code>[0,0]</code>, etc. according to the property type.<br />
 * Note that for path properties, this method returns a path object with three array attributes: points, inTangents, outTangents.
 * @function
 * @return {any} The zero value.
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

/**
 * Adds some noise to a value.<br />
 * You may use seedRandom() before using this function as it will influence the generated noise.
 * A timeless noise can be achieved with <code>seedRandom(index,true)</code> for example.
 * @function
 * @param {number|number[]} val The value to add noise to.
 * @param {float} quantity The quantity of noise. A percentage. 100 means the value can range from (val * 0) to (val * 2).
 * @example
 * seedRandom(index, true) // a timeless noise
 * addNoise(value, 50 ); // the property value will have noise between (value * 0.5) and (value * 1.5) which won't vary through time.
 * @example
 * seedRandom(index, false);
 * addNoise(value, 33 ); // the noise will change at each frame, varying between (value * .66) and (value * 1.33)
 */
function addNoise( val, quantity ) {
  // a true random value to make sure all properties have a differente noise
  // even with the same start value
  var randomValue = random(0.9,1.1);
  // generate a noise from the start value
  // (which means properties with a similar value won't be to far away from each other)
  var noiseValue = noise(valueAtTime(0) * randomValue);
  noiseValue = noiseValue * (quantity / 100);
  return val * ( noiseValue + 1 );
}

/**
 * Removes the ancestors rotation from the rotation of a layer.
 * This is very useful to make a layer keep its orientation without being influenced by its parents.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @example
 * //in a rotation property, just include the function and use:
 * dishineritRotation();
 * //the layer will now keep its own orientation.
 * @example
 * //you can also combine the result with something else
 * var result = dishineritRotation();
 * result + wiggle(5,20);
 * @function
 * @param {Layer} [l=thisLayer] The layer
 * @return {float} The new rotation value, in degrees.
 * @requires sign
 */
function dishineritRotation( l ) {
    var r = l.rotation.value;
    while ( l.hasParent ) {
        l = l.parent;
        var s = l.scale.value;
        r -= l.rotation.value * Math.sign(s[0]*s[1]);
    }
    return r;
}

/**
 * Removes the ancestors scale from the scale of a layer.
 * This is very useful to make a layer keep its scale without being influenced by its parents.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @example
 * //in a rotation property, just include the function and use:
 * dishineritScale();
 * //the layer will now keep its own scale.
 * @example
 * //you can also combine the result with something else
 * var result = dishineritScale();
 * result + wiggle(5,20);
 * @function
 * @param {Layer} [l=thisLayer] The layer
 * @return {float[]} The new scale value, in percent.
 */
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

/**
 * Converts the point coordinates from the current group in the shape layer to the Layer.<br />
 * Use toWorld and toComp with the result if you need te coordinates in the world or the comp.
 * @function
 * @param {number[]} point The 2D coordinates of the point in the current group.
 * @return {number[]} The 2D coordinates of the point in the Layer.
 * @requires Matrix
 * @requires getGroupTransformMatrix
 */
function fromGroupToLayer( point ) {
    var matrix = getGroupTransformMatrix();
    return matrix.applyToPoint( point );
}

/**
 * Converts the point coordinates from Layer to the current group in the shape layer.<br />
 * Use fromWorld or fromComp first if you need to convert from the world or composition coordinates, and pass the result to this function.
 * @function
 * @param {number[]} point The 2D coordinates of the point in the Layer.
 * @return {number[]} The 2D coordinates of the point in the current group.
 * @requires Matrix
 * @requires getGroupTransformMatrix
 */
function fromLayerToGroup( point ) {
    var matrix = getGroupTransformMatrix().inverse();
    return matrix.applyToPoint( point );
}

/**
 * Gets the "real" scale of a layer, resulting to its scale property, the scale of its parents, and it's location in Z-space if it's 3D.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Layer} [l=thisLayer] The layer 
 * @param {number} [t=time] The time when to get the scale
 * @return {number} The scale ratio. This is not a percent, 1.0 is 100%.
 */
function getCompScale( l, t ) {
	//get ratio 
	var originalWidth = length( l.anchorPoint, [ l.width, 0 ] );
	var anchorInComp = l.toComp( l.anchorPoint, t );
	var widthInComp = l.toComp( [ l.width, 0 ], t );
	var newWidth = length(anchorInComp, widthInComp);
	return newWidth / originalWidth;
}

/**
 * Gets the transformation Matrix for the current group in a shape layer, including the transformation from the ancestor groups<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Property} [prop=thisProperty] The property from which to get the matrix
 * @return {Matrix} The 2D Transform Matrix.
 * @requires isLayer
 * @requires Matrix
 */
function getGroupTransformMatrix( prop ) {
    // A Matrix to apply group transforms
    var matrix = new Matrix();

	// Get all groups from this propperty
	var shapeGroups = [];
	var parentProp = prop.propertyGroup(1);
	while( parentProp && !isLayer(parentProp) )
	{
		//try catch is needed for the legacy expression engine
		try { if ( parentProp.transform ) shapeGroups.push( parentProp.transform ); }
		catch (e) {}
		parentProp = parentProp.propertyGroup(1);
	}
	
	for (var i = shapeGroups.length - 1; i >= 0; i--)
	{
		var group = shapeGroups[i];

		// position
		matrix.translate( group.position.value );
		// rotation
		matrix.rotate( group.rotation.value );
		// anchor point inverse transform, taking sale into account
		var aPX = -( group.anchorPoint.value[ 0 ] * group.scale.value[ 0 ] / 100 );
		var aPY = -( group.anchorPoint.value[ 1 ] * group.scale.value[ 1 ] / 100 );
		matrix.translate( [ aPX, aPY ] );
		// scale
		matrix.scale( group.scale.value / 100 );
	}

    return matrix;
}

/**
 * Gets the comp position (2D Projection in the comp) of a layer.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [l=thisLayer] The layer
 * @return {number[]} The comp position
 */
function getLayerCompPos( t, l ) {
    return l.toComp( l.anchorPoint, t );
}

/**
 * Gets the world position of a layer.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [l=thisLayer] The layer
 * @return {number[]} The world position
 */
function getLayerWorldPos(t, l) {
	return l.toWorld(l.anchorPoint, t);
}


/**
 * Gets the world instant speed of a layer.
 * @function
 * @param {number} [t=time] The time when to get the velocity
 * @param {Layer} [l=thisLayer] The layer
 * @return {number} A positive number. The speed.
 * @requires getLayerWorldVelocity
 */
function getLayerWorldSpeed(t, l) {
	return length(getWorldVelocity(t, l));
}

/**
 * Gets the world instant velocity of a layer.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] The time when to get the velocity
 * @param {Layer} [l=thisLayer] The layer
 * @return {number[]} The velocity.
 * @requires getLayerWorldPos
 */
function getLayerWorldVelocity(t, l) {
	return (getLayerWorldPos(t, l) - getLayerWorldPos(t - 0.01, l)) * 100;
}

/**
 * Gets the world orientation of a (2D) layer.
 * @function
 * @param {Layer} l The layer to get the orientation from
 * @return {float} The orientation, in degrees.
 * @requires sign
 */
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

/**
 * Gets the world orientation of a (2D) layer at a specific time.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Layer} l The layer to get the orientation from
 * @param {float} [t=time] The time at which to get the orientation
 * @return {float} The orientation, in degrees.
 */
function getOrientationAtTime( l, t ) {
    var r = 0;
    r += l.rotation.valueAtTime( t );
    while ( l.hasParent ) {
        l = l.parent;
        r += l.rotation.valueAtTime( t );
    }
    return r;
}

/**
 * Gets the world speed of a property.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [prop=thisProperty] The property
 * @return {number[]} The world speed
 * @requires getPropWorldVelocity
 */
function getPropWorldSpeed(t, prop) {
	return length(getPropWorldVelocity(t, prop));
}

/**
 * Gets the world coordinates of a property.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [prop=thisProperty] The property
 * @return {number[]} The world coordinates
 * @requires getLayerWorldPos
 * @requires isPosition
 */
function getPropWorldValue(t, prop) {
	if (isPosition(prop)) return getLayerWorldPos(t, thisLayer);
	return thisLayer.toWorld(prop.valueAtTime(t), t);
}

/**
 * Gets the world velocity of a property.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [prop=thisProperty] The property
 * @return {number[]} The world velocity
 * @requires getPropWorldValue
 */
function getPropWorldVelocity(t, prop) {
	return (getPropWorldValue(t + 0.005, prop) - getPropWorldValue(t - 0.005, prop)) * 100;
}

/**
 * Gets the world scale of a layer.
 * @function
 * @param {Layer} l The layer to get the scale from
 * @return {float[]} The scale, in percent.
 */
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

/*!
  2D Transformation Matrix v2.7.5 LT
  (c) Epistemex.com 2014-2018
  License: MIT
*/

/**
  * 2D transformation matrix object initialized with identity matrix. See the source code for more documentation.
  * @class
  * @classdesc 2D Transformation Matrix. Simplified for use in After Effects Expressions by Nicolas "Duduf" Dufresne
  * @prop {number} a - scale x
  * @prop {number} b - shear y
  * @prop {number} c - shear x
  * @prop {number} d - scale y
  * @prop {number} e - translate x
  * @prop {number} f - translate y
  * @author Epistemex
  * @version 2.7.5
  * @license MIT license (header required)
  * @copyright Epistemex.com 2014-2018
*/
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

	/**
	* Rotates current matrix by angle (accumulative).
	* @param {number} angle - angle in degrees
	* @returns {Matrix}
	*/
	rotate: function(angle) {
	 angle = degreesToRadians(angle);
	 var
		cos = Math.cos(angle),
		sin = Math.sin(angle);

	 return this._t(cos, sin, -sin, cos, 0, 0)
	},

	/**
	* Converts a vector given as `x` and `y` to angle, and
	* rotates (accumulative). x can instead contain an object with
	* properties x and y and if so, y parameter will be ignored.
	* @param {number|*} x
	* @param {number} [y]
	* @returns {Matrix}
	*/
	rotateFromVector: function(x, y) {
	 return this.rotate(typeof x === "number" ? Math.atan2(y, x) : Math.atan2(x.y, x.x))
	},

	/**
	* Scales current matrix accumulative.
	* @param {number[]} s - scale factor [x, y]. 1 does nothing, any third value (Z) is ignored.
	* @returns {Matrix}
	*/
	scale: function(s) {
	 return this._t(s[0], 0, 0, s[1], 0, 0);
	},

	/**
	* Apply shear to the current matrix accumulative.
	* @param {number} sx - amount of shear for x
	* @param {number} sy - amount of shear for y
	* @returns {Matrix}
	*/
	shear: function(sx, sy) {
	 return this._t(1, sy, sx, 1, 0, 0)
	},

	/**
	* Apply skew to the current matrix accumulative. Angles in radians.
	* Also see [`skewDeg()`]{@link Matrix#skewDeg}.
	* @param {number} ax - angle of skew for x
	* @param {number} ay - angle of skew for y
	* @returns {Matrix}
	*/
	skew: function(ax, ay) {
	 return this.shear(Math.tan(ax), Math.tan(ay))
	},

	/**
	* Set current matrix to new absolute matrix.
	* @param {number} a - scale x
	* @param {number} b - shear y
	* @param {number} c - shear x
	* @param {number} d - scale y
	* @param {number} e - translate x
	* @param {number} f - translate y
	* @returns {Matrix}
	*/
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

	/**
	* Translate current matrix accumulative.
	* @param {number[]} t - translation [x, y]. Any third value (Z) is ignored.
	* @returns {Matrix}
	*/
	translate: function(t) {
	 return this._t(1, 0, 0, 1, t[0], t[1]);
	},

	/**
	* Multiplies current matrix with new matrix values. Also see [`multiply()`]{@link Matrix#multiply}.
	*
	* @param {number} a2 - scale x
	* @param {number} b2 - skew y
	* @param {number} c2 - skew x
	* @param {number} d2 - scale y
	* @param {number} e2 - translate x
	* @param {number} f2 - translate y
	* @returns {Matrix}
	*/
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

	/**
	* Multiplies current matrix with source matrix.
	* @param {Matrix|Matrix|DOMMatrix|SVGMatrix} m - source matrix to multiply with.
	* @returns {Matrix}
	*/
	multiply: function(m) {
	 return this._t(m.a, m.b, m.c, m.d, m.e, m.f)
	},

	/**
	* Get an inverse matrix of current matrix. The method returns a new
	* matrix with values you need to use to get to an identity matrix.
	* Context from parent matrix is not applied to the returned matrix.
	*
	* @param {boolean} [cloneContext=false] - clone current context to resulting matrix
	* @throws Exception is input matrix is not invertible
	* @returns {Matrix} - new Matrix instance
	*/
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

	/**
	* Decompose the current matrix into simple transforms using QR.
	*
	* @returns {*} - an object containing current decomposed values (translate, rotation, scale, skew)
	* @see {@link https://en.wikipedia.org/wiki/QR_decomposition|More on QR decomposition}
	*/
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

		determ	= a * d - b * c,	// determinant(), skip DRY here...
		r, s;

	 // Apply the QR-like decomposition.
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
	 else { // a = b = c = d = 0
		scale = {x: 0, y: 0};
	 }

	 return {
		translate: translate,
		rotation : rotation,
		scale	: scale,
		skew	 : skew
	 }
	},

	/**
	* Returns the determinant of the current matrix.
	* @returns {number}
	*/
	determinant: function() {
	 return this.a * this.d - this.b * this.c
	},

	/**
	* Apply current matrix to `x` and `y` of a point.
	* Returns a point object.
	*
	* @param {number[]} pt - the point to transform ([x, y]).<br />
	* If an optionnal Z value is provided, it will be kept without transformation.
	* @returns {number[]} A new transformed point [x, y]. If pt had a third value, it is returned too, as it was without transformation.
	*/
	applyToPoint: function(pt) {
	 var me = this;
	 var x = pt[0] * me.a + pt[1] * me.c + me.e;
	 var y = pt[0] * me.b + pt[1] * me.d + me.f;
	 var result = [x,y];
	 if (pt.length == 3) result.push(pt[2]);
	 return result;
	},

	/**
	* Returns true if matrix is an identity matrix (no transforms applied).
	* @returns {boolean}
	*/
	isIdentity: function() {
	 var me = this;
	 return me.a === 1 && !me.b && !me.c && me.d === 1 && !me.e && !me.f
	},

	/**
	* Returns true if matrix is invertible
	* @returns {boolean}
	*/
	isInvertible: function() {
	 return !this._q(this.determinant(), 0)
	},

	/**
	* The method is intended for situations where scale is accumulated
	* via multiplications, to detect situations where scale becomes
	* "trapped" with a value of zero. And in which case scale must be
	* set explicitly to a non-zero value.
	*
	* @returns {boolean}
	*/
	isValid: function() {
	 return !(this.a * this.d)
	},

	/**
	* Compares current matrix with another matrix. Returns true if equal
	* (within epsilon tolerance).
	* @param {Matrix|Matrix|DOMMatrix|SVGMatrix} m - matrix to compare this matrix with
	* @returns {boolean}
	*/
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

	/**
	* Clones current instance and returning a new matrix.
	* @param {boolean} [noContext=false] don't clone context reference if true
	* @returns {Matrix} - a new Matrix instance with identical transformations as this instance
	*/
	clone: function(noContext) {
	 return new Matrix(noContext ? null : this.context).multiply(this)
	},

	/**
	* Compares floating point values with some tolerance (epsilon)
	* @param {number} f1 - float 1
	* @param {number} f2 - float 2
	* @returns {boolean}
	* @private
	*/
	_q: function(f1, f2) {
	 return Math.abs(f1 - f2) < 1e-14
	},

	/**
	* Apply current absolute matrix to context if defined, to sync it.
	* Apply current absolute matrix to element if defined, to sync it.
	* @returns {Matrix}
	* @private
	*/
	_x: function() {

	 var me = this;

	 //try catch is needed for the legacy expression engine
	 try { if (me.context)
		me.context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);
	 } catch(e) {}

	 return me
	}
};


/**
 * Translates a point with a layer, as if it was parented to it.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Layer} l The layer to get the translation from.
 * @param {float[]} [point=[0,0]] The [X,Y] point to translate (using world coordinates).
 * @param {float} [startT=0] The start time of the translation
 * @param {float} [endT=time] The end time of the translation
 * @return {float[]} The coordinates of the translated point.
 */
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


