/**
*A route is a collection of corner points defined as instances of the Position class. The collection describes a trajectory
that could be a closed loop. By default routes are not loops. The route is labeled with an ID. If the route is active, then
is can be used by the journey and its sessions.
* @param {string} id The route name
*/
class Route {
	constructor(id){
		this.id = id;
		this.routePoints = [];
		this.status = false;
		/** The distances between each segment of the route*/
		this.routeDistances = [];
		/** loop means that the route is a loop and the last corner-point connects with the first corner-point*/
		this.loop = false;
	}

	/**
	Set to true if the route is a loop
	@param {boolean} bool True if the route is a loop
	*/
	setLoop(bool){
		this.loop = bool;
	}

	/**
	* Creates the list of corner points in a route from the values input in the GUI
	* @param {number} totalRoutePoints
	*/
	initiateRoutePoints(totalRoutePoints){
		this.routePoints = [];
		for (var i = 0; i < totalRoutePoints; i++) {
			let idLat = 'coordPointLat' + i;
			let idLon = 'coordPointLon' + i;
			let tmpLat = document.getElementById(idLat);
			let tmpLon = document.getElementById(idLon);
			let tmpPos = new Position(tmpLat.value, tmpLon.value);
			this.routePoints.push(tmpPos);
		}

		console.log("Route/initialized " + this.routePoints.length + " route points");
	}

	/**
	* Returns a collection of lat,lon pairs of the current route
	*/
	getRouteLatLongs(){
		var rtn = [];
		for (let pos of this.routePoints) {
			rtn.push([pos.lat, pos.lon]);
		}
		if (this.loop){
			rtn.push([this.routePoints[0].lat, this.routePoints[0].lon]);
		}
		return rtn;
	}

	enable(){
		this.status = true;
	}

	disable(){
		this.status = false;
	}

	/**
	* Calculate distances between the corner points of a map
	*/
	calcDistances(){

		this.routeDistances = [];

		for (var i = 0; i < this.routePoints.length -1; i++) {

			let goalPosition = new Position(this.routePoints[i].lat, this.routePoints[i].lon);

			let currentPosition = new Position(this.routePoints[i+1].lat, this.routePoints[i+1].lon);

			this.routeDistances.push(GeometryUtils.getDistance(goalPosition, currentPosition).toPrecision(4));

		}

		if (this.loop){

			let goalPosition = new Position(this.routePoints[0].lat, this.routePoints[0].lon);

			let currentPosition = new Position(this.routePoints[this.routePoints.length-1].lat, this.routePoints[this.routePoints.length-1].lon);

			this.routeDistances.push(GeometryUtils.getDistance(goalPosition, currentPosition).toPrecision(4));
		}

		return this.routeDistances;

	}
	/**
	* Calculates the accumulated distance of all the segment distances in a route
	*/
	getTotalDistance(){

		this.calcDistances(this.loop);

		let totalDistance = 0;

		for (let leg of this.routeDistances) {

			totalDistance = totalDistance + +leg;
		}

		return totalDistance;
	}

	/**
	* Converts all segment distances to string
	*/
	distancesToString(){

		if (this.routeDistances != undefined){

			// From the last point to the origin
			let distancesConcat =   "Distance between route points:\n" +  this.routeDistances[0] + " m., ";

			for (var i = 1; i < this.routeDistances.length; i++) {
				distancesConcat = distancesConcat + this.routeDistances[i] + " m., ";
			}

			return (distancesConcat);

		}else{

			confirm("Calculate distances first");
		}
	}

	/**
	* Calculates the position on route after running for a specified time at a given speed.
	The starting point could be defined
	* @param {number} speed
	* @param {number} timeOnRoute
	* @param {position} startPosition WARNING THIS NEEDS TO BE IMPLEMENTED
	*/
	calculatePositionOnRoute (speed, timeOnRoute, startPosition){

		let traveledDistance = this.calculateTraveledDistanceFromOrigin(startPosition); // testing this

		let currentPos;

		if (this.loop){
			// calculate the time for one loop
			let timeForALoop = this.getTotalDistance()/speed;
			// determine if the timeOnRoute is enough for more than one loop
			if (timeOnRoute > timeForALoop){
				// Time on route is now the residual time on the current loop
				timeOnRoute = timeOnRoute % timeForALoop;
			}
		}
		// calculate the traveled distance based on the speed and time on route
		traveledDistance += (speed * timeOnRoute);
		// Check is the traveled distance is greater than the total route distance
		if (!this.loop &&  traveledDistance > this.getTotalDistance()){

			currentPos = new Position(this.routePoints[this.routePoints.length-1].lat, this.routePoints[this.routePoints.length-1].lon);

			console.log("route completed ");

			this.status = false;

			return currentPos;

		} else {
			// Calculate the remaining portion of the not traveled route
			let residualDistance = traveledDistance % this.getTotalDistance(this.loop);
			// Gets the current segment and the remaining distance
			let segment = this.determineSegmentForTraveledDistance(residualDistance,0);

			let startCoords = new Position(this.routePoints[segment.index].lat, this.routePoints[segment.index].lon);

			let endCoords;

			// This is useful when the route is a loop and the index is greater than the number of corner points
			if (segment.index+1 != this.routePoints.length){

				endCoords = new Position(this.routePoints[segment.index+1].lat, this.routePoints[segment.index+1].lon);

			} else  if (this.loop){

				endCoords = new Position(this.routePoints[0].lat, this.routePoints[0].lon);

			}

			/*"The issue here is that calculateCurrentPosition() takes relative start and end coords
			but the time is the session's absolute. It should be the time relative to the current segment,
			or pass the absolute origin, or passs the remaing distance");*/

			// Calculate the remaining portion of the time for the last segment
			let residualTime = this.determineResidualTime(speed, timeOnRoute, segment.index);

			currentPos = GeometryUtils.calculateCurrentPosition(startCoords, endCoords, speed, residualTime);

			return currentPos;
		}

	}

