class Communication{
  constructor(){
    this.newJourneyId = 0;
  }

  /**
   * Consult the journey's id on the database and generate the next 
   * one in the sequence
   */
  getNewJourneyId(){
    let jId = 0;
    var journeys = db.collection('journeys').get().then(snapshot => {
      snapshot.forEach(doc => {
        let id = parseInt(doc.id);
        if(id !== null){
          if (id > jId){
            jId = id;
          }
        }
      });
      let zeros = "00000";
      let journeyId = (zeros+(jId+1)).slice(-zeros.length);
      this.newJourneyId = journeyId;

    });
    return journeys;
  }


  /**
   * Returns the json object from a specific session 
   * on a specific journey
   * @param {String} id_journey 
   * @param {String} id_session 
   * @returns {Promise,JSON} Session_json
   */
  getSession(id_journey, id_session){
    let session_json
    let doc_ref = db.collection('journeys').doc(id_journey).collection('sessions').doc(id_session); 
    
    return doc_ref.get().then(doc => {
      let session_data = doc.data()
      let user_id = session_data.id_user
      let start_time = session_data.start_time
      let dp_array = session_data.data_points
      
      session_json = {
        'user_id' : user_id,
        'start_time' : start_time,
        'data_points' : dp_array
      }
      return session_json
    });
}


  /**
   * Returns the json object from the ghost's session 
   * on a specific journey
   * @param {String} id_journey 
   * @returns {Promise,JSON} Session_json
   */
  getGhostSession(id_journey){
    let session_json
    let data_points_array = {}
    let doc_ref = db.collection('journeys').doc(id_journey).collection('sessions').doc('00000'); 
    
    return doc_ref.get().then(doc => {
      let session_data = doc.data()
      let user_id = session_data.id_user
      let start_time = session_data.start_time
      let dp_array = session_data.data_points
       
      session_json = {
        'user_id' : user_id,
        'start_time' : start_time,
        'data_points' : dp_array
      }     
      return doc_ref.collection('data_points').get()
    })
    .then(snapshot =>{
      snapshot.forEach(dp => {
        //console.log(dp.id)
        data_points_array[dp.id] = {
          'acceleration' : dp.data().acceleration,
          'latitude' : dp.data().latitude,
          'longitude' : dp.data().longitude,
          'speed' : dp.data().speed,
          'suggestion' : dp.data().suggestion,
          'time' : dp.data().time
          }
        //data_points_array.push(dp.id, temp_dp)
      })
      console.log(session_json)
      session_json.data_points = data_points_array
      return session_json
    });
}


  /**
   * Looks for the last session on the data base and returns it in form of a json
   * @returns {Promise,JSON} Session_json
   */
 getLastSession(){
  let jId = 0;
  let journeyId = '00000'
  let sessionId = '00000'
  
  return db.collection('journeys').get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      let id = parseInt(doc.id);
      if(id !== null){
        if (id > jId){
          jId = id;
        }
      }
    });
    journeyId = this.formatID(jId)
    //console.log('Last journey found: '+journeyId)
    return db.collection('journeys').doc(journeyId).collection('sessions').get();
    })
    .then(snapshot => {
        let sId = 0;
        snapshot.forEach(doc => {
          let id_s = parseInt(doc.id);
          if(id_s !== null){
            if (id_s > sId){
              sId = id_s;
            }
          }
        });
      sessionId = this.formatID(sId)
      //console.log('Last session found: '+sessionId)
      let doc_ref = db.collection('journeys').doc(journeyId).collection('sessions').doc(sessionId); 
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
          'user_id' : user_id,
          'start_time' : start_time,
          'data_points' : dp_array
        }
        return session_json
      });
  }


/**
 * Format a number with the id format used on the database
 * @param {Integer} id 
 */
  formatID(id){
    let zeros = "00000";
    return  (zeros+id).slice(-zeros.length)
  }

  /**
   * Listen to a specific journey and returns any session that 
   * presents a change in it
   * @param {String} journeyId 
   */
  listenToJourenysSessions(journeyId){
    var sessions = db.collection("journeys").doc(journeyId).collection("sessions")
    .onSnapshot(function(docSnapShot) {
      docSnapShot.forEach(function(doc){
        if(doc.id !== "00000"){
          let changingSession = doc.data();
          //console.log("Current data: ", changingSession);
          journeyM.addRemoteCyclist(doc.id, changingSession);
          return changingSession;
          //current_position: {acceleration: 0, latitude: 40.1149175, longitude: -88.22143, speed: 0, suggestion: -1, …}
          //id_user: "mTgx1snPoAaYr3aCwKemtyIJNw63"
          //start_time: "2019/1/7 - 21:10:54"

        }
      })
    });
    return sessions;
  }


  /**
   * Sends a new rout with a specific Id to defined
   * positionPoints to the database
   * @param {String} id 
   * @param {JSON} positionPoints 
   */
  addNewRoute(id, positionPoints){
    for (var i = 0; i <= positionPoints.length; i++){
      if (positionPoints[i] != undefined){
        let zeros = "000";
        let ppId = (zeros+i).slice(-zeros.length);
        db.collection('routes').doc(id).collection('position_points').doc(ppId).set(positionPoints[i]);
        db.collection('routes').doc(id).set({loop:false});

      }
    }
  }


  /**
   * Switch the loop's value on a specific route
   * @param {String} id 
   * @param {Boolean} loop 
   */
  setRouteLoop(id, loop){
    db.collection('routes').doc(id).set({loop:loop});
  }


  /**
   * Sets a new journey on the database with a specific id and a 
   * reference route
   * @param {String} id 
   * @param {String} refRouteId 
   */
  addNewJourney(id, refRouteId){
    let refRoute = db.collection('routes').doc(refRouteId);
    db.collection('journeys').doc(id).set({reference_route:refRoute});
    console.log("new journey added");
  }


  /**
   * Adds a new new Ghost's session on a specific journey
   * @param {String} journeyId 
   */
  addNewGhostSession(jId){
    let journeyId = ""+jId;
    let time = new Date();
    let startTime = time.getFullYear()+"/"+time.getMonth()+"/"+time.getDate()+" - "+time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();
    let metaData = {
      id_user:"ghost",
      start_time:startTime
    };
    db.collection('journeys').doc(journeyId).collection('sessions').doc("00000").set(metaData);
    console.log("metaData added");
  }


  /**
   * Adds a new datapoint document with a specific id in a sepecific session from a specific journey
   * @param {String} jId 
   * @param {String} sessionId 
   * @param {Integer} dpId 
   * @param {JSON} dataPointDoc 
   */
  addNewDataPointInSession(jId, sessionId, dpId, dataPointDoc){
    let journeyId = ""+jId;
    let dataPointId =  ""+dpId;
    let zero_filled = '00000';
    let filledDataPointId = (zero_filled+dataPointId).slice(-zero_filled.length);
    db.collection('journeys').doc(journeyId).collection('sessions').doc(sessionId).collection("data_points").doc(filledDataPointId).set(dataPointDoc);
  }


  /**
   * Update the current ghost position on the database from a specific journey
   * @param {String} jId 
   * @param {JSON} dataPointDoc 
   */
  updateCurrentGhostPosition(jId, dataPointDoc){
    let journeyId = ""+jId;
    db.collection('journeys').doc(journeyId).collection('sessions').doc("00000").update({current_ghost_position:dataPointDoc});
  }
}