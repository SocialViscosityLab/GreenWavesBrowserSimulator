/**
The visualization class of Journey class.
@param {Journey} journey The journey associated to this class
*/
class MapJourney{
  constructor(journey){
    this.journey = journey;
    /**The visualization of this mapJourney's sessions*/
    this.mapSessions = [];
    this.setup();
    this.greenWavePolyline;
  }

  /**
  Private method to setup this mapJourney. It insatntiates and stores all the mapSessions
  corresponding to the session in the journey
  */
  setup(){
    for (let ssn of this.journey.sessions) {
      // check if the collection has that session
      if (!this.mapSessions.includes(ssn)){
        // if not, add this session
        this.mapSessions.push (new MapSession(ssn));
      } else {
        console.log("Duplicated Session")
      }
    }
  }

  /**
  Updates the list of mapSessions running the setup(). It preserves earlier mapSessions
  */
  update(){
    this.setup();
  }
  /**
  * Plots the mapSession on the given map
  @param {Cartography} theMap An insatnce of Cartography that includes the Leaflet map
  */
  plotSessions(theMap){
    for (let ssn of this.mapSessions){
      ssn.markSessionCurrentPoint(theMap);
      // plot session path
      ssn.plotPath(theMap);
    }
  }


  /**
  * Plots the ghost/leader's green wave on the map
  * @param {Cartography} theMap An instance of Cartography that contauins the Leaflet map
  */
  plotGreenWave(theMap){
    // retrieve the journey's green wave dataPoints
    let gwDataPoints = this.journey.greenWaveDataPoints;
    let latlons = [];
    // convert them to getRouteLatLongs
    for (let i = 0; i < gwDataPoints.length; i++) {
      latlons[i] = gwDataPoints[i].getLatLon();
    }

    if (this.greenWavePolyline == undefined){

      this.greenWavePolyline = L.polyline(latlons, {color: '#00FF00', weight:10,  opacity: 0.6}).addTo(theMap);

    } else{
      // remove the current pathPolyline
      theMap.removeLayer(this.greenWavePolyline);
      // add a new one
      this.greenWavePolyline = L.polyline(latlons, {color: '#00FF00', weight:10, opacity: 0.6}).addTo(theMap);
    }
  }
}
