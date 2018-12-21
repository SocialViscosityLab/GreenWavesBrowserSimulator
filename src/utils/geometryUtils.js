/**
Abstract utility class with Geometry methods
*/
class GeometryUtils{
  constructor(){
  }

/**
*/
  static calculateStepsBetweenPositions(startCoords, endCoords, speed, sampleRate, lastTimeStamp){
    let rtn = [];
    // 0 add the corner point
    let tempDataPoint = new DataPoint(0, startCoords, speed, lastTimeStamp);
    rtn.push(tempDataPoint);
    // 1 calculate the distance between the startCoords and endCoords. The distance is calculated in meters.
    let distAtoB = this.getDistance(startCoords, endCoords);
    // 2 estimate the duration to get from startCoords to endCoords at the given speed
    let duration = distAtoB / speed;
    // 3 generate as many positions as numbers of samples using as ellapsedTime the agregation of time units
    let count = 1;

    while(duration > sampleRate){

      let tempPos = this.calculateCurrentPosition(startCoords, endCoords, speed, sampleRate * count);

      let timeStamp = sampleRate * count;

      if (lastTimeStamp != undefined){

        timeStamp = timeStamp + lastTimeStamp;
      }

      tempDataPoint = new DataPoint(0, tempPos, speed, timeStamp);
      // 4 store the positions in a collection
      rtn.push(tempDataPoint);

      duration -= sampleRate;

      count ++;
    }

    return rtn;
  }

/**
*/
  static calculateCurrentPosition(startCoords, endCoords, speed, ellapsedTime) {

    let distance = this.getDistance(startCoords, endCoords); //

    let fraction = this.getTrajectoryFraction(ellapsedTime, speed, distance);

    return this.getIntermediatePoint(startCoords, endCoords, fraction);
  }

/**
Gets the geodesic distance between two points
@param {Position} startCoords
@param {Position} endCoords
@return {number} The distance between the two points in meters
*/
  static getDistance(startCoords, endCoords){
    //Distance code taken from: https://www.movable-type.co.uk/scripts/latlong.html

    let lat1 = startCoords.lat;
    let lon1 = startCoords.lon;
    let lat2 = endCoords.lat;
    let lon2 = endCoords.lon;

    let R = 6371e3; // meters

    //Converting latitud and longitude to radians
    //let fi1 = Math.sin((lat1 * Math.PI) / 180);
    //let fi2 = Math.sin((lat2 * Math.PI) / 180);

    let fi1 = (lat1 * Math.PI) / 180;
    let fi2 = (lat2 * Math.PI) / 180;

    let deltaFi = Math.sin((lat2-lat1) * Math.PI / 180);
    let deltaLambda = Math.sin((lon2-lon1)*Math.PI / 180);

    let a = Math.sin(deltaFi/2) * Math.sin(deltaFi/2) + Math.cos(fi1) * Math.cos(fi2) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    let d = R * c;

    return Number(d)
  }

/**
Gets the point between two coordinates at a given fraction of the straight trajectory
@param {Position} startCoords
@param {Position} endCoords
@param {number} fraction A value between 0 and 1
@return {Position} A point between the two source points
*/
  static getIntermediatePoint(startCoords, endCoords, fraction){

    let lat1 = startCoords.getLatRad();
    let lon1 = startCoords.getLonRad();
    let lat2 = endCoords.getLatRad();
    let lon2 = endCoords.getLonRad();

    let R = 6371e3; // metres

    let d = this.getDistance(startCoords, endCoords) / R;

    let a = Math.sin((1-fraction) * d)/ Math.sin(d);

    let b = Math.sin(fraction * d) / Math.sin(d);

    let myX = a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2);

    let myY = a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2);

    let myZ = a * Math.sin(lat1) + b * Math.sin(lat2);

    let coords = new Position(Math.atan2(myZ, Math.sqrt(Math.pow(myX,2) +Math.pow(myY,2))),Math.atan2(myY, myX));

    coords.convertRadToCoords();

    return coords;
  }

  /**
  Gets the percentage of traveled distance for a given time and speed
  @param {number} ellapsedTime
  @param {number} speed
  @param {number} totalDistance
  @return {number} a value greater than 0. If it is greater than 1 it means that the traveled distance
  is gerater that the distance to be traveled

  */
  static getTrajectoryFraction(ellapsedTime, speed, totalDistance){

    return (speed * ellapsedTime) / totalDistance;

  }

  /*
  Private function to be used by dist2()
  src: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
  */
  static sqr(x) {
    return x * x
  }

  /*
  Private function to be used by distToSegmentSquared()
  src: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
  */
  static dist2(v, w) {
    return this.sqr(v.lon - w.lon) + this.sqr(v.lat - w.lat)
  }

  /**
  Private function to be used by euclideanDistToSegment()
  src: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment*/
  static distToSegmentSquared(p, v, w) {

    var l2 = this.dist2(v, w);

    if (l2 == 0) return this.dist2(p, v);

    var t = ((p.lon - v.lon) * (w.lon - v.lon) + (p.lat - v.lat) * (w.lat - v.lat)) / l2;

    t = Math.max(0, Math.min(1, t));

    return this.dist2(p, { lon: v.lon + t * (w.lon - v.lon), lat: v.lat + t * (w.lat - v.lat) });
  }

  /**
  Calculates the euclidean distance of a position to a segment
  src: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
  @param {Position} p The position
  @param {Position} v Segment origin
  @param {Position} w Segment end
  @return {number} The closest distance
  */
  static euclideanDistToSegment(p, v, w) {
    // console.log ("p ");
    // console.log (p);
    // console.log ("v ");
    // console.log (v);
    // console.log ("w ");
    // console.log (w);
    return Math.sqrt(this.distToSegmentSquared(p, v, w));
  }


}
