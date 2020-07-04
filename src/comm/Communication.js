class Communication {

    constructor() {
        this.journeys = db.collection('journeys');
        this.routes = db.collection('routes');
    }

    /** REVISED DEPRECATED
     * Consult the journey's id on the database and generate the next 
     * one in the sequence
     * @deprecated Since July 3, 2020 use getNewJourneyId2. It reduces the download burden on the database.
     */
    getNewJourneyId() {
        let jId = 0;
        let promise = this.journeys.get().then(snapshot => {
            snapshot.forEach(doc => {
                let id = parseInt(doc.id);
                if (id !== null) {
                    if (id > jId) {
                        jId = id;
                    }
                }
            });
            let zeros = "00000";
            let journeyId = (zeros + (jId + 1)).slice(-zeros.length);
            Communication.newJourneyId = journeyId;
        });
        return promise;
    }

    /** REVISED
     * Consult the journey's id on the database and generate the next 
     * one in the sequence. Journeys must have an 'id' field. Implemented since July 3, 2020
     */
    async getNewJourneyId2() {
        const lastJourney = await this.journeys.orderBy('id', 'desc').limit(1).get();
        for (const iterator of lastJourney.docs) {
            let zeros = "00000";
            let journeyId = (zeros + (Number(iterator.id) + 1)).slice(-zeros.length);
            Communication.newJourneyId = journeyId;
        }
        return lastJourney;
    }

    /**
     * Returns the json object from a specific session 
     * on a specific journey
     * @param {String} id_journey 
     * @param {String} id_session 
     * @returns {Promise,JSON} Session_json
     */
    getSession(id_journey, id_session) {
        console.log("getting session" + id_session);
        let session_json;
        let data_points_array = {};
        let doc_ref = this.journeys.doc(id_journey).collection('sessions').doc(id_session);

        return doc_ref.get().then(doc => {
                let session_data = doc.data()
                let user_id = session_data.id_user
                let start_time = session_data.start_time
                let dp_array = session_data.data_points
                console.log(session_data)
                session_json = {
                    'user_id': user_id,
                    'start_time': start_time,
                    'data_points': dp_array
                }
                return doc_ref.collection('data_points').get()
            })
            .then(snapshot => {
                snapshot.forEach(dp => {
                    data_points_array[dp.id] = {
                        'acceleration': dp.data().acceleration,
                        'latitude': dp.data().latitude,
                        'longitude': dp.data().longitude,
                        'speed': dp.data().speed,
                        'suggestion': dp.data().suggestion,
                        'time': dp.data().time
                    }
                })
                session_json.data_points = data_points_array
                return session_json
            });
    }


    /**
     * Returns the json object from the ghost's session 
     * on a specific journey
     * @param {String} id_journey 
     * @returns {Promise,JSON} Session_json
     */
    getGhostSession(id_journey) {
        let session_json
        let data_points_array = {}
        let doc_ref = this.journeys.doc(id_journey).collection('sessions').doc('00000');

        return doc_ref.get().then(doc => {
                let session_data = doc.data()
                let user_id = session_data.id_user
                let start_time = session_data.start_time
                let dp_array = session_data.data_points

                session_json = {
                    'user_id': user_id,
                    'start_time': start_time,
                    'data_points': dp_array
                }
                return doc_ref.collection('data_points').get()
            })
            .then(snapshot => {
                snapshot.forEach(dp => {
                    data_points_array[dp.id] = {
                        'acceleration': dp.data().acceleration,
                        'latitude': dp.data().latitude,
                        'longitude': dp.data().longitude,
                        'speed': dp.data().speed,
                        'suggestion': dp.data().suggestion,
                        'time': dp.data().time
                    }
                })
                session_json.data_points = data_points_array
                return session_json
            });
    }


    /**
     * Looks for all the information of a specific journey
     * and return an object with all its information
     * @returns {Promise,Object} journey
     */
    getJourney(journeyId) {
        let journey
        let routeRef
        let journeyRef = this.journeys.doc(journeyId)

        return journeyRef.get().then(doc => {
                routeRef = doc.data().reference_route.id
                console.log(routeRef)
                return doc.data().reference_route.collection('position_points').get()

            })
            .then(snapshot => {
                let position_points = []
                snapshot.forEach(doc => {
                    let coord = doc.data()
                    position_points.push({ lat: coord.latitude, lon: coord.longitude })
                });
                journey = { ref_route: { name: routeRef, 'position_points': position_points }, sessions: [] }
                return journeyRef.collection('sessions').get()
            })
            .then(snapshot => {
                let sessions_promises = []
                snapshot.forEach(doc => {
                    let temp_sID = doc.id
                    if (temp_sID != '00000') {
                        sessions_promises.push(
                            this.getSession(journeyId, temp_sID)
                        )
                    } else {
                        sessions_promises.push(
                            this.getGhostSession(journeyId)
                        )
                    }
                });
                console.log(sessions_promises);
                return Promise.all(sessions_promises)
            })
            .then(sessions_docs => {
                console.log(sessions_docs);
                journey.sessions = sessions_docs
                return journey
            });
    }


    /** REVISED
     * Gets all the route names stored in Firebase. Names added since July 3 2020
     */
    async getAvailableRoutes() {
        let routeNames = [];
        const tmpRoutes = await this.routes.get();
        for (const iterator of tmpRoutes.docs) {
            // console.log(iterator.data());
            routeNames.push(iterator.data().name);
        }
        return routeNames;
    }


    /**
     * Format a number with the id format used on the database
     * @param {Integer} id 
     */
    formatID(id) {
        let zeros = "00000";
        return (zeros + id).slice(-zeros.length)
    }


    /** REVISED
     * Listen to a specific journey. If there is an addition to the session list, a new cyclists id added to the Journey Manager
     * @param {String} journeyId 
     */
    listenToJourneySessions(journeyId) {
        var sessions = this.journeys.doc(journeyId).collection("sessions").where("index", '>', "00000")
            .onSnapshot(function(docSnapShot) {
                docSnapShot.docChanges().forEach(function(change) {
                    //console.log(change);
                    if (change.type == 'added') {
                        let changingSession = change.doc.data();
                        /**
                         * Add a remote Cycilst to the journey Manager only if it is not simulated because
                         * simulated cyclists have been added already in the click event on Main.
                         */
                        if (!changingSession.isSimulated) {
                            journeyM.addRemoteCyclist(change.doc.id, changingSession);
                        }
                    }
                });
            });
        return sessions;
    }


    /** REVISED
     * Sends a new rout with a specific Id to defined
     * positionPoints to the database
     * @param {String} id 
     * @param {JSON} positionPoints 
     */
    async addNewRoute(id, positionPoints) {
        // get the routes on firebase
        let routesOnFirebase = await this.getAvailableRoutes();
        // once retrieved
        // verify if the name exists already
        if (routesOnFirebase.includes(id)) {
            console.log("Route " + id + " exists on database. Not replaced!")
        } else {
            // add it to firebase if the name does not exist
            for (var i = 0; i <= positionPoints.length; i++) {
                if (positionPoints[i] != undefined) {
                    let zeros = "000";
                    let ppId = (zeros + i).slice(-zeros.length);
                    await this.routes.doc(id).collection('position_points').doc(ppId).set(positionPoints[i]);
                }
            }
            await this.routes.doc(id).set({ name: id, loop: false, date: new Date() });
            console.log("Route " + id + " added to database");
        }
    }


    /** REVISED
     * Switch the loop's value on a specific route
     * @param {String} id 
     * @param {Boolean} loop 
     */
    setRouteLoop(id, loop) {
        this.routes.doc(id).set({ loop: loop });
    }


    /** REVISED
     * Sets a new journey on the database with a specific id and a 
     * reference route
     * @param {String} id 
     * @param {String} refRouteId 
     */
    addNewJourney(id, refRouteId) {
        let refRoute = this.routes.doc(refRouteId);
        return this.journeys.doc(id).set({ id: id, reference_route: refRoute, date: new Date() });
    }


    /** REVISED
     * Adds a new new Ghost's session on a specific journey
     * @param {String} journeyId
     * @param {Cyclist} ghost
     */
    addNewGhostSession(jId, ghost) {
        let journeyId = "" + jId;
        let time = new Date();
        let startTime = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " - " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
        let metaData = {
            index: "00000",
            id_user: ghost.id.id,
            start_time: startTime,
            isSimulated: ghost.isSimulated
        };
        return this.journeys.doc(journeyId).collection('sessions').doc("00000").set(metaData);
    }


    /** REVISED
     * Consult the session's id on the database and generate the next 
     * one in the sequence. Sessions must have an 'index' field. Implemented since July 3, 2020
     */
    async getNewSessionId(id_journey) {
        const lastSession = await this.journeys.doc(id_journey).collection('sessions').orderBy('index', 'desc').limit(1).get();
        //console.log(lastSession)
        let sessionId;
        for (const iterator of lastSession.docs) {
            let zeros = "00000";
            sessionId = (zeros + (Number(iterator.id) + 1)).slice(-zeros.length);
        }
        //console.log(sessionId);
        return sessionId;
    }


    /** REVISED
     * Adds a new new follower session on a specific journey
     * @param {String} journeyId
     * @param {Session} cyclist 
     */
    async addNewFollowerSession(jId, cyclist) {
        let journeyId = "" + jId;
        let time = new Date();
        let startTime = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " - " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
        let sessionID = await this.getNewSessionId(journeyId);
        let metaData = {
            index: sessionID,
            id_user: cyclist.id.id,
            start_time: startTime,
            isSimulated: cyclist.isSimulated
        };
        // console.log(metaData);
        let completion = db.collection('journeys').doc(journeyId).collection('sessions').doc(sessionID).set(metaData);
        //console.log("metaData added");
        return completion;
    }


    /** REVISED
     * Adds a new datapoint document with a specific id in a specific session from a specific journey
     * @param {String} jId 
     * @param {String} sessionId 
     * @param {Integer} dpId 
     * @param {JSON} dataPointDoc 
     */
    addNewDataPointInSession(jId, sessionId, dpId, dataPointDoc) {
        let journeyId = "" + jId;
        let dataPointId = "" + dpId;
        let zero_filled = '00000';
        let filledDataPointId = (zero_filled + dataPointId).slice(-zero_filled.length);
        db.collection('journeys').doc(journeyId).collection('sessions').doc(sessionId).collection("data_points").doc(filledDataPointId).set(dataPointDoc);
    }

    /**
     * Returns the session from a cyclist ID on a specific journey
     * @param {String} id_journey 
     * @param {String} id_session 
     * @returns {Promise,JSON} Session_json
     */
    getSessionIDfromCyclistUserId(id_journey, user_id) {
        // console.log("journey: " + id_journey + ",  cyclist:" + id_cyclist)
        const session = this.journeys.doc(id_journey).collection('sessions').where("id_user", "==", user_id).get();
        // console.log(session.docs[0].id);
        return session; //.docs[0].id;
    }

    /**
     * Update the current ghost position on the database from a specific journey
     * @param {String} jId 
     * @param {JSON} dataPointDoc 
     */
    updateGhostPosition(jId, dataPointDoc) {
        let journeyId = "" + jId;
        this.journeys.doc(journeyId).collection('sessions').doc("00000").update({ current_ghost_position: dataPointDoc });
    }


    /**
     * Looks for the last session on the data base and returns it in form of a json
     * @returns {Promise,JSON} Session_json
     */
    getLastSession() {
        let jId = 0;
        let journeyId = '00000'
        let sessionId = '00000'

        return this.journeys.get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    let id = parseInt(doc.id);
                    if (id !== null) {
                        if (id > jId) {
                            jId = id;
                        }
                    }
                });
                journeyId = this.formatID(jId)
                    //console.log('Last journey found: '+journeyId)
                return this.journeys.doc(journeyId).collection('sessions').get();
            })
            .then(snapshot => {
                let sId = 0;
                snapshot.forEach(doc => {
                    let id_s = parseInt(doc.id);
                    if (id_s !== null) {
                        if (id_s > sId) {
                            sId = id_s;
                        }
                    }
                });
                sessionId = this.formatID(sId)
                    //console.log('Last session found: '+sessionId)
                let doc_ref = this.journeys.doc(journeyId).collection('sessions').doc(sessionId);
                return doc_ref.get()
            })
            .then(doc => {
                let session_json
                let session_data = doc.data()
                    //console.log(session_data)
                let user_id = session_data.id_user
                let start_time = session_data.start_time
                let dp_array = session_data.data_points

                session_json = {
                    'user_id': user_id,
                    'start_time': start_time,
                    'data_points': dp_array
                }
                return session_json
            });
    }
}
Communication.newJourneyId = "00000";