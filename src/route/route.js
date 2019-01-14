/**
*A route is a collection of corner points defined as instances of the Position class. The collection describes a trajectory
that could be a closed loop. By default routes are not loops. The route is labeled with an ID. If the route is active, then
is can be used by the journey and its sessions.

The distance operations on the route are based on its segments. A segment is a portion of the route defined by two route points,
often named as cornerPoints.

There are two types of distances on a route: absolute and relative-to-segment. To calculate an absolute distance, the process
followed is to accumulate relative-to-segment distances sequentially up to the end position of the distance. A central part of the process
is to determine on which route segment falls the endpoint of the distance to be calculated. This class offers several methods for
segment index calculation, as well as relative and absolute distance calculations.

* @param {string} id The route name
*/
class Route {
	constructor(id){
		/** The route ID. Ideally it should be labeled with the name of the roads on which the route runs */
		this.id = id;
		/** The corner points of the route */
		this.routePoints = [];
		/** True is the route is active */
		this.status = false;
		/** The segments of the route*/
		this.segments = [];
		/** loop means that the route is a loop and the last corner-point connects with the first corner-point*/
		this.loop = false;
	}

	/******* SETTERS ********
	/**
	Set to true if the route is a loop
	@param {boolean} bool True if the route is a loop
	*/
	setLoop(bool){
		this.loop = bool;
	}

	enable(){
		this.status = true;
	}

	disable(){
		this.status = false;
	}

	update(){
		this.makeSegments();
		console.log("Route updated.  Route points: " + this.routePoints.length + ", segments: " + this.segments.length +  ", loop: " + this.loop);
	}

	/********* GETTERS *********/

	/**
	* Calculates the position on route for a traveled distance starting from a given position.
	Process: to DETERMINE TRAVELED DISTANCE the idea is to get the distance to the current point and then add the step distance
	* @param {Number} stepLength The distance traveled for the duration of a sample rate at a given speed. It is defined in meters.
	* @param {Position} position The insertion position on the route
	*/
	getPosition (position, stepLength){
		// Validate if the position is on the route path
		if (this.validatePosition(position)){
			// get the index of the closest segment to position
			let index = this.getIndexAndProximityToClosestSegmentTo(position).index;
			//console.log("index: " + index);
			// retrieve the segemnt for that index
			let currentSegment = this.segments[index];
			// The traveled distance on the segment
			let distanceOnSegment = Number(currentSegment.getDistanceOnSegment(position));
			//console.log("distance on segment: " + distanceOnSegment);
			// The distance on segment plus the step distance
			let accumDistanceOnSegment = distanceOnSegment + stepLength;
			//console.log("accumulated distance segment: " + accumDistanceOnSegment);
			// Validate is the distance on segment falls within the boundaries of this segment
			if (accumDistanceOnSegment < currentSegment.length){
				// if yes.. get and return the NEW POSITION
				return currentSegment.getIntermediatePointFromDistance(accumDistanceOnSegment);

			} else {
				// console.log("-- NEXT SEGMENT ");
				// Validate that traveled distance is less or equal to route's length
				if (this.stillOnRoute(position,stepLength)){
					//console.log ("Still on route... ");
					// Recalculate accumulated distance on the next segment
					let remainingDistForNextSegment = accumDistanceOnSegment - currentSegment.length;
					//console.log("remaining distance for next segment: "+ remainingDistForNextSegment);
					// retrieve the next segment
					index = index + 1;
					// if the index is greater than the number of segments
					if (index >= this.segments.length){
						// reset index if this route is a loop
						if (this.loop){
							index = 0;
						} else {
							// Route completed
							// console.log("WARNING!!! Route completed");
							return this.segments[this.segments.length-1].end;
						}

					}
					// retrieve current segment
					currentSegment = this.segments[index];
					// console.log("next index: " + (index));
					// return the NEW POSITION
					return currentSegment.getIntermediatePointFromDistance(remainingDistForNextSegment);

				} else {
					// Route completed
					console.log("WARNING!!! Route completed");
					return this.segments[this.segments.length-1].end;
				}
			}

		} else {

			//console.log("WARNING!!! Route completed or position off route");

			return "completed";
		}
	}

