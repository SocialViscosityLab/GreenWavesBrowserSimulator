class Communication{
  constructor(){
  }

  addNewRoute(id,positionPoints){
    db.collection('routes').doc(id).set({'position_points':positionPoints});
    console.log("new route added");
  }
  addNewJourney(id, refRouteId){
    let journeyId = ""+id;
    let refRoute = db.collection('routes').doc(refRouteId);
    db.collection('journeys').doc(journeyId).set({reference_route:refRoute});
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
