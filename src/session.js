/**
* A session is an instance of a cyclist running on a Journey.
* @param {string} id The user id session identifier
* @param {number} startTime The start time of the session which corresponds to the moment
* the cyclist joins the journey. It is equivalent to the ghost's server time).
*/
class Session{
	constructor(id, startTime){
		this.id_user = id;
		this.dataPoints = [];
		this.startTime = startTime;
		// increments in 1 by each time tick
		this.timeCounter = 0;
		// this means that the session is running. If changed it stops the runStep() function.
		this.status = "running";
	}

	/**
	* Sets the origin of a session. The origin is the starting position of the session on a route.
	* @ param {Route} route The route on which the session runs
	* @ param {Position} position The origin location
	* @ param {number} speed The speed at the moment of joining the journey in meters per second
	* @ param {number} ellapsedTime The route time at which the origin is set. This time is counted based on the global (Journey) timeCounter.
	*/
	setOrigin(route, position, speed, ellapsedTime){

		// if the current position is at the start point of the route:
		if (position != undefined){

			if (this.validateSubscription(route, position)){

				let tmp;

				// calculate acceleration
				let acc = "SessionError"; //calculateAcceleration (speed, this.dataPoints[this.dataPoints.length -1].speed, ellapsedTime - this.dataPoints[this.dataPoints.length -1].time);

				// create a dataPoint
				tmp = new DataPoint(acc, position, speed, ellapsedTime);

				// add the datapoint
				this.dataPoints.push(tmp);
			}
		}
	}

	/**
	*The concept here is to calculate where a vehicle will be located after running at a given speed for a given time.
	The process is as follows:
	1- Determine the current position on a route. That is retrieved from the latest recorded dataPoint
	2- Calculate the distance traveled based on speed and step time
	3- Locate the corresponding position on the route for the distance traveled. For this step of the process
	we need to ask the route where on the path is located the traveled distance.
	@param {Route} route The route
	@param {Number} speed Travelling speed in m/s
	@param {Number} travelTime Time ahead from the current time in seconds
	@return {Position} the latest estimated position
	*/
	runStep(route, speed, travelTime){
		let tmpDataP;
		if (this.status == "running"){
			//1- Determine the current position on a route. That is retrieved from the latest recorded dataPoint
			let currentPosition = this.dataPoints[this.dataPoints.length-1].position;
			//2- Calculate the distance traveled based on speed and step time
			let distanceTraveled = speed * travelTime;
			//3- Locate the corresponding position on the route for the distance traveled
			let tmpPosition = route.getPosition(currentPosition, distanceTraveled);

			if (tmpPosition instanceof Position){
				//  create the new dataPoint
				let lastTime = this.dataPoints[this.dataPoints.length-1].time;

				tmpDataP = new DataPoint(1000, tmpPosition, speed, Number(lastTime) + Number(travelTime) );// Number(lastTime) + Number(travelTime)

				this.dataPoints.push(tmpDataP);

				this.timeCounter ++;

			} else {
				this.status = "completed";
				console.log("Session completed for vehicle: " + this.id_user);
			}
		}
		return tmpDataP;
	}


	/**
	* returns true if the any point of the route is whithin the subscritpionRange radius from the currentLocation.
	* The subscription range radius is a property of the route
	* @param {Route} route The route on which the session runs
	* @param {Position} currentLocation The location to be validated
	*/
	validateSubscription (route, currentLocation){

		return true; // rewrite this function

	}

	/**
	* Sets all the datapoints on a route based on a given speed and sampleRate. If the route is a loop
	it add points to the segment bewteen the last and the fisrt corner point
	* @param {Route} route The route on which the session runs
	* @param {number} speed The speed at the moment of joining the journey in meters per second
	* @param {number} sampleRate Integer number in seconds
	*/
	setSessionPoints (route, speed, sampleRate){

		let lastTimeStamp;

		for (var i = 0; i < route.routePoints.length-1; i++) {

			let startCoords = new Position(route.routePoints[i].lat, route.routePoints[i].lon);

			let endCoords = new Position(route.routePoints[i+1].lat, route.routePoints[i+1].lon);


			if (this.dataPoints.length > 0 ){

				lastTimeStamp = this.dataPoints[this.dataPoints.length-1].time + +sampleRate;

			} else {

				// timeStamp of first corner point
				lastTimeStamp = 0;
			}

			// add cornerPoint
			let tmpDataPoints =  GeometryUtils.calculateStepsBetweenPositions(startCoords, endCoords, speed, sampleRate, lastTimeStamp);

			this.dataPoints.push.apply(this.dataPoints,tmpDataPoints);

		}

		if (route.loop){

			let startCoords = new Position(route.routePoints[route.routePoints.length-1].lat, route.routePoints[route.routePoints.length-1].lon);

			let endCoords = new Position(route.routePoints[0].lat, route.routePoints[0].lon);

			lastTimeStamp = this.dataPoints[this.dataPoints.length-1].time + +sampleRate;

			// Using utils/geometryUtils.js
			let tmpDataPoints =  GeometryUtils.calculateStepsBetweenPositions(startCoords, endCoords, speed, sampleRate, lastTimeStamp);

			this.dataPoints.push.apply(this.dataPoints,tmpDataPoints);

			// add last position point
			lastTimeStamp = this.dataPoints[this.dataPoints.length-1].time + +sampleRate;

			let tmpDP = new DataPoint(0, endCoords, speed, lastTimeStamp);

			this.dataPoints.push(tmpDP);
		}

		console.log(this.dataPoints.length+ " dataPoints created in session " + this.id_user);
	}

	/**
	* Returns a collection of lat,lon pairs of the current route
	* @return {Object} A collection of the  lat,lng pairs of all datapoints in this session
	*/
	getSessionLatLongs(){
		var rtn = [];

		for (let dp of this.dataPoints) {

			rtn.push([dp.position.lat, dp.position.lon]);

		}
		return rtn;
	}

	/**
	*Returns a collection of the latest datapoints of this session. The number of datapoints is defined by the parameter 'ticks'.
	*If you multipluy tge number of ticks by the sampleRate, tyen you get the latest datapoints for that period of time
	*@param {Number} ticks the number of latest positions to be retrieved from the datapoints collection
	*@return collection of dataPoints
	*/
	getLatestDataPoints(ticks){

		if (ticks > this.dataPoints.length){

			return this.dataPoints;

		}else{

			return this.dataPoints.slice(this.dataPoints.length - ticks, this.dataPoints.length);
		}
	}

	/**
	* Exports the session path in GeoJSON format TO BE IMPLEMENTED
	*/
	saveRouteGeoJSON (){
		console.log("SEE INSTRUCTIONS AT: https://eligrey.com/demos/FileSaver.js/");
	}
}
