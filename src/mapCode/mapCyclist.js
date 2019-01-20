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
    if (!this.marker){

      this.marker = L.circleMarker([this.cyclist.position.lat,this.cyclist.position.lon],
        {color:'blue', fillColor: 'blue', weight:1, stroke:true, radius:5}).addTo(theMap);

    }else{

      let newLatLng = new L.LatLng(this.cyclist.position.lat , this.cyclist.position.lon);

      // change the color of markers according to acceleration direction
      if (this.cyclist.myAcceleration > 0){

        this.marker.setStyle({color:'#00A86B', fillColor: '#00A86B', fill:true, fillOpacity: 0.4});

      } else{
        this.marker.setStyle({color:'red', fillColor: 'red', fill:true, fillOpacity: 0.4});
      }

      if (this.cyclist.status == "disabled"){
        this.marker.setStyle({color:'blue', fillColor: 'blue', fill:true, fillOpacity: 0.4});
      }

      this.marker.setLatLng(newLatLng);
    }
    // Update marker label
    let label =  "C: " + this.cyclist.id.id + " Tick: " + this.cyclist.timeCounter;

    //this.marker.bindPopup(label).openPopup();

  }
}
