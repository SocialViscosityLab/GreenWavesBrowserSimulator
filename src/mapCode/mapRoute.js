/**
The visualization class of Route class.
@param {Route} route The route associated to this class
*/
class MapRoute {
    constructor(route) {
        this.route = route;
        this.routeMarkers = [];
        this.pathPolyline;
    }

    /**
     * Create the route markers of the corner points on the map
     */
    plotRouteCornerPoints(theMap) {
        let properties = { color: 'green', opacity: 0.6, weight: 1, stroke: false };

        for (let i = 0; i < this.route.routePoints.length; i++) {

            if (this.routeMarkers[i] == undefined) {

                let tmpType = this.route.vertexTypes[i];

                if (tmpType === 'corner') {
                    properties = { color: '#237187', weight: 2, opacity: 0.6, fillOpacity: 1, fillColor: '#21CCFF' }
                } else if (tmpType === 'stop') {
                    properties = { color: '#75236E', weight: 2, opacity: 0.6, fillOpacity: 1, fillColor: '#E01DCE' }
                } else if (tmpType === 'light') {
                    properties = { color: 'red', weight: 2, fillOpacity: 1, fillColor: 'red' }
                }

                let marker = L.circleMarker([this.route.routePoints[i].lat, this.route.routePoints[i].lon], properties);

                this.routeMarkers[i] = marker.addTo(theMap);

                this.routeMarkers[i].setRadius(5);

                this.routeMarkers[i].bindPopup(tmpType).openPopup();

            } else {

                let newLatLng = new L.LatLng(this.route.routePoints[i].lat, this.route.routePoints[i].lon);

                this.routeMarkers[i].setLatLng(newLatLng);
            }
        }
    }

    /**
     * Display a polyline on the map
     */
    plotPath(theMap) {
        let properties = { color: '#AA07B7', weight: 4, opacity: .5, dashArray: "7", dashOffset: "7" };

        if (this.pathPolyline == undefined) {
            this.pathPolyline = L.polyline(this.route.getRouteLatLongs(), properties).addTo(theMap);
        } else {
            // remove the current pathPolyline
            theMap.removeLayer(this.pathPolyline);

            // add a new one
            this.pathPolyline = L.polyline(this.route.getRouteLatLongs(), properties).addTo(theMap);
        }
    }
}