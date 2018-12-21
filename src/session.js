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
		this.timeCounter = 0;
	}

	/**
	* Sets the origin of a route
	* @ param {Route} route The route on which the session runs
	* @ param {Position} position The origin location
	* @ param {number} speed The speed at the moment of joining the journey in meters per second
	* @ param {number} ellapsedTime The route time at which the origin is set. This time is counted based on the Ghost's timeCounter.
	*/
	setOrigin(route, position, speed, ellapsedTime){

		// if the current position is at the start point of the route:
		if (position != undefined){

			if (this.validateSubscription(route, position)){

				let tmp;

				// if the current position is at the start point of the route:
				if (this.id_user == 0){//} && getDistance(route.routePoints[0], position) < 5 ){ // 5 meters
					// create a dataPoint
					tmp = new DataPoint(0, route.routePoints[0], speed, 0);

				}else {

					// calculate acceleration
					let acc = "SessionError"; //calculateAcceleration (speed, this.dataPoints[this.dataPoints.length -1].speed, ellapsedTime - this.dataPoints[this.dataPoints.length -1].time);

					// create a dataPoint
					tmp = new DataPoint(acc, position, speed, ellapsedTime);
				}
				// add the datapoint
				this.dataPoints.push(tmp);
			}
		}
	}

	/**
	* Runs the cyclists session on the given parameters
	* @param {Route} route The route on which the session runs
	* @param {number} speed The speed in meters per second
	* @param {number} sampleRate The sample rate in seconds
	*/
	runSession (route, speed, sampleRate){
		let timeOnRoute = sampleRate * this.timeCounter;
		let tmpPosition = route.calculatePositionOnRoute (speed, timeOnRoute, this.dataPoints[0].position); // startPosiiotn ignored by now, Everyone starts at the route origin
		let tmpDataP= new DataPoint(1000, tmpPosition, speed, timeOnRoute);
		this.dataPoints.push(tmpDataP);//acc, pos, speed, time
		this.timeCounter ++; // increases in one unit every sampleRate
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
* Exports the session path in GeoJSON format TO BE IMPLEMENTED
*/
	saveRouteGeoJSON (){
		console.log("SEE INSTRUCTIONS AT: https://eligrey.com/demos/FileSaver.js/");
	}
}
