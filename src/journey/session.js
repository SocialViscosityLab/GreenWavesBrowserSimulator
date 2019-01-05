/**
* A session is an instance of a cyclist running on a Journey.
* @param {string} id The user id session identifier
*/
class Session{
	constructor(id){
		this.id_user = id;
		this.dataPoints = [];
		this.startTime = new Date();
	}

	/**
	* The observer notify() function. Instances of this class observe an instance of Cyclist class
	*/
	notify(data){
		// add the datapoint
		this.dataPoints.push(data);
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
				console.log("Session completed for vehicle: " , this.id_user);
			}
		}
		return tmpDataP;
	}
	*/

	/**
	* Static class. Sets all the datapoints on a route based on a given speed and sampleRate. If the route is a loop
	it add points to the segment bewteen the last and the fisrt corner point
	* @param {Route} route The route on which the session runs
	* @param {number} speed The speed at the moment of joining the journey in meters per second
	* @param {number} sampleRate Integer number in seconds
	* @return {Array} a collection of datapoints
	*/
	static setSessionPoints (route, speed, sampleRate){

		let lastTimeStamp;

		let dataPoints = [];

		for (var i = 0; i < route.routePoints.length-1; i++) {

			let startCoords = new Position(route.routePoints[i].lat, route.routePoints[i].lon);

			let endCoords = new Position(route.routePoints[i+1].lat, route.routePoints[i+1].lon);


			if (dataPoints.length > 0 ){

				lastTimeStamp = dataPoints[dataPoints.length-1].time + +sampleRate;

			} else {

				// timeStamp of first corner point
				lastTimeStamp = 0;
			}

			// add cornerPoint
			let tmpDataPoints =  GeometryUtils.calculateStepsBetweenPositions(startCoords, endCoords, speed, sampleRate, lastTimeStamp);

			dataPoints.push.apply(dataPoints,tmpDataPoints);

		}

		if (route.loop){

			let startCoords = new Position(route.routePoints[route.routePoints.length-1].lat, route.routePoints[route.routePoints.length-1].lon);

			let endCoords = new Position(route.routePoints[0].lat, route.routePoints[0].lon);

			lastTimeStamp = dataPoints[dataPoints.length-1].time + +sampleRate;

			// Using utils/geometryUtils.js
			let tmpDataPoints =  GeometryUtils.calculateStepsBetweenPositions(startCoords, endCoords, speed, sampleRate, lastTimeStamp);

			dataPoints.push.apply(dataPoints,tmpDataPoints);

			// add last position point
			lastTimeStamp = dataPoints[dataPoints.length-1].time + +sampleRate;

			let tmpDP = new DataPoint(0, endCoords, speed, lastTimeStamp);

			dataPoints.push(tmpDP);
		}

		console.log(dataPoints.length+ " dataPoints created session");

		return dataPoints;
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
	*If you multiply the number of ticks by the sampleRate, tyen you get the latest datapoints for that period of time
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
