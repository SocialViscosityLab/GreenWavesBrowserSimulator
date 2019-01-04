/**
* Convenient class to manage all the journeys
*/
class JourneyManager{
  constructor(){
    /** The collection of journeys in thjis simulation*/
    this.journeys = [];
  }

  /**
  * Activates the run() method in the function setInterval()
  */
  activate(currentRoutes, ghostSpeed, sampleRate, currentMap){
    for (let routeTmp of currentRoutes){
      if (routeTmp != undefined){
        // Instantiate journey
        let journeyTmp = new Journey(0, routeTmp);
        // make route active
        journeyTmp.activateRoute(true);
        // set Ghost session dataPoints
        journeyTmp.setupGhost(ghostSpeed);
        /**** Visualization  of journey on map *****/
        // add journey to map
        if (currentMap) currentMap.setupJourney(journeyTmp);
        // add to collection
        this.journeys.push(journeyTmp);
      }else{
        alert("Route not initialized");
      }
    }
  }

  /**
  * Gets the session points for a given journey
  @param {} journeyID the ID of the journey
  @param {} speedRate the document.getElementById("speedRate").value;
  @param {} sampleRate the global sample rate
  @param {} currentMap Map to display session points on
  */
  getGhostSessionPoints(journeyID, speedRate, sampleRate, currentMap){
    for (let journeyTmp of this.journeys){

      if (journeyTmp.id == journeyID){
        // **** generate all session points
        journeyTmp.setGhostSessionPoints(speedRate, sampleRate);
        // **** display all session points
        if (currentMap) currentMap.displaySessionMarkers(0,0);
      }
    }
  }

  /**
  * Runs all the sessions in this Manager
  * @param {Number} sampleRate The user definde sample rate
  */
  runSessions(sampleRate){
    for(let journeyTmp of this.journeys){
      //journeyTmp.runGhost(sampleRate);
      journeyTmp.runSessions(sampleRate);
      //journeyTmp.runSession(1,sampleRate);
    }
  }

/**
* Retrives the journey with the nearest route to event location
* @param {Position} eventLocation The location of cyclist insertion
* @return {Journey} the collection of closest journey. It is a collection in case several routes have the same proximity
*/
  getNearestTo(eventLocation){
    let rtn = this.journeys[0];
    let currentD = rtn.referenceRoute.getIndexAndProximityToClosestSegmentTo(eventLocation).proximity;
    //for each journey get the shortest distance
    for (var i = 1; i < this.journeys.length; i++){
      let nextD = this.journeys[i].referenceRoute.getIndexAndProximityToClosestSegmentTo(eventLocation).proximity;
      if (currentD > nextD){
        currentD = nextD;
        rtn = this.journeys[i];
      }
    }
    return rtn;
  }
}
