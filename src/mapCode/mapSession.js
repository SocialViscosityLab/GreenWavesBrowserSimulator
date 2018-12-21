/**
The visualization class of Session class.
@param {Session} session The session associated to this class
*/
class MapSession{

  constructor(session){
    this.session = session;
    this.sessionMarkers = [];
    this.pathPolyline;
  }

  getID(){
    return this.session.id_user;
  }

/**
* Plots the session path on the map
* @param {Cartography} theMap An instance of Cartography that contauins the Leaflet map
*/
  plotPath(theMap){
    let counter = 0
  //  theMap.plotPath(this.session.getSessionLatLongs(), '#0088cc', 2 , 0.1);
    if (this.pathPolyline == undefined){
      this.pathPolyline = L.polyline(this.session.getSessionLatLongs(), {color: '#00FFFF', weight:2,  opacity: 0.2}).addTo(theMap.map);
    } else {
      // remove the current pathPolyline
      theMap.map.removeLayer(this.pathPolyline);
      // add a new one
      this.pathPolyline = L.polyline(this.session.getSessionLatLongs(), {color: '#00FFFF', weight:2, opacity: 0.2}).addTo(theMap.map);
    }
  }
  /**
  * Adds markers for all datapoints of the session
  * @param {Cartography} theMap An instance of Cartography that contauins the Leaflet map
  */
  markSessionAllDataPoints(theMap){
    for (var i = 0; i < this.session.dataPoints.length; i++) {

      if (this.sessionMarkers[i] == undefined){

        this.sessionMarkers[i] = L.marker([this.session.dataPoints[i].position.lat,this.session.dataPoints[i].position.lon]).addTo(theMap);

        let label =  this.sessionID + ": " + this.session.dataPoints[i].time + " s";

        this.sessionMarkers[i].bindPopup(label).openPopup();
      }else{

        let newLatLng = new L.LatLng(this.session.dataPoints[i].position.lat , this.session.dataPoints[i].position.lon);

        this.sessionMarkers[i].setLatLng(newLatLng);
      }
    }
  }

  /**
  * Adds markers for the last datapoint of this
  @param {Cartography} theMap An instance of Cartography that contauins the Leaflet map
  */
  markSessionCurrentPoint(theMap){
    // get the last dataPoint of the sessions
    let last = this.session.dataPoints[this.session.dataPoints.length-1];

    // for the first marker
    if (this.sessionMarkers[0] == undefined){

      this.sessionMarkers[0] = L.marker([last.position.lat,last.position.lon]).addTo(theMap.map);

    }else{

      let newLatLng = new L.LatLng(last.position.lat , last.position.lon);

      this.sessionMarkers[0].setLatLng(newLatLng);
    }
    // Update marker label
    let label =  "ID: " + this.session.id_user + " Tick: " + last.time ;

    this.sessionMarkers[0].bindPopup(label).openPopup();

  }
}
