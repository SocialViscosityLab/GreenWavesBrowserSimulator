
/** The collection of journeys in thjis simulation*/
let journeys = [];
/** The collection of routes in this simulation*/
let currentRoutes = [];
/** The instance of Cartography displayed in browser*/
let currentMap;
/***/
let ellapsedTime;
/***/
let speed;
/** The period of time used to trigger each step of the simulator and record data from vehicles*/
let sampleRate;
/***/
let speedRate;
/** The interval object controlling the simuation internal clock*/
let clicker;
/***/
let directory;

/**
Setups the variables
*/
function setup(){
	ellapsedTime = document.getElementById("ellapsedTime");
	speed = document.getElementById("speed");
	document.getElementById("routeButton").onclick = setupRoute;
	document.getElementById("loopButton").onclick = switchLoop;
	document.getElementById("activateJourney").onclick = activateJourney;
	// Instantiate and initialize the map
	currentMap = new Cartography();
	//new Communication();
	directory = new DirectoryReader();

	//workbench();
}

/**
* Create the route markers of the cornerpoints on the map
*/
function setupRoute(){
	let routes = directory.getJsonObjects();
	for (let points of routes){
		// Instantiate objects
		let routeTmp = new Route();
		// The route points
		// let points = [[40.10146, -88.23445],[40.10143,-88.23860],[40.10409,-88.23863],[40.10409,-88.23345],[40.10146,-88.233385]];
		// initialize route
		//currentRoute.initiateRoutePoints(points);
		routeTmp.initiateRouteFromGeoJSON (points);
		// add route to map
		currentMap.setupRoute(routeTmp);
		// store route
		currentRoutes.push(routeTmp);
	}

	/**** Visualization  of route on Map *****/
	// plot route path on map
	currentMap.plotRoutes();
	// plot route corner points on map
	currentMap.plotRoutesCornerPoints()
}

/**
* Opens or closes the route loop
*/
function switchLoop(){
	let btn = document.getElementById("loopButton");
	// if the is a route
	if (currentRoutes[0]){
		// switch the value
		if (btn.innerHTML == "Loop disabled"){
			currentRoutes[0].setLoop(true);
			btn.innerHTML = "Loop enabled";
		}else {
			currentRoutes[0].setLoop(false);
			btn.innerHTML = "Loop disabled";
		}
		// update route
		currentRoutes[0].update();
		// plot route path on map
		currentMap.plotRoutes();

	} else {
		window.alert("Enable route first");
	}
}

function workbench(){

	let coll = [1,2,3,4,5];

	console.log( coll.slice(coll.length - 6, coll.length));


}

/**
* MAIN FUNCTION, This activates the run() method in the window.setInterval()
*/
function activateJourney(){
	// Retrieve values from GUI
	speedRate = document.getElementById("speedRate").value;
	sampleRate = document.getElementById("sampleRate").value;

	for (let routeTmp of currentRoutes){
		if (routeTmp != undefined){
			// Instantiate journey
			journeyTmp = new Journey(0, routeTmp);
			// make route active
			journeyTmp.activateRoute(true);
			// Create Ghost session
			journeyTmp.addNewSession();
			// set Ghost session dataPoints
			journeyTmp.setupGhost();
			// Execute the run function at the frequency of the sampleRate
			clicker = setInterval(run, (1000*sampleRate));

			/**** Visualization  of journey on map *****/
			// add journey to map
			currentMap.setupJourney(journeyTmp);

			// **** generate all session points
			//journeyTmp.setGhostSessionPoints(speedRate, sampleRate);
			// **** display all session points
			//currentMap.displaySessionMarkers(0,0);

			journeys.push(journeyTmp);

			// ******* Add session to journey ******
			currentMap.map.on('click', function(e) {
				// create a session
				let tmpSession = new Session("tst", new Date());
				// set session origin
				tmpSession.setOrigin(routeTmp, new Position(e.latlng.lat,e.latlng.lng), 3, 0);
				// add session to journey
				journeyTmp.addNewSession(tmpSession);
				//run();
				// update mapJourneys
				currentMap.updateJourney();
			});

		}else{
			alert("Route not initialized");
		}
	}

}

/**
* Run the simulation
*/
function run(){
	for(let routeTmp of currentRoutes){
		if (!routeTmp.status){
			clearInterval(clicker);
			alert("Route finalized");
		}
	}

	for(let journeyTmp of journeys){
		//run ghost
		//journey.runGhost(speedRate, sampleRate);
		journeyTmp.runSessions(speedRate, sampleRate);
		//journey.runSession(1,speedRate, sampleRate);
	}
	//plot all journeys
	currentMap.plotJourneys();
	//plot dataPoints
	//currentMap.displaySessionMarker[0,0];
	// plot green waves
	currentMap.plotGreenWaves();
}
