/**
The visualization class of Journey class.
@param {Journey} journey The journey associated to this class
*/
class MapJourney {
    constructor(journey, greenWave) {
        this.journey = journey;
        /**The visualization of this mapJourney's sessions*/
        this.mapSessions = [];
        this.setup();
        this.greenWavePositions = greenWave.greenWavePositions;
        this.greenWavePolyline;
    }

    /**
    Private method to setup this mapJourney. It instantiates and stores all the mapSessions
    corresponding to the session in the journey
    */
    setup() {
        for (const ssn of this.journey.sessions) {
            // check if the collection has that session
            let tmp = new MapSession(ssn);
            let tmpSessionName = tmp.session.id_session.id;
            if (!Object.keys(this.mapSessions).includes(tmpSessionName)) {
                // if not, add this session
                this.mapSessions[tmpSessionName] = tmp;
            } else {
                console.log('MapJourney rejected duplicated ' + tmpSessionName + " session on map for journey on " + this.journey.id)
            }
        }
    }

    /**
    Updates the list of mapSessions running the setup(). It preserves earlier mapSessions
    */
    update() {
        this.setup();
    }

    /**
    * Plots the mapSession on the given map
    @param {Cartography} theMap An insatnce of Cartography that includes the Leaflet map
    */
    plotSessions(theMap) {
        for (let ssn of Object.keys(this.mapSessions)) {
            //this.mapSessions[ssn].markSessionCurrentPoint(theMap);
            // plot session path
            this.mapSessions[ssn].plotPath(theMap);
        }
    }

    /**
     * Add a label to each datapoint matching the frequency period
     * @param {Cartography} theMap The current cartography
     * @param {Number} frequency Integer number representing the frequency in seconds. It can be interpreted as:"Put a label on each datapoint at a frequency of X seconds"
     */
    plotMarkers(theMap, frequency, sessionID) {
        for (let ssn of Object.keys(this.mapSessions)) {
            if (ssn == sessionID) {
                this.mapSessions[ssn].markSessionAllDataPoints(theMap, frequency);
            }
        }
    }


    /**
     * Plots the ghost/leader's green wave on the map
     * @param {Cartography} theMap An instance of Cartography that contauins the Leaflet map
     */
    plotGreenWave(theMap) {
        // retrieve the journey's green wave dataPoints
        let latlons = [];
        // convert them to getRouteLatLongs
        for (let i = 0; i < this.greenWavePositions.length; i++) {
            latlons[i] = [this.greenWavePositions[i].lat, this.greenWavePositions[i].lon];
        }

        if (!this.greenWavePolyline) {
            // create the polyline
            this.greenWavePolyline = L.polyline(latlons, { color: '#00FF00', weight: 10, opacity: 0.6 }).addTo(theMap);

        } else {
            // update lat longs
            this.greenWavePolyline.setLatLngs(latlons);
        }
    }
}