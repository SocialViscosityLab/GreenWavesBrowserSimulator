/**
 * Convenience class to manage all the journeys
 */
class JourneyManager {
    constructor() {
        /** The collection of journeys in this simulation*/
        this.journeys = [];
        /** The collection of leaders*/
        this.leaders = [];
        /** The collection of followers*/
        this.followers = [];
        /** The green waves*/
        this.greenWaves = [];
        // Id of the current active journey
        this.currentJourneyId = 0;
        this.nextJourneyId = this.currentJourneyId;
    }

    /** REVISED
     * Used in main class. It activates the run() method in the function setInterval()
     */
    activate(currentRoutes, ghostInitialSpeed, sampleRate, currentMap) {
        for (let routeTmp of currentRoutes) {
            if (routeTmp != undefined) {
                // Instantiate journey
                let journeyTmp = new Journey(this.nextJourneyId, routeTmp);
                // set a new journey ID for the next route
                this.getNextJourneyId();
                // make route active
                journeyTmp.activateRoute(true);
                // cyclist temp id
                let idTmp = { id: 0 + '_ghost', journey: journeyTmp.id, route: routeTmp.id };
                // ghost cyclist
                let ghostCyclist = new SimulatedCyclist(idTmp, journeyTmp.referenceRoute, journeyTmp.referenceRoute.routePoints[0], ghostInitialSpeed, true);
                // set ghost's target speed
                ghostCyclist.targetSpeed = Number(GUI.speed.value);
                // Create a session for this cyclist
                let tmpS = new Session("00000", ghostCyclist.id);
                // Insert the session at the begining of journey sessions
                journeyTmp.sessions.unshift(tmpS);
                // GreenWave GUI value
                let w = document.getElementById("greenWave");
                // Create a green wave for this ghost
                let tmpGW = new GreenWave(journeyTmp, Number(w.value));
                // Subscribe the journey as observer to the cyclists
                ghostCyclist.subscribe(journeyTmp);
                // Subscribe the session as observer to the cyclists
                ghostCyclist.subscribe(tmpS);
                // Subscribe the green wave as observer to the cyclists
                ghostCyclist.subscribe(tmpGW);
                // initialize observers
                ghostCyclist.initializeObservers();
                // add ghost to cyclist collection
                this.leaders.unshift(ghostCyclist);
                // greenWaves
                this.greenWaves.push(tmpGW);


                /**** Visualization  of journey on map *****/
                // add journey to map
                if (currentMap) currentMap.setupJourney(journeyTmp, tmpGW);
                if (currentMap) currentMap.addCyclist(ghostCyclist);


                /**** Create Journey on Firebase  ******/
                if (connect) {
                    // Adds new journey to firebase
                    comm.addNewJourney(journeyTmp.id, journeyTmp.referenceRoute.id).then(function() {
                        // Adds new session to firebase
                        comm.addNewGhostSession(journeyTmp.id, ghostCyclist).then(function() {
                            //  Listen when the database journey has new sessions added
                            comm.listenToJourneySessions(journeyTmp.id)
                        })
                    });
                }

                // add to collection
                this.journeys.push(journeyTmp);
            } else {
                alert("Route not initialized");
            }
        }
    }

