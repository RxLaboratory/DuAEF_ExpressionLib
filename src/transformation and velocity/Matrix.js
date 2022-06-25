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
  * @category ExpressionLibrary
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
