
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
//The intance of the communication
let comm;
// Current selected route
let currentRoute;
//Current journey
let currentJourney;

var myOsc;
/**
Setup. It setups variables and initializes instances
*/
function setup(){
	//osc. This is currently used in the cyclcist's run() function.
	myOsc = new OSCSender();
	myOsc.enable(true);
	// GUI elements
	document.getElementById("routeButton").onclick = setupRoutes;
	document.getElementById("loopButton").onclick = switchRouteLoop;
	document.getElementById("activateJourney").onclick = 	createAndActivateJourney;

	// Instantiate and initialize the map
	currentMap = new Cartography();
	// Instantiate RouteManager
	routeM = new RouteManager();
	// Instantiate JourneyManager
	journeyM = new JourneyManager();
	comm = new Communication();
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
	currentRoute = routeM.routes[routeM.routes.length-1];
	comm.addNewRoute(currentRoute.id, currentRoute.getPositionPoints());
}
function createAndActivateJourney(){
	Promise.resolve(comm.getNewJourneyId()).then(activateJourneys);
}
/**
* On HTML button click event it opens or closes the route loop
*/
function switchRouteLoop(){
	routeM.switchRouteLoop(0, document.getElementById("loopButton"));
	// plot route path on map
	currentMap.plotRoutes();
  comm.setRouteLoop(currentRoute.id,currentRoute.loop);
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
	if (routeM.routes.length > 0){
		journeyM.setCurrentJourneyId(comm.newJourneyId);
		// Activate all journeys
		journeyM.activate(routeM.routes, ghostSpeed , sampleRate, currentMap);
		// Execute the run function at the frequency of the sampleRate
		clicker = setInterval(run, (1000*sampleRate));
		currentJourney = journeyM.getCurrentJourney();
		comm.addNewJourney(currentJourney.id,currentRoute.id);
		comm.addNewGhostSession(currentJourney.id);
		comm.listenToJourenysSessions(currentJourney.id);

	}else{
		alert("Setup routes first")
	}
}

/**
* Add session to journey with nearest route
*/
function addCyclistListener(){
	currentMap.map.on('click', function(event) {
		// add ciclists
		if (journeyM.addCyclist(event)){
			// update mapJourneys
			currentMap.updateJourney();
		}
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
		}else{
			let tempDP = journeyM.getCurrentJourney().sessions[0].getLastDataPoint()
			comm.updateCurrentGhostPosition(currentJourney.id,currentJourney.sessions[0].getLastDataPoint().getDoc())
			comm.addNewDataPointInSession(currentJourney.id, "00000", currentJourney.sessions[0].dataPoints.length-1, currentJourney.sessions[0].getLastDataPoint().getDoc());
		}
	}
	// Run cyclists
	journeyM.runCyclists(sampleRate);
	//plot all journeys
	currentMap.plotJourneys();
	//plot dataPoints
	//currentMap.displaySessionMarker[0,0];
	// plot green waves
	currentMap.plotGreenWaves();
	// plot cyclists
	currentMap.plotCyclists();

}