	/**
	* Calculate the remaining portion of the time for the last segment on which the session bicycle is running.
	It assumes a constant speed
	* @param {number} speed The running speed
	* @param {number} timeOnRoute For how long has the cyclists been on the route
	* @param {number} segmentIndex The route segment index
	*/
	determineResidualTime(speed, timeOnRoute, segmentIndex){
		// Calculate the ellapsed time from the route startPosition to the first segment's cornerPoint
		let accumulatedDistance = 0;

		speed = Number(speed);

		if (segmentIndex > 0){

			for (let i = 0; i < segmentIndex; i++){

				accumulatedDistance += Number(this.routeDistances[i]);
			}
		}

		let timeToSegment = accumulatedDistance/speed;

		return timeOnRoute - timeToSegment;

	}

	/**
	* Determines in which route segment falls a given travelled distance.
	* @param {number} traveledDistance The distance traveled from the route origin
	* @param {number} index The reference segment. Use 0 by default.
	* @returns {Object} The first value is the route segment, the second value is the distance from the first segement's position point
	*/
	determineSegmentForTraveledDistance(traveledDistance, index){

		let result;

		let delta = traveledDistance - Number(this.routeDistances[index]);

		if (delta > 0){
			// Go for the next segment
			index = index+1;
			result = this.determineSegmentForTraveledDistance(delta, index);

		} else if (delta <= 0){
			// stay in this segment
			let remainingDistance =  Number(this.routeDistances[index]) + delta;
			//console.log (index + " " + remainingDistance);
			result = {index,remainingDistance};

			return result;
		}

		return(result);
	}
	/**
	Gets the distace on route traveled to a position on a route.
	IMPORTANT: This method assumes that the position is very close to the route path.
	@param {Position} position The position in space
	@return {number} distance traveled in meters
	*/
	calculateTraveledDistanceFromOrigin(position){
		if (position instanceof Position){
			// Detect the closest route segment
			let segmentIndex = this.getClosestSegmentToPosition(position);
			// Calculate the distance from origin to begining of segment
			let distanceTraveled = 0;

			for (var i = 0; i < segmentIndex; i++) {

				distanceTraveled += this.routeDistances[i];
			}
			// get the segments
			let segments = this.getRouteLatLongs();
			// Add the distance between segment origin and position
			distanceTraveled += 0; //GeometryUtils.getDistance(segments[segmentIndex],position);
			//
			return distanceTraveled;
		}else{
			console.log("Parameter position is not an instance of Position")
		}
	}

	/**
	Find the closest segment index to a position
	@param {Position} position The position in space
	@return {number} Index of the segment origin in the routeDistances or getRouteLatLongs() collections
	*/
	getClosestSegmentToPosition(position){
		if (position instanceof Position){
			// get all segments
			let tmp = this.getRouteLatLongs();
			// store the distance to the first segment
			let currentD = GeometryUtils.euclideanDistToSegment(position,new Position(tmp[0][0],tmp[0][1]),new Position(tmp[1][0],tmp[1][1]));
			//console.log("current "+ currentD);
			// set return value
			let rtn = 0;
			// Go over all other the segments
			for (var i = 1; i < tmp.length-1; i++) {
				// Calculate the distance to each one of them
				let nextD = GeometryUtils.euclideanDistToSegment(position,new Position(tmp[i][0],tmp[i][1]),new Position(tmp[i+1][0],tmp[i+1][1]));
				//	console.log("next "+ nextD);
				//		console.log(currentD >= nextD);
				// Store the segment position of the shortest distances
				if (currentD >= nextD){
					rtn = i;
				}
			}
			// Return the id of the closest segment
			return rtn;
		}else{
			console.log("Parameter position is not an instance of Position")
		}
	}
}
