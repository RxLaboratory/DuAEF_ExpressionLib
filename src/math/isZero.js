/**
    * Checks if the value is 0; works with arrays.
    * @function
    * @param {Number|Number[]} x The value(s)
    * @return {Boolean} true if all values are 0.
    * @category ExpressionLibrary
    */
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