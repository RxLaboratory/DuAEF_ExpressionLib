/**
    * Fix for the ExtendScript engine, implements the Math.cbrt (cubic root) function.
    * @function
    * @name Math.cbrt
    * @param {Number} x The value
    * @return {Number} The cubic root
    */
if (typeof Math.cbrt === 'undefined') {
    Math.cbrt = (function(pow) {
      return function cbrt(x){
        // ensure negative numbers remain negative:
        return x < 0 ? -pow(-x, 1/3) : pow(x, 1/3);
      };
    })(Math.pow); // localize Math.pow to increase efficiency
  }
  