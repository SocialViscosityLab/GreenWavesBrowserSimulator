
// The journey manager in this simulation
let journeyM;
// The routes manager in this simulation
let routeM;
// The instance of Cartography displayed in browser/
let currentMap;
// The period of time used to trigger each step of the simulator and record data from vehicles
let sampleRate;
// The interval object controlling the simuation internal clock
let clicker;
// The instance that reads files from the hard drive
let directory;
//  temporal to simulate new cyclists id_user
let appID = 0;

/**
P5.js Setup. It setups variables and initializes instances
*/
function setup(){
	document.getElementById("routeButton").onclick = setupRoutes;
	document.getElementById("loopButton").onclick = switchRouteLoop;
	document.getElementById("activateJourney").onclick = activateJourneys;
	// Instantiate and initialize the map
	currentMap = new Cartography();
	// Instantiate RouteManager
	routeM = new RouteManager();
	// Instantiate JourneyManager
	journeyM = new JourneyManager();
	//new Communication();
	directory = new DirectoryReader();
	// activate cyclist addition listener
	this.addCyclistListener();

	//workbench();
}

/**
* On HTML button click event it create the route markers of the cornerpoints on the map
*/
function setupRoutes(){
	// Get routes from directory and set them up.
	routeM.setupRoutes(directory, currentMap);
	/**** Visualization  of route on Map *****/
	// plot route path on map
	currentMap.plotRoutes();
	// plot route corner points on map
	currentMap.plotRoutesCornerPoints();
}

/**
* On HTML button click event it opens or closes the route loop
*/
function switchRouteLoop(){
	routeM.switchRouteLoop(0, document.getElementById("loopButton"));
	// plot route path on map
	currentMap.plotRoutes();
}

function workbench(){
	let coll = [1,2,3,4,5];
	console.log( coll.slice(coll.length - 6, coll.length));
}

/**
* On HTML button click event it  activates journeys in the Journey Manager
*/
function activateJourneys(){
	// activate all the journeys
	let ghostSpeed = Number(document.getElementById("speed").value);
	sampleRate = Number(document.getElementById("sampleRate").value);
	// Activate all journeys
	journeyM.activate(routeM.routes, ghostSpeed , sampleRate, currentMap);
	// Execute the run function at the frequency of the sampleRate
	clicker = setInterval(run, (1000*sampleRate));
}

/**
* Add session to journey with nearest route
*/
function addCyclistListener(){
	currentMap.map.on('click', function(e) {
		let eventLocation = new Position (e.latlng.lat,e.latlng.lng);
		// retrive the journey with the nearest route to event location
		let journeyTmp = journeyM.getNearestTo(eventLocation); /*&^%$#@! DO this /*&^%$#@! /*&^%$#@! /*&^%$#@! /*&^%$#@! */
		// create a cyclists
		let cyclistTmp = new Cyclist("myAppID_"+appID, eventLocation, 3);
		appID++;
		// create a session for that cyclist
		let tmpSession = new Session(cyclistTmp);
		// add session to journey
		journeyTmp.addNewSession(tmpSession);
		// update mapJourneys
		currentMap.updateJourney();
	});
}


/**
* Run the simulation
*/
function run(){
	for(let routeTmp of routeM.routes){
		if (!routeTmp.status){
			clearInterval(clicker);
			alert("Route finalized");
		}
	}
	// Run sessions
	journeyM.runSessions(sampleRate);
	//plot all journeys
	currentMap.plotJourneys();
	//plot dataPoints
	//currentMap.displaySessionMarker[0,0];
	// plot green waves
	currentMap.plotGreenWaves();
}
