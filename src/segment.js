/**
* Utility class used to make distance operations on a route
@param {Position} start The beginig of the segment
@param {Position} end The end of the segment
*/
class Segment{
  constructor(startPosition, endPosition){
    this.start = startPosition;
    this.end = endPosition;
    this.length = GeometryUtils.getDistance(this.start, this.end).toPrecision(4);
  }

  /**
  * Gets the point at a fraction of the distance between two points
  @param {Number} fraction A number between 0 and 1
  @return {Position} The position between the start and end of this segment
  */
  getIntermediatePoint(fraction){
    if (0 <= fraction && fraction <= 1){
      return GeometryUtils.getIntermediatePoint(this.start, this.end, fraction);
    }
  }


  /**
  * Gets the point based on a distance from the start point of a segment
  @param {Number} distance Distance in meters
  @return {Position} The position between the start and end of this segment
  */
  getIntermediatePointFromDistance(distance){
    // estimate the fraction
    let fraction = distance / this.length;

    if (fraction <= 1){
      return this.getIntermediatePoint(fraction);

    } else {

      console.log ("The distance given "+ distance + " is larger than this segment " + this.length + ". Undefined returned" );

      return undefined;
    }
  }

  /**
  Returns the distance from the segment start to the position
  @param {Position} The position between the start and end of this segment
  @return {Number} distance Distance in meters
  */
  getDistanceOnSegment(position){
    return GeometryUtils.getDistance(this.start, position).toPrecision(4);
  }


}
