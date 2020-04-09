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