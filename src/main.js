
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
// Boolean to set if the database should be connected
let connect;
/**
Setup. It setups variables and initializes instances
*/
function setup() {

	//Set up to connect or not connect to the database
	connect = false;
	//osc. This is currently used in the cyclcist's run() function.
	//myOsc = new OSCSender();
	//myOsc.enable(false);
	// GUI elements
	document.getElementById("routeButton").onclick = setupRoutes;
	document.getElementById("loopButton").onclick = switchRouteLoop;
	document.getElementById("activateJourney").onclick = createAndActivateJourney;
	document.getElementById("connectFirebase").onclick = connectFirebase;
	document.getElementById("getFirebaseData").onclick = getFirebaseData;

	// Instantiate and initialize the map
	currentMap = new Cartography();
	// Instantiate RouteManager
	routeM = new RouteManager();
	// Instantiate JourneyManager
	journeyM = new JourneyManager();
	// instance made to read and write files to this computer from the browser
	directory = new DirectoryReader();
	// activate cyclist addition listener
	this.addCyclistListener();
}

/**
* On HTML button click event it create the route markers of the cornerpoints on the map
*/
function setupRoutes() {
	// Get routes from directory and set them up.
	routeM.setupRoutes(directory, currentMap);
	/**** Visualization  of route on Map *****/
	// plot route path on map
	currentMap.plotRoutes();
	// plot route corner points on map
	currentMap.plotRoutesCornerPoints();
	currentRoute = routeM.routes[routeM.routes.length - 1];
	if (connect) {
		// adds route to firebase
		comm.addNewRoute(currentRoute.id, currentRoute.getPositionPoints());
	}
}

function createAndActivateJourney() {
	if (connect) {
		Promise.resolve(comm.getNewJourneyId()).then(activateJourneys);
	} else {
		activateJourneys();
	}
}
/**
* On HTML button click event it opens or closes the route loop
*/
function switchRouteLoop() {
	routeM.switchRouteLoop(0, document.getElementById("loopButton"));
	// plot route path on map
	currentMap.plotRoutes();
	if (connect) {
		comm.setRouteLoop(currentRoute.id, currentRoute.loop);
	}
}

/**
* On HTML button click event it  activates journeys in the Journey Manager
*/
function activateJourneys() {
	// activate all the journeys
	let ghostSpeed = Number(document.getElementById("speed").value);
	sampleRate = Number(document.getElementById("sampleRate").value);
	if (routeM.routes.length > 0) {
		if (connect) {
			journeyM.setCurrentJourneyId(comm.newJourneyId);
		} else {
			journeyM.setCurrentJourneyId("00000");
		}
		// Activate all journeys
		journeyM.activate(routeM.routes, ghostSpeed, sampleRate, currentMap);
		// Execute the run function at the frequency of the sampleRate
		clicker = setInterval(run, (1000 * sampleRate));
		currentJourney = journeyM.getCurrentJourney();

		if (connect) {
			// Adds new journey to firebase
			comm.addNewJourney(currentJourney.id, currentRoute.id);
			// Adds new session to firebase
			comm.addNewGhostSession(currentJourney.id);
			// Activates session change listener in firebase
			comm.listenToJourenysSessions(currentJourney.id);
		}
	} else {
		alert("Setup routes first")
	}
}

function connectFirebase() {
	comm = new Communication();
	connect = !connect;
	if (connect) {
		document.getElementById("databaseConnection").innerHTML = "connected";
	} else {
		comm = undefined;
		document.getElementById("databaseConnection").innerHTML = "disconnected";
	}
}

function getFirebaseData() {
	if (connect) {
		let idJourney = document.getElementById("idJourney").value;
		let idSession = document.getElementById("idSession").value;
		console.log("Journey: " + idJourney + ", Session: " + idSession);

		let result = comm.getSession(idJourney, idSession).then(
			saveJSON({'a':0, "b":[1,2]}, "test.json"))
	} else {
		alert("It seems that the connection to Firebase is dissabled. Connect to Firebase and tru again")
	}
}

/**
* Add session to journey with nearest route
*/
function addCyclistListener() {
	currentMap.map.on('click', function (event) {
		// add ciclists
		if (journeyM.addCyclist(event)) {
			// update mapJourneys
			currentMap.updateJourney();
		}
	});
}


/**
* Run the simulation
*/
function run() {
	for (let routeTmp of routeM.routes) {
		if (!routeTmp.status) {
			clearInterval(clicker);
			alert("Route finalized");
		} else {
			let tempDP = journeyM.getCurrentJourney().sessions[0].getLastDataPoint()
			if (connect) {
				comm.updateCurrentGhostPosition(currentJourney.id, currentJourney.sessions[0].getLastDataPoint().getDoc())
				comm.addNewDataPointInSession(currentJourney.id, "00000", currentJourney.sessions[0].dataPoints.length - 1, currentJourney.sessions[0].getLastDataPoint().getDoc());
			}
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