	/**
	* Determines wether a traveled distance to a position + 1 step is shorter or equal to the route length
	@param {Position} position The position near to any of the route segments. A valid proximity is evaluated by the getTraveledDistanceToSegmentStart() function.
	@param {Number} stepLength the step length in meters
	@return true if still on route, else false.
	*/
	stillOnRoute(position, stepLength){
		// If the route is not a loop do the following, else the position will be on the route
		if (!this.loop){
			// The traveled distance to the segment start
			let distanceToCorner = Number(this.getTraveledDistanceToSegmentStart(position));
			//console.log("distance to corner: " + distanceToCorner);
			// accumulated traveled distance
			let traveledDistance = distanceToCorner + stepLength;
			// console.log("stepLength: ", stepLength,", traveled distance: " + traveledDistance);
			// evalute the distance traveled against the route length
			if (traveledDistance <= this.getTotalLength()){
				// still on route
				return true;
			}else{
				// off route
				return false;
			}
		} else {
			// on route because it is a loop
			return true;
		}
	}

	/**
	Gets the distance on route traveled from the route origin to a position on a route.
	CAVEAT: This method assumes that the position is very close to the route path.
	@param {Position} position The position in space
	@return {number} distance traveled in meters
	*/
	getTraveledDistanceToSegmentStart(position){
		if (position instanceof Position){
			// Detect the closest route segment
			let segmentIndex = this.getIndexAndProximityToClosestSegmentTo(position);
			// console.log("segmentIndex "+ segmentIndex);
			// Calculate the distance from origin to begining of segment
			let distanceTraveled = 0;

			for (var i = 0; i < segmentIndex; i++) {

				distanceTraveled += Number(this.segments[i].length);
			}

			return Number.parseFloat(distanceTraveled);

		}else{
			console.log("Parameter position is not an instance of Position")
		}
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

	/**
	* Calculates the accumulated distance of all the segment length in a route
	*/
	getTotalLength(){

		let totalLength = 0;

		for (let leg of this.segments) {

			totalLength = totalLength + Number(leg.length);
		}

		return totalLength;
	}

	/**
	Find the closest segment index to a position
	@param {Position} position The position in space
	@return {Object} {index,proximity} to the closest segment of this route
	*/
	getIndexAndProximityToClosestSegmentTo(position){
		if (position instanceof Position){
			// get all segments
			// store the distance to the first segment
			let currentD = GeometryUtils.distToSegment(position,this.segments[0].start,this.segments[0].end);
			//console.log("current "+ currentD);
			// set return value
			let rtn = 0;
			// Go over all other the segments
			for (var i = 1; i < this.segments.length; i++) {
				// Calculate the distance to each one of them
				let nextD = GeometryUtils.distToSegment(position,this.segments[i].start,this.segments[i].end);
				// console.log("segment id "+ i + ", of " +(this.segments.length-1));
				// console.log("currentD "+ currentD);
				// console.log("nextD "+ nextD);
				// console.log(currentD > nextD);
				// Store the segment position of the shortest distances
				if (currentD > nextD){
					currentD = nextD;
					rtn = i;
				}
			}
			// Return the id of the closest segment
			return {index:rtn, proximity:currentD};
		}else{
			console.log("The parameter entered to this function is not an instance of Position")
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

		// if the vehicle is on a route segment different than the first one
		if (segmentIndex > 0){

			for (let i = 0; i < segmentIndex; i++){

				accumulatedDistance += Number(this.segments[i].length);
			}
		}
		// console.log("accum dist: " + accumulatedDistance);
		// the time needed to arrive to the initial corner point of the current segment
		let timeToSegment = accumulatedDistance/Number(speed);

		let rtn = timeOnRoute - timeToSegment;

		if (rtn < 0){
			console.log("ERROR: negative time")
			return 0;
		}else{
			return rtn;
		}
	}

	/**
	* Determines in which route segment falls a given travelled distance.
	* @param {number} traveledDistance The distance traveled from the route origin
	* @param {number} index The reference segment. IMPORTANT Use 0 by default because this is an iterative function starting with the first position of a collection of segments
	* @returns {Object} The first value is the route segment, the second value is the distance from the first segment's position point
	*/
	determineSegmentForTraveledDistance(traveledDistance, index){

		let result;
		if (index < this.segments.length){
			// the difference between the traveled distance from the session origin and the route segment distance
			let delta = traveledDistance - Number(this.segments[index].length);
			//console.log( "traveledDistance: " + traveledDistance +", delta: " + delta + ", route distances: " + this.segments[index].length + ", index: " + index);

			if (delta > 0){
				// Go for the next segment
				index = index + 1;
				result = this.determineSegmentForTraveledDistance(delta, index);

			} else if (delta <= 0){
				// stay in this segment
				let remainingDistance =  Number(this.segments[index].length) + delta;

				result = {index,remainingDistance};

				console.log("index: " + index + " | Remaining distance: " + remainingDistance);

				return result;
			}
			//	console.log (result);
			return result;
		} else {
			console.log("ERROR! Index parameter larger than segments array");
			return undefined;
		}
	}

	/******** PRIVATE ********

	/**
	* Creates the list of corner points in a route from the values input in the GUI
	* @param {number} totalRoutePoints
	*/
	initiateRouteFromGeoJSON(object){
		let positions = object.geometry.coordinates;
		this.id = object.properties.name;
		// iterate over the objects
		for (var i = 0; i < positions.length; i++) {
		// create the positions
			let tmpPos = new Position(Number(positions[i][0]), Number(positions[i][1]));
			// add them to the collection
			this.routePoints.push(tmpPos);
		}
		// create the segments
		this.segments =  this.makeSegments();
		// message
		console.log("Route " + this.id + " initialized.  Route points: " + this.routePoints.length + ", segments: " + this.segments.length +  ", loop: " + this.loop);
	}


	/**
	* Creates the list of corner points in a route from the values input in the GUI
	* @param {number} totalRoutePoints
	*/
	initiateRoutePoints(points){

		if(points){
			this.routePoints = [];

			for (let i = 0; i < points.length; i++) {
				let pos = points[i];
				let tmpPos = new Position(Number(pos[0]), Number(pos[1]));
				this.routePoints.push(tmpPos);
			}
		}

		this.segments =  this.makeSegments();

		console.log("Route initialized.  Route points: " + this.routePoints.length + ", segments: " + this.segments.length +  ", loop: " + this.loop);
	}

	/**
	* Returns true if the given position is not the end of the route.
	* @param {Position} position The position to be validated
	*/
	validatePosition (position){
		let distance = GeometryUtils.getDistance(position, this.segments[this.segments.length-1].end);
		if (this.loop){
			return true;
		} else{
			return (distance != 0 ? true : false);
		}
	}

	/**
	* Private Makes segments out of routePoints
	*/
	makeSegments(){

		let segments = [];

		for (var i = 0; i < this.routePoints.length - 1; i++) {

			segments.push(new Segment(this.routePoints[i],this.routePoints[i+1]));

		}
		if (this.loop){

			segments.push(new Segment(this.routePoints[this.routePoints.length-1],this.routePoints[0]));

		}
		// Show segements on console
		// for (let s of segments) {
		// 	console.log("segment length: " + s.length);
		// }

		return segments;
	}

	/**
	* Retreves the segment at a given index
	@param {Number} index The index less than the segment array length
	*/
	getSegment(index){

		if (index < this.segments.length -1){

			return segments[index];
		}
	}

	getAccDistanceUpToSegment(index){
		let rtn = 0;
		for (var i = 0; i <= index; i++) {
			rtn += Number(this.segments[i].length);
		}
		return rtn;
	}

	getPositionPoints(){
		let positionPoints = [ ]
		for (let i = 0; i < this.routePoints.length; i++) {
			positionPoints.push(this.routePoints[i].getPositionDoc());
		}
		return positionPoints;
	}
}