    /**
     * Used in analysis class
     */
    importJourney(journeyID, journeyRoute, sessionsJSON, currentMap) {

        if (journeyRoute != undefined) {
            // Instantiate journey
            let journeyTmp = new Journey(journeyID, journeyRoute);
            // make route active
            journeyTmp.activateRoute(true);

            /**** Visualization  of journey on map *****/
            // add journey to map
            sessionsJSON.forEach(session => {
                // cyclist temp id
                let idTmp = { id: session.user_id, journey: journeyTmp.id, route: 'reference route' };
                // ghost cyclist
                let tempCyclist = new SimulatedCyclist(idTmp, journeyTmp.referenceRoute, journeyTmp.referenceRoute.routePoints[0], 0, false);
                // Create a session for this cyclist
                let tmpS = new Session(session.user_id, tempCyclist.id);

                let dp_array = session.data_points
                for (let dp in dp_array) {
                    let tempPos = new Position(dp_array[dp].latitude, dp_array[dp].longitude);
                    tempCyclist.setDataPoint(dp_array[dp].acceleration, tempPos, dp_array[dp].speed, dp_array[dp].time)
                    tmpS.addDataPoint(new DataPoint(dp_array[dp].acceleration, tempPos, dp_array[dp].speed, dp_array[dp].time))
                }

                // Insert the session at the begining of journey sessions
                journeyTmp.sessions.unshift(tmpS);

                // Subscribe the session as observer to the cyclists
                tempCyclist.subscribe(tmpS);
                if (session.user_id == '0_ghost') {
                    // Create a green wave for this ghost
                    let tmpGW = new GreenWave(journeyTmp, Number(0));
                    // Subscribe the green wave as observer to the cyclists
                    tempCyclist.subscribe(tmpGW);
                    // add ghost to cyclist collection
                    this.leaders.unshift(tempCyclist);
                    // greenWaves
                    this.greenWaves.push(tmpGW);

                    if (currentMap) currentMap.setupJourney(journeyTmp, tmpGW);
                }
                //this.greenWaveDataPoints.push(tmpS.data_poitns);
                if (currentMap) currentMap.addCyclist(tempCyclist);
            });
            // add to collection
            this.journeys.push(journeyTmp);
        } else {
            alert("Route not initialized");
        }
    }


    /** REVISED
     * Adds a cyclist to the nearest journey from a mouse click on the map and creates a session for her
     * @param {Event} event The mouse event
     * @return {boolean} true if a new cyclist was added to the route
     */
    addLocalCyclist(event) {
        let eventLocation = new Position(event.latlng.lat, event.latlng.lng);
        // retrive the journey with the nearest route to event location
        let journeyTmp = this.getNearestTo(eventLocation, 10);
        // If there is a journey with a route nearby
        if (journeyTmp) {
            // temp id
            let idTmp = { id: journeyTmp.sessions.length + '_follower', journey: journeyTmp.id, route: journeyTmp.referenceRoute.id };
            // create a cyclists
            let cyclistTmp = new SimulatedCyclist(idTmp, journeyTmp.referenceRoute, eventLocation, 0, true); // 0 is the initial speed
            // set leader
            cyclistTmp.setLeader(this.getLeaderForJourney(journeyTmp));
            // Create a session for this cyclist
            let tmpS = new Session(cyclistTmp.id.id, cyclistTmp.id); //session id, cyclist id
            // Insert the session at the begining of journey sessions
            journeyTmp.sessions.push(tmpS);
            // Subscribe the journey as observer to the cyclists
            cyclistTmp.subscribe(journeyTmp);
            // Subscribe the session as observer to the cyclists
            cyclistTmp.subscribe(tmpS);
            // Subscribe this cyclist as observer of the leader's
            this.getLeaderForJourney(journeyTmp).subscribe(cyclistTmp);
            // initialize observers
            cyclistTmp.initializeObservers();
            // add cyclist to cyclist collection
            this.followers.push(cyclistTmp);

            // adds a new session in a journey
            if (connect) {
                comm.addNewFollowerSession(journeyTmp.id, cyclistTmp).then(function(value) {
                    console.log("New session for cyclist " + cyclistTmp.id.id + "  added to Firebase in journey " + journeyTmp.id);
                });
            }

            /**** Visualization of cyclist on map *****/
            if (currentMap) currentMap.addCyclist(cyclistTmp);
            return true;
        } else {
            return false;
        }
    }


