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
  plotRouteCornerPoints(theMap){

    for (let i = 0; i < this.route.routePoints.length; i++) {

      if (this.routeMarkers[i] == undefined){

        this.routeMarkers[i] = L.circleMarker([this.route.routePoints[i].lat , this.route.routePoints[i].lon],
          {color:'red', opacity:0.5, weight:1, stroke:false}).addTo(theMap);

          this.routeMarkers[i].setRadius(5);

          let label = "point"+i;

        //  this.routeMarkers[i].bindPopup(label).openPopup();

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
        this.pathPolyline = L.polyline(this.route.getRouteLatLongs(), {color: '#FF69B4', weight:2, opacity: 0.3}).addTo(theMap);
      } else {
        // remove the current pathPolyline
        theMap.removeLayer(this.pathPolyline);

        // add a new one
        this.pathPolyline = L.polyline(this.route.getRouteLatLongs(), {color: '#FF69B4', weight:2, opacity: 0.3}).addTo(theMap);
      }
    }
  }
