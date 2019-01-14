/**
* Convenient class to manage all the journeys
*/
class JourneyManager{
  constructor(){
    /** The collection of journeys in this simulation*/
    this.journeys = [];
    /** The collection of leaders*/
    this.leaders = [];
    /** The collection of followers*/
    this.followers = [];
    /** The green waves*/
    this.greenWaves = [];
    //  temporal to simulate new cyclists id_user
    this.appID = 0;
    // Id of the current active journey
    this.currentJourneyId = 0;
  }

  /**
  * Used in main class. It activates the run() method in the function setInterval()
  */
  activate(currentRoutes, ghostSpeed, sampleRate, currentMap){
    for (let routeTmp of currentRoutes){
      if (routeTmp != undefined){
        // Instantiate journey
        let journeyTmp = new Journey(this.currentJourneyId, routeTmp);
        // make route active
        journeyTmp.activateRoute(true);
        // cyclist temp id
        let idTmp = {id:this.appID, journey:journeyTmp.id, route:routeTmp.id};
        // ghost cyclist
        let ghostCyclist = new Cyclist(idTmp, journeyTmp.referenceRoute ,journeyTmp.referenceRoute.routePoints[0], ghostSpeed);
        // increase id for next cyclist
        this.appID++;
        // Create a session for this cyclist
        let tmpS = new Session(ghostCyclist.id);
        // Insert the session at the begining of journey sessions
        journeyTmp.sessions.unshift(tmpS);
        // GreenWave GUI value
        let w = document.getElementById("greenWave")
        // Create a green wave for this ghost
        let tmpGW = new GreenWave(journeyTmp, Number(w.value));
        // Subscribe the session as observer to the cyclists
        ghostCyclist.subscribe(tmpS);
        // Subscribe the green wave as observer to the cyclists
        ghostCyclist.subscribe(tmpGW);
        // add ghost to cyclist collection
        this.leaders.unshift(ghostCyclist);
        // greenWaves
        this.greenWaves.push(tmpGW);

        /**** Visualization  of journey on map *****/
        // add journey to map
        if (currentMap) currentMap.setupJourney(journeyTmp, tmpGW);
        if (currentMap) currentMap.addCyclist(ghostCyclist);
        // add to collection
        this.journeys.push(journeyTmp);
      }else{
        alert("Route not initialized");
      }
    }
  }

  /**
  * Adds a cyclist to the nearest journey and creates a session for her
  * @param {Event} event The mouse event
  * @return {boolean} true if a new cyclist was added to the route
  */
  addCyclist(event){
    let eventLocation = new Position (event.latlng.lat,event.latlng.lng);
    // retrive the journey with the nearest route to event location
    let journeyTmp = this.getNearestTo(eventLocation, 10);
    // If there is a journey with a route nearby
    if (journeyTmp){
      // temp id
      let idTmp = {id:this.appID, journey:journeyTmp.id, route:journeyTmp.referenceRoute.id};
      // create a cyclists
      let cyclistTmp = new Cyclist(idTmp, journeyTmp.referenceRoute, eventLocation, 3); // 3 is the default speed
      // set leader
      cyclistTmp.setLeader(this.getLeaderForJourney(journeyTmp));
      // increase for next cyclist id
      this.appID++;
      // Create a session for this cyclist
      let tmpS = new Session(cyclistTmp.id);
      // Insert the session at the begining of journey sessions
      journeyTmp.sessions.push(tmpS);
      // Subscribe the session as observer to the cyclists
      cyclistTmp.subscribe(tmpS);
      // add cyclist to cyclist collection
      this.followers.push(cyclistTmp);

      /**** Visualization of cyclist on map *****/
      if (currentMap) currentMap.addCyclist(cyclistTmp);

      return true;
    }else {
      return false;
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
  * Runs all the cyclists and journeys in this Manager
  * @param {Number} sampleRate The user defined sample rate
  */
  runCyclists(sampleRate){
    // run leaders
    for(let cyclist of this.leaders){
      cyclist.run(sampleRate); // nearestCyclistAhead , sampleRate
    }
    // run followers
    for(let cyclist of this.followers){
      cyclist.run(sampleRate); // nearestCyclistAhead , sampleRate
    }
  }

  /**
  * Retrives the journey with the nearest route to an event location
  * @param {Position} eventLocation The location of cyclist insertion
  * @param {Number} proximityRadius The scope in meters of valid proximity to accept a cyclist on a route
  * @return {Journey} the collection of closest journey. It is a collection in case several routes have the same proximity
  */
  getNearestTo(eventLocation, proximityRadius){
    let rtn = this.journeys[0];
    let currentD = rtn.referenceRoute.getIndexAndProximityToClosestSegmentTo(eventLocation).proximity;
    //for each journey get the shortest distance
    for (var i = 1; i < this.journeys.length; i++){
      let nextD = this.journeys[i].referenceRoute.getIndexAndProximityToClosestSegmentTo(eventLocation).proximity;
      if (currentD > nextD){
        currentD = nextD;
        console.log("here inside "+ currentD);
        rtn = this.journeys[i];
      }
    }
    if (proximityRadius){
      if (currentD <= proximityRadius){
        return rtn;
      } else {
        alert("The cyclist is out of the scope of any journey. The acceptable proximity radius is: " + proximityRadius);
        return undefined;
      }
    } else {
      return rtn;
    }
  }

  getLeaderForJourney(journeyID){
    for(let c of this.leaders){
      if (c.id.journey === journeyID)
      console.log(c," ",journeyID);
      return c;
    }
  }

  getCurrentJourney(){
    for (let journeyTmp of this.journeys){

      if (journeyTmp.id == this.currentJourneyId){
        return journeyTmp;
      }
    }
  }
}
