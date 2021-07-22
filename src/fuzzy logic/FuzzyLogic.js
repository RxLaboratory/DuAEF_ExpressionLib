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
