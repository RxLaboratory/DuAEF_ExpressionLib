/**
 * A (very) simplified version of FuzzyLogics, better for performance with expressions.<br />
 * See {@link https://github.com/Nico-Duduf/DuFuzzyLogic} for more explanations
 * @class
 * @classdesc A (very) simplified version of FuzzyLogics, better for performance with expressions.
 * See {@link https://github.com/Nico-Duduf/DuFuzzyLogic} for more explanations
 * @author Nicolas "Duduf" Dufresne
 * @license GPL-v3
 * @copyright 2020-2022 Nicolas Dufresne and contributors
 * @param {Number} v The original veracity, must be in the range [0.0, 1.0]
 * @param {Number} [f=1] A factor to adjust the <i>importance</i> of the veracity, when compared to others.
 * @category ExpressionLibrary
 */

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