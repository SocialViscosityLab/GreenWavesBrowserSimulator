/**
The visualization class of Route class.
@param {Route} route The route associated to this class
*/
class MapRoute{
  constructor(route){
    this.route = route;
    this.routeMarkers = [];
    this.pathPolyline;
  }

  /**
  * Create the route markers of the corner points on the map
  */
  plotRouteCornerPoints(){

    for (let i = 0; i < this.route.routePoints.length; i++) {

      if (this.routeMarkers[i] == undefined){

        this.routeMarkers[i] = L.marker([this.route.routePoints[i].lat , this.route.routePoints[i].lon]).addTo(this.map);

        let label = "point"+i;

        this.routeMarkers[i].bindPopup(label).openPopup();

      } else {

        let newLatLng = new L.LatLng(this.route.routePoints[i].lat , this.route.routePoints[i].lon);

        this.routeMarkers[i].setLatLng(newLatLng);
      }
    }
  }

  /**
  * Display a polyline on the map
  */
  plotPath(theMap){
    if (this.pathPolyline == undefined){
      this.pathPolyline = L.polyline(this.route.getRouteLatLongs(), {color: '#FF69B4', weight:1}).addTo(theMap);
    } else {
      // remove the current pathPolyline
      theMap.removePolyline(this.pathPolyline);
      // add a new one
      this.pathPolyline = L.polyline(this.route.getRouteLatLongs(), {color: '#FF69B4', weight:1}).addTo(theMap);
    }
  }
}
