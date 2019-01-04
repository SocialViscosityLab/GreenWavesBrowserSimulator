/**
* A session is an instance of a cyclist running on a Journey.
* @param {string} id The user id session identifier
* @param {number} startTime The start time of the session which corresponds to the moment
* the cyclist joins the journey. It is equivalent to the ghost's server time).
*/
class Session{
	constructor(cyclist){
		this.id_user = cyclist.id;
		this.cyclist = cyclist;
		this.dataPoints = [];
		this.startTime = new Date();
		// increments in 1 by each time tick
		this.timeCounter = 0;
		// The first datapoint of this session
		this.setCyclist();
		// this means that the session is running. If changed it stops the runStep() function.
		this.status = "running";
	}

	/**
	* Private Sets the origin of a session defined by the location at which a cyclist joins the journey. The origin is the starting position of the session on a route.
	* @ param {number} ellapsedTime The route time at which the origin is set. This time is counted based on the global (Journey) timeCounter.
	*/
	setCyclist(){
		// create a dataPoint
		let tmp = new DataPoint(0, this.cyclist.position, this.cyclist.speed, this.timeCounter);
		// add the datapoint
		this.dataPoints.push(tmp);
		this.timeCounter ++;
}

	/**
	*The concept here is to calculate where a vehicle will be located after running at a given speed for a given time.
	The process is as follows:
	1- Determine the current position on a route. That is retrieved from the latest recorded dataPoint or the ciclysts position
	2- Calculate the distance traveled based on speed and step time
	3- Locate the corresponding position on the route for the distance traveled. For this step of the process
	we need to ask the route where on the path is located the traveled distance.
	@param {Route} route The route
	@param {Number} frameRate Time glogal frameRate. It is also the time ahead from the current time in seconds
	@return {Position} the latest estimated position
	*/
	runStep(route, frameRate){
		let tmpDataP;
		if (this.status == "running"){
			//1- Determine the current position on a route. That is retrieved from the latest recorded dataPoint
			let currentPosition = this.cyclist.position; //this.dataPoints[this.dataPoints.length-1].position;
			//2- Calculate the distance traveled based on speed and step time
			let distanceTraveled = this.cyclist.mySpeed * frameRate;
			//3- Locate the corresponding position on the route for the distance traveled
			let tmpPosition = route.getPosition(currentPosition, distanceTraveled);

			this.cyclist.position = tmpPosition;

			if (tmpPosition instanceof Position){
				//  create the new dataPoint
				tmpDataP = new DataPoint(this.cyclist.myAcceleration, tmpPosition, this.cyclist.speed, this.timeCounter + frameRate);

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
	* Sets all the datapoints on a route based on a given speed and sampleRate. If the route is a loop
	it add points to the segment bewteen the last and the fisrt corner point
	* @param {Route} route The route on which the session runs
	* @param {number} speed The speed at the moment of joining the journey in meters per second
	* @param {number} sampleRate Integer number in seconds
	*/
	setSessionPoints (route, sampleRate){

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
			let tmpDataPoints =  GeometryUtils.calculateStepsBetweenPositions(startCoords, endCoords, this.cyclist.speed, sampleRate, lastTimeStamp);

			this.dataPoints.push.apply(this.dataPoints,tmpDataPoints);

		}

		if (route.loop){

			let startCoords = new Position(route.routePoints[route.routePoints.length-1].lat, route.routePoints[route.routePoints.length-1].lon);

			let endCoords = new Position(route.routePoints[0].lat, route.routePoints[0].lon);

			lastTimeStamp = this.dataPoints[this.dataPoints.length-1].time + +sampleRate;

			// Using utils/geometryUtils.js
			let tmpDataPoints =  GeometryUtils.calculateStepsBetweenPositions(startCoords, endCoords, this.cyclist.speed, sampleRate, lastTimeStamp);

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
