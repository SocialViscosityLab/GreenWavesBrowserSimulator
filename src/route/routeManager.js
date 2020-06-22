/**
*
Convenient class to manage all the journeys
*/
class RouteManager {
    constructor() {
        /** The collection of routes in this simulation*/
        this.routes = [];
    }

    /**
     * Create the route markers of the cornerpoints on the map
     */
    setupRoutes(directory, currentMap) {
        this.routes = [];
        // These are the files read from the directory. They might not be route files, yet they might all be JSON files.
        let jSONroutes = directory.getJsonObjects();
        let routeTmp;
        if (jSONroutes.length > 0) {
            for (let points of jSONroutes) {

                // Skip files with no route info
                if (points.features == undefined || points.features.length < 1) {
                    continue;
                }

                // Instantiate objects
                routeTmp = new Route(points.features[0].properties.name);
                routeTmp.initiateRouteFromGeoJSON(points.features[0]);
                // add route to map
                currentMap.setupRoute(routeTmp);
                // store route
                this.routes.push(routeTmp);
            }
            if (this.routes.length > 0) {
                currentMap.recenter(this.routes[this.routes.length - 1].routePoints[0]);
            } else {
                alert("No route activated. Files do not contain routes in the right format. See route.js class documentation")
            }
        } else {
            // The route points
            let points = [
                [40.10146, -88.23445],
                [40.10143, -88.23860],
                [40.10409, -88.23863],
                [40.10409, -88.23345],
                [40.10146, -88.233385]
            ];
            // initialize route
            routeTmp = new Route("Pilot route");
            routeTmp.initiateRoutePoints(points);
            // add route to map
            currentMap.setupRoute(routeTmp);
            // store route
            this.routes.push(routeTmp);
        }
    }

    /**
     * Creates a single route from JSON cornerpoints. It is usually used to import routes into the analysis tool
     * @param {Array} cornerPoints Array of lat lon points
     * @param {Cartography} currentMap An instance of Cartography currently displayed on canvas
     */
    setupSingleRoute(name, cornerPoints, currentMap) {
        let routeTmp;
        if (cornerPoints.length > 0) {
            // Instantiate objects
            if (name) {
                routeTmp = new Route(name);
            } else {
                routeTmp = new Route('reference route');
            }
            routeTmp.initiateRouteFromJourneyJSON(cornerPoints);
            // add route to map
            currentMap.setupRoute(routeTmp);
            // store route
            this.routes.push(routeTmp);
            currentMap.recenter(this.routes[this.routes.length - 1].routePoints[0]);
        } else {
            alert("No corner points in route");
        }
    }

    /**
     * Opens or closes the route loop
     */
    switchRouteLoop(id, btn) {
        // if there is a route
        if (this.routes[id]) {
            // switch the value
            if (btn.innerHTML == "Enable loop") {
                this.routes[id].setLoop(true);
                btn.innerHTML = "Disable loop";
            } else {
                this.routes[id].setLoop(false);
                btn.innerHTML = "Enable loop";
            }
            // update route
            this.routes[id].update();
        } else {
            window.alert("Enable route first");
        }
    }
}