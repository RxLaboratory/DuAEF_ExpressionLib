/**
    * Fix for the ExtendScript engine, implements the Math.sign function.
    * @function
    * @name Math.sign
    * @param {Number} x The value
    * @return {Number} The sign, 1, -1 or 0.
    */
if (typeof Math.sign === 'undefined') Math.sign = function(x) { return ((x > 0) - (x < 0)) || +x; };