    /** REVISED
     * Adds a remote cyclist to the latest active journey and creates a local session for her
     * @param {Event} event The communication document retrieved from the database when the remote cyclcist joins the db session. see comm.listenToJourneysSessions()
     */
    addRemoteCyclist(journeyID, sessionData, event) {
        let sessionId = sessionData.index;
        let id_user = sessionData.id_user;
        // retrive the Cyclist's journey
        let journeyTmp = this.getJourney(journeyID)
        let updatedSession;
        for (let tempS of journeyTmp.sessions) {
            if (tempS.id_session.id == sessionId) {
                updatedSession = tempS
            }
        }

        if (updatedSession) {
            //console.log("Getting position of the session number: "+updatedSession.id_session.id)
            for (let cyclist of this.followers) {
                // console.log("follower id: " + cyclist.id.id)
                // console.log(updatedSession.id_session.cyclistId.id)

                if (cyclist.id.id == updatedSession.id_session.cyclistId.id) {
                    let eventLocation = new Position(event.latitude, event.longitude);
                    let speed = event.speed;
                    let acc = event.suggestion;
                    let time = event.time;

                    cyclist.setDataPoint(acc, eventLocation, speed, time);
                    //console.log("Did enter to update the cyclist position")
                }
                break;
            }

        } else {
            //Creates a session if it doesn't exist

            if (event) {
                let eventLocation = new Position(event.current_position.latitude, event.current_position.longitude);
                // temp id
                let idTmp = { id: event.id_user, journey: journeyTmp.id, route: journeyTmp.referenceRoute.id };
                // create a cyclists
                let cyclistTmp = new ActualCyclist(idTmp, journeyTmp.referenceRoute, eventLocation, event.current_position.speed, false);
                // set leader
                cyclistTmp.setLeader(this.getLeaderForJourney(journeyTmp));
                // Create a local session for this cyclist
                let tmpS = new Session(sessionId, cyclistTmp.id);
                // Insert the session at the begining of journey sessions
                journeyTmp.sessions.push(tmpS);
                // Subscribe the session as observer to the cyclists
                cyclistTmp.subscribe(tmpS);
                // add cyclist to cyclist collection
                this.followers.push(cyclistTmp);
                console.log('Remote Cyclists added')

                /**** Visualization of cyclist on map *****/
                if (currentMap) currentMap.addCyclist(cyclistTmp);
            } else {
                // add cyclist to the begining of the route
                let eventLocation = routeM.routes[0].routePoints[0];
                // temp id
                let idTmp = { id: id_user, journey: journeyTmp.id, route: journeyTmp.referenceRoute.id };
                // create a cyclists
                let cyclistTmp = new ActualCyclist(idTmp, journeyTmp.referenceRoute, eventLocation, 0, false);
                // set leader
                // cyclistTmp.setLeader(this.getLeaderForJourney(journeyTmp));
                // Create a local session for this cyclist
                let tmpS = new Session(sessionId, cyclistTmp.id);
                // Insert the session at the begining of journey sessions
                journeyTmp.sessions.push(tmpS);
                // Subscribe the session as observer to the cyclists
                cyclistTmp.subscribe(tmpS);
                // add cyclist to cyclist collection
                this.followers.push(cyclistTmp);
                console.log('Remote Cyclists added')

                /**** Visualization of cyclist on map *****/
                if (currentMap) currentMap.addCyclist(cyclistTmp);
            }
        }
    }

