/**
The visualization class of Session class.
@param {Cyclist} session The session associated to this class
*/
class MapCyclist{

  constructor(cyclist){
    this.cyclist = cyclist;
    this.marker;
  }

  getID(){
    return this.cyclist.id;
  }

  /**
  * Adds a marker for the cyclist position
  @param {Cartography} theMap An instance of Cartography class that contains the Leaflet map
  */
  plotMarker(theMap){

    // for the first marker
    if (this.marker == undefined){

      this.marker = L.marker([this.cyclist.position.lat,this.cyclist.position.lon]).addTo(theMap);

    }else{

      let newLatLng = new L.LatLng(this.cyclist.position.lat , this.cyclist.position.lon);

      this.marker.setLatLng(newLatLng);
    }
    // Update marker label
    let label =  "C: " + this.cyclist.id.id + " Tick: " + this.cyclist.timeCounter;

    this.marker.bindPopup(label).openPopup();

  }
}
