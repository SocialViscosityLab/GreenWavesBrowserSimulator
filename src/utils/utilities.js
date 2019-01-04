/**
* Convenient class with multy-purpose static functions
*/
class Utilities{
  constructor(){
  }

  /**
  * From Processing.org <br>
  * https://github.com/processing/processing/blob/master/core/src/processing/core/PApplet.java#L4844
  *
  * Re-maps a number from one range to another.
  * Numbers outside the range are not clamped to 0 and 1, because
  * out-of-range values are often intentional and useful.
  *
  * @param {Number} value the incoming value to be converted
  * @param {Number} start1 lower bound of the value's current range
  * @param {Number} stop1 upper bound of the value's current range
  * @param {Number} start2 lower bound of the value's target range
  * @param {Number} stop2 upper bound of the value's target range
  * @return {Number} The mapped value
  */
  static map(value, start1, stop1, start2, stop2){
    let outgoing = start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    let badness;
    if (outgoing != outgoing) {
      badness = "NaN (not a number)";
    } else if (outgoing == Number.NEGATIVE_INFINITY || outgoing == Number.POSITIVE_INFINITY) {
      badness = "infinity";
    }

    if (badness != undefined) {
      let msg = ("map(%s, %s, %s, %s, %s) called, which returns: " + badness);
      console.log (msg);
    }
    return outgoing;
  }
}
