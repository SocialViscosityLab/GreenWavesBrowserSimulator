
let journey;
let currentRoute;
let currentMap;
let ellapsedTime;
let speed;
let sampleRate;
let speedRate;
let clicker;
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
}

/**
* Create the route markers of the cornerpoints on the map
*/
function setupRoute(){
	// Instantiate objects
	currentRoute = new Route();
	// The route points
	// let points = [[40.10146, -88.23445],[40.10143,-88.23860],[40.10409,-88.23863],[40.10409,-88.23345],[40.10146,-88.233385]];
	// initialize route
	//currentRoute.initiateRoutePoints(points);
	currentRoute.initiateRouteFromGeoJSON (directory.getJsonObjects()[0]);

	/**** Visualization  of route on Map *****/
	// add route to map
	currentMap.setupRoute(currentRoute);
	// plot route path on map
	currentMap.plotRoutes();
	// plot route corner points on map
	currentMap.plotRoutesCornerPoints()

	//workbench();
}

/**
* Opens or closes the route loop
*/
function switchLoop(){
	let btn = document.getElementById("loopButton");
	// if the is a route
	if (currentRoute){
		// switch the value
		if (btn.innerHTML == "Loop disabled"){
			currentRoute.setLoop(true);
			btn.innerHTML = "Loop enabled";
		}else {
			currentRoute.setLoop(false);
			btn.innerHTML = "Loop disabled";
		}
		// update route
		currentRoute.update();
		// plot route path on map
		currentMap.plotRoutes();
	} else {
		window.alert("Enable route first");
	}
}

function workbench(){

	let tmpPos = new Position(40.10343, -88.2384);

	let rtn = currentRoute.getClosestSegmentToPosition(tmpPos);

	console.log ("segment " + rtn);

}

/**
* MAIN FUNCTION, This activates the run() method in the window.setInterval()
*/
function activateJourney(){
	// Retrieve values from GUI
	speedRate = document.getElementById("speedRate").value;
	sampleRate = document.getElementById("sampleRate").value;

	if (currentRoute != undefined){
		// Instantiate journey
		journey = new Journey(0, currentRoute);
		// make route active
		journey.activateRoute(true);
		// Create Ghost session
		journey.addNewSession();
		// set Ghost session dataPoints
		journey.setupGhost();
		// Execute the run function at the frequency of the sampleRate
		clicker = setInterval(run, (1000*sampleRate));

		/**** Visualization  of journey on map *****/
		// add journey to map
		currentMap.setupJourney(journey);

		// **** generate all session points
		//journey.setGhostSessionPoints(speedRate, sampleRate);
		// **** display all session points
		//currentMap.displaySessionMarkers(0,0);

		// ******* Add session to journey ******
		currentMap.map.on('click', function(e) {
			// create a session
			let tmpSession = new Session("tst", new Date());
			// set session origin
			tmpSession.setOrigin(currentRoute, new Position(e.latlng.lat,e.latlng.lng), 3, 0);
			// add session to journey
			journey.addNewSession(tmpSession);
			//run();
			// update mapJourneys
			currentMap.updateJourney();
		});

	}else{
		alert("Route not initialized");
	}
}

/**
* Run the simulation
*/
function run(){
	if (!currentRoute.status){
		clearInterval(clicker);
		alert("Route finalized");
	}
	//run ghost
	//journey.runGhost(speedRate, sampleRate);
	journey.runSessions(speedRate, sampleRate);
	//journey.runSession(1,speedRate, sampleRate);
	//plot all journeys
	currentMap.plotJourneys();
	//plot dataPoints
	//currentMap.displaySessionMarker[0,0];
}
