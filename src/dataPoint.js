/**
* A unit of spatio-temporal location used to store the positions of cyclists in each session. For analysis purposes it also includes the current aceleration and speed
* @param {number} acc Acceleration at the moment of datapoint creation in relation to another datapoint
* @param {number} pos Current position
* @param {number} speed The current speed
* @param {number} time The relative time elapsed since the beginning of the session to which the datapoint belongs.
*/
class DataPoint{
  constructor(acc, pos, speed, time){
    this.acceleration = acc;
    this.position = pos;
    this.speed = speed;
    this.time = time;
    // suggestion: computed locally by the cyclists mobile phone. It requires the leader's (ghost) positions to do such computation.
    this.suggestion;
    // The coordiantes are geodesic is they are expressed in latitute and longitude. Else are polar if they are expressed in radians.
    this.positionFormat = "geodesic";
  }

/**
* Returns the current latitude in radians
*/
  getLatRad(){
    return (this.position.lat * Math.PI) / 180;
  }

  /**
  * Returns the current longitude in radians
  */
  getLonRad(){
    return (this.position.lon * Math.PI) / 180;
  }

  /**
  * Converts the current position from radians to cartesian lat lng
  */
  convertRadToCoords(){
    this.position.lat = (this.position.lat * 180)/Math.PI;
    this.position.lon = (this.position.lon * 180)/Math.PI;
    this.positionFormat = "radians";
  }
}
