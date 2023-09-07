/**
 * A fast pseudo random number generator
 * usage: `var rng = alea(seed); rng(5, 10);` Generates a number between  5 and 10.
 * @function
 * @param {*} seed
 * @category ExpressionLibrary
 */
function alea(seed) {

    function Mash() {
      var n = 0xefc8249d;
    
      var mash = function (data) {
        data = String(data);
        for (var i = 0; i < data.length; i++) {
          n += data.charCodeAt(i);
          var h = 0.02519603282416938 * n;
          n = h >>> 0;
          h -= n;
          h *= n;
          n = h >>> 0;
          h -= n;
          n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
      };
    
      return mash;
    }
  
      function Alea(seed) {
      var me = this, mash = Mash();
    
      me.next = function (minVal, maxVal) {
          if (typeof minVal === 'undefined') minVal = 0;
          if (typeof maxVal === 'undefined') maxVal = 1;
        var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
        me.s0 = me.s1;
        me.s1 = me.s2;
        var r = me.s2 = t - (me.c = t | 0);
          return r * (maxVal - minVal) + minVal;
      };
    
      // Apply the seeding algorithm from Baagoe.
      me.c = 1;
      me.s0 = mash(' ');
      me.s1 = mash(' ');
      me.s2 = mash(' ');
      me.s0 -= mash(seed);
      if (me.s0 < 0) { me.s0 += 1; }
      me.s1 -= mash(seed);
      if (me.s1 < 0) { me.s1 += 1; }
      me.s2 -= mash(seed);
      if (me.s2 < 0) { me.s2 += 1; }
      mash = null;
    }
  
    var xg = new Alea(seed);
  
    return xg.next;
}