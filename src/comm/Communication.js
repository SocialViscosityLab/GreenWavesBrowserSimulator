class Communication{
  constructor(){
    this.newJourneyId = 0;
  }

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

      //return newId;
    });
    return journeys;
  }

  listenToJourenysSessions(jId){
    var sessions = db.collection("journeys").doc(jId).collection("sessions")
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

  addNewRoute(id,positionPoints){
    for (var i = 0; i <= positionPoints.length; i++){
      if (positionPoints[i] != undefined){
        let zeros = "000";
        let ppId = (zeros+i).slice(-zeros.length);
        db.collection('routes').doc(id).collection('position_points').doc(ppId).set(positionPoints[i]);
        db.collection('routes').doc(id).set({loop:false});

      }
    }
    //console.log("new route added");
  }

  setRouteLoop(id, loop){
    db.collection('routes').doc(id).set({loop:loop});
  }


  addNewJourney(id, refRouteId){
    let refRoute = db.collection('routes').doc(refRouteId);
    db.collection('journeys').doc(id).set({reference_route:refRoute});
    console.log("new journey added");
  }

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

  addNewDataPointInSession(jId, sessionId, dpId, dataPointDoc){
    let journeyId = ""+jId;
    let dataPointId =  ""+dpId;
    let zero_filled = '00000';
    let filledDataPointId = (zero_filled+dataPointId).slice(-zero_filled.length);
    db.collection('journeys').doc(journeyId).collection('sessions').doc(sessionId).collection("data_points").doc(filledDataPointId).set(dataPointDoc);
  }

  updateCurrentGhostPosition(jId,dataPointDoc){
    let journeyId = ""+jId;
    db.collection('journeys').doc(journeyId).collection('sessions').doc("00000").update({current_ghost_position:dataPointDoc});
  }
}
