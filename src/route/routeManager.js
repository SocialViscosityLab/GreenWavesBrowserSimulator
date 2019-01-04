/**
*
Convenient class to manage all the journeys
*/
class RouteManager{
  constructor(){
    /** The collection of routes in this simulation*/
    this.routes = [];
  }

  /**
  * Create the route markers of the cornerpoints on the map
  */
  setupRoutes(directory, currentMap){
  	let jSONroutes = directory.getJsonObjects();
  //	for (let points of jSONroutes){
  	// Instantiate objects
  	let routeTmp = new Route();
  	//********* COMMENT FROM HERE
  	// The route points
  	let points = [[40.10146, -88.23445],[40.10143,-88.23860],[40.10409,-88.23863],[40.10409,-88.23345],[40.10146,-88.233385]];
  	// initialize route
  	routeTmp.initiateRoutePoints(points);
  	//********* UNTIL HERE
  	//routeTmp.initiateRouteFromGeoJSON (points);
  	// add route to map
  	currentMap.setupRoute(routeTmp);
  	// store route
  	this.routes.push(routeTmp);
  	//}
  }

  /**
  * Opens or closes the route loop
  */
  switchRouteLoop(id, btn){
  	// if there is a route
  	if (this.routes[id]){
  		// switch the value
  		if (btn.innerHTML == "Loop disabled"){
  			this.routes[id].setLoop(true);
  			btn.innerHTML = "Loop enabled";
  		}else {
  			this.routes[id].setLoop(false);
  			btn.innerHTML = "Loop disabled";
  		}
  		// update route
  		this.routes[id].update();
  	} else {
  		window.alert("Enable route first");
  	}
  }
}