    /**
     * Adds a remote cyclist to the latest active journey and creates a local session for her
     * @param {Event} event The communication event triggered when the remote cyclist joins the db session
     * @todo adecuate the method in order to receive datapoints from the loaded jsons and store them in the session object
     */
    importCyclistData(sessionId, event) {
        //current_position: {acceleration: 0, latitude: 40.1149175, longitude: -88.22143, speed: 0, suggestion: -1, …}
        //id_user: "mTgx1snPoAaYr3aCwKemtyIJNw63"
        //start_time: "2019/1/7 - 21:10:54"

        // retrive the latest journey
        let journeyTmp = this.getCurrentJourney();

        let updatedSession;
        for (let tempS of journeyTmp.sessions) {
            if (tempS.id_session.id == sessionId) {
                updatedSession = tempS
            }
        }
        if (updatedSession) {
            //console.log("Getting position of the session number: "+updatedSession.id_session.id)
            for (let cyclist of this.followers) {
                //console.log("follower id: "+cyclist.id.id)
                //console.log(updatedSession.id_session.cyclistId.id)

                if (cyclist.id.id == updatedSession.id_session.cyclistId.id) {
                    let eventLocation = new Position(event.current_position.latitude, event.current_position.longitude);
                    let speed = event.current_position.speed;
                    let acc = event.current_position.acceleration;
                    let time = event.current_position.time;
                    cyclist.setDataPoint(acc, eventLocation, speed, time);
                }
                break;
            }

        } else {
            //Creates a session if it doesn't exist
            let eventLocation = new Position(event.current_position.latitude, event.current_position.longitude);

            // temp id
            let idTmp = { id: event.id_user, journey: journeyTmp.id, route: journeyTmp.referenceRoute.id };
            // create a cyclists
            let cyclistTmp = new SimulatedCyclist(idTmp, journeyTmp.referenceRoute, eventLocation, event.current_position.speed, false);
            // set leader
            cyclistTmp.setLeader(this.getLeaderForJourney(journeyTmp));
            // Create a local session for this cyclist
            let tmpS = new Session(sessionId, cyclistTmp.id);
            // Insert the session at the begining of journey sessions
            journeyTmp.sessions.push(tmpS);
            // Subscribe the session as observer to the cyclists
            cyclistTmp.subscribe(tmpS);
            /**** might need to invoke 
             initialize observers
             cyclistTmp.initializeObservers();
             */
            // add cyclist to cyclist collection
            this.followers.push(cyclistTmp);

            /**** Visualization of cyclist on map *****/
            if (currentMap) currentMap.addCyclist(cyclistTmp);
        }
    }

    /**
    * Gets the session points for a given journey
    @param {} journeyID the ID of the journey
    @param {} speedRate the document.getElementById("speedRate").value;
    @param {} sampleRate the global sample rate
    @param {} currentMap Map to display session points on
    */
    getGhostSessionPoints(journeyID, speedRate, sampleRate, currentMap) {
        for (let journeyTmp of this.journeys) {

            if (journeyTmp.id == journeyID) {
                // **** generate all session points
                journeyTmp.setGhostSessionPoints(speedRate, sampleRate);
                // **** display all session points
                if (currentMap) currentMap.displaySessionMarkers(0, 0);
            }
        }
    }

    /**
     * Runs all the cyclists and journeys in this Manager
     * @param {Number} sampleRate The user defined sample rate
     */
    runCyclists(sampleRate) {
        // run leaders
        for (let cyclist of this.leaders) {
            cyclist.run(sampleRate); // nearestCyclistAhead , sampleRate
        }
        // run followers
        for (let cyclist of this.followers) {
            //if (cyclist.isSimulated){
            cyclist.run(sampleRate); // sampleRate
            //}
        }
    }

    /** REVISED
     * Records Leaders data on Firebase as long they are "enabled", i.e. they have not reached the final route point. The recording sample rate is specified by the user on the GUI
     */
    recordLeadersDataOnDataBase() {
        // for leaders
        for (let cyclist of this.leaders) {
            if (cyclist.status == "enabled") {

                // Parameter to send to Firebase
                const journeyId = cyclist.getJourney().id;
                const dataPointDoc = cyclist.getSession().getLastDataPoint().getDoc()
                const sessionId = cyclist.getSession().id_session.id;
                const dataPointId = cyclist.getSession().dataPoints.length - 1;

                //record
                //console.log('recorded on journeyId:' + journeyId + ", on sessionId: " + sessionId + ', for cyclistIndex ' + sessionId + ', in dataPointId ' + dataPointId + ", on route: " + cyclist.getJourney().referenceRoute.id);

                // Update the ghost's history of posititons
                comm.addNewDataPointInSession(journeyId, sessionId, dataPointId, dataPointDoc);
            }
        }
    }

