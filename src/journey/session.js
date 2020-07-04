/**
 * A session is an instance of a cyclist running on a Journey.
 * @param {string} id The user id session identifier
 */
class Session {
    constructor(id, cyclistId) {
        this.id_session = {
            id: id,
            cyclistId: cyclistId
        }
        this.dataPoints = [];
        this.startTime = new Date();
    }

    /**
     * The observer notify() function. Instances of this class observe an instance of Cyclist class
     */
    notify(data) {
        // add the datapoint
        if (data instanceof DataPoint) {
            this.dataPoints.push(data);
        }
    }

    /**
    * Static class. Sets all the datapoints on a route based on a given speed and sampleRate. If the route is a loop
    it add points to the segment bewteen the last and the fisrt corner point
    * @param {Route} route The route on which the session runs
    * @param {number} speed The speed at the moment of joining the journey in meters per second
    * @param {number} sampleRate Integer number in seconds
    * @return {Array} a collection of datapoints
    */
    static setSessionPoints(route, speed, sampleRate) {

        let lastTimeStamp;

        let dataPoints = [];

        for (var i = 0; i < route.routePoints.length - 1; i++) {

            let startCoords = new Position(route.routePoints[i].lat, route.routePoints[i].lon);

            let endCoords = new Position(route.routePoints[i + 1].lat, route.routePoints[i + 1].lon);


            if (dataPoints.length > 0) {

                lastTimeStamp = dataPoints[dataPoints.length - 1].time + +sampleRate;

            } else {

                // timeStamp of first corner point
                lastTimeStamp = 0;
            }

            // add cornerPoint
            let tmpDataPoints = GeometryUtils.calculateStepsBetweenPositions(startCoords, endCoords, speed, sampleRate, lastTimeStamp);

            dataPoints.push.apply(dataPoints, tmpDataPoints);

        }

        if (route.loop) {

            let startCoords = new Position(route.routePoints[route.routePoints.length - 1].lat, route.routePoints[route.routePoints.length - 1].lon);

            let endCoords = new Position(route.routePoints[0].lat, route.routePoints[0].lon);

            lastTimeStamp = dataPoints[dataPoints.length - 1].time + +sampleRate;

            // Using utils/geometryUtils.js
            let tmpDataPoints = GeometryUtils.calculateStepsBetweenPositions(startCoords, endCoords, speed, sampleRate, lastTimeStamp);

            dataPoints.push.apply(dataPoints, tmpDataPoints);

            // add last position point
            lastTimeStamp = dataPoints[dataPoints.length - 1].time + +sampleRate;

            let tmpDP = new DataPoint(0, endCoords, speed, lastTimeStamp);

            dataPoints.push(tmpDP);
        }

        console.log(dataPoints.length + " dataPoints created session");

        return dataPoints;
    }

    /**
     * @param DataPoint
     * Add a new datapoint to the list
     */
    addDataPoint(data_point) {
        this.dataPoints.push(data_point);
    }

    /**
     * Returns a collection of lat,lon pairs of the current route
     * @return {Object} A collection of the  lat,lng pairs of all datapoints in this session
     */
    getSessionLatLongs() {
        var rtn = [];

        for (let dp of this.dataPoints) {
            if (dp != undefined) {
                rtn.push([dp.position.lat, dp.position.lon]);
            }
        }
        return rtn;
    }

    /**
     *Returns a collection of the latest datapoints of this session. The number of datapoints is defined by the parameter 'ticks'.
     *If you multiply the number of ticks by the sampleRate, tyen you get the latest datapoints for that period of time
     *@param {Number} ticks the number of latest positions to be retrieved from the datapoints collection
     *@return collection of dataPoints
     */
    getLatestDataPoints(ticks) {

        if (ticks > this.dataPoints.length) {

            return this.dataPoints;

        } else {

            return this.dataPoints.slice(this.dataPoints.length - ticks, this.dataPoints.length);
        }
    }

    /**
     * Exports the session path in GeoJSON format TO BE IMPLEMENTED
     */
    saveToJSON() {

        const MIME_TYPE = 'text/plain';

        // fileName
        let fileName = this.id_session.cyclistId.id + '_' + this.id_session.cyclistId.journey + '_' + this.id_session.cyclistId.route;

        let output = { 'id_session': this.id_session.id, 'id_cyclist': this.id_session.cyclistId.id, 'journey': this.id_session.cyclistId.journey, 'route': this.id_session.cyclistId.route };

        output.startTime = this.startTime;

        output.datapoints = this.dataPoints;

        var outputString = (JSON.stringify(output, null, 2));

        //console.log(outputString);

        var blob;
        // Create blog Object

        blob = new Blob([outputString], { type: 'application/json' });

        var a = document.createElement("a"); //document.getElementById('getFile');

        var li = document.createElement("li")

        a.download = fileName;

        a.href = window.URL.createObjectURL(blob);

        a.textContent = 'Output of ' + fileName;

        a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');

        //a.classList.add('dragout');
        var outputList = document.getElementById('outputList');

        li.append(a)

        outputList.append(li);

    }

    getLastDataPoint() {
        return this.dataPoints[this.dataPoints.length - 1];
    }
}