    /** REVISED
     * Records followers data on Firebase as long they are "enabled", i.e. they have not reached the final route point. The recording sample rate is specified by the user on the GUI
     */
    recordLocalFollowersDataOnDataBase() {

        // for followers
        for (let cyclist of this.followers) {
            if (cyclist.status == "enabled" && cyclist.isSimmulated) {

                const journeyId = cyclist.getJourney().id;
                const dataPointDoc = cyclist.getSession().getLastDataPoint().getDoc()
                    //const localSessionId = cyclist.getSession().id_session.id;
                const dataPointId = cyclist.getSession().dataPoints.length - 1;

                //record
                //console.log('recorded on journeyId:' + journeyId + ", on sessionId: " + localSessionId + ', for cyclistIndex ' + localSessionId + ', in dataPointId ' + dataPointId + ", on route: " + cyclist.getJourney().referenceRoute.id);
                //Get the session ID from a cyclist ID on a specific journey
                comm.getSessionIDfromCyclistUserId(journeyId, cyclist.id.id).then(function(session) {
                    const cloudSessionID = session.docs[0].id;
                    console.log(cloudSessionID);
                    // Update the follower's history of posititons
                    comm.addNewDataPointInSession(journeyId, cloudSessionID, dataPointId, dataPointDoc);
                })


            }
        }
    }

    /**
     * Retrives the journey with the nearest route to an event location
     * @param {Position} eventLocation The location of cyclist insertion
     * @param {Number} proximityRadius The scope in meters of valid proximity to accept a cyclist on a route
     * @return {Journey} the collection of closest journey. It is a collection in case several routes have the same proximity
     */
    getNearestTo(eventLocation, proximityRadius) {
        let rtn = this.journeys[0];
        let currentD = rtn.referenceRoute.getIndexAndProximityToClosestSegmentTo(eventLocation).proximity;
        //for each journey get the shortest distance
        for (var i = 1; i < this.journeys.length; i++) {
            let nextD = this.journeys[i].referenceRoute.getIndexAndProximityToClosestSegmentTo(eventLocation).proximity;
            if (currentD > nextD) {
                currentD = nextD;
                //console.log("here inside " + currentD);
                rtn = this.journeys[i];
            }
        }
        if (proximityRadius) {
            if (currentD <= proximityRadius) {
                return rtn;
            } else {
                alert("The cyclist you intend to add is out of the scope of any journey. The acceptable proximity radius is: " + proximityRadius + ' meters');
                return undefined;
            }
        } else {
            return rtn;
        }
    }

    getLeaderForJourney(journeyID) {
        for (let c of this.leaders) {
            if (c.id.journey === journeyID.id) {
                return c;
            }
        }
        return undefined;
    }

    getCurrentJourney() {
        for (let journeyTmp of this.journeys) {
            // console.log(journeyTmp)
            // console.log(this.currentJourneyId)

            if (journeyTmp.id == this.currentJourneyId) {
                return journeyTmp;
            }
        }
    }

    getJourney(ID) {
        let tmp = this.journeys.filter((journey) => journey.id == ID);
        return tmp[0]
    }

    setCurrentJourneyId(id) {
        this.currentJourneyId = id;
        this.nextJourneyId = this.currentJourneyId;
    }

    getNextJourneyId() {

        this.currentJourneyId = this.nextJourneyId;
        // convert from string to number
        let num = Number(this.currentJourneyId);
        // increase number by 1
        num++;
        // trim string's tail by the decimal places of num
        let tmp = String(this.currentJourneyId).slice(0, -String(num).length);
        // update current ID
        this.nextJourneyId = tmp + num;
        // show ID
        // console.log(this.currentJourneyId);
    }

    /** REVISED
     * Returns true when all journeys are completed
     */
    areJourneysCompleted() {
        let rtn = true;
        for (let cyclist of this.leaders) {
            rtn = rtn && cyclist.status != "enabled";
        }
        return rtn;
    }
}