
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
	document.getElementById("connectFirebase").onclick = connectFirebase;
	document.getElementById("getSessionData").onclick = getFirebaseData;
	document.getElementById("showJourney").onclick = createAndActivateJourney;
	/**
	 * @todo: 
	 * 1. with the route reference we should create a query to get the route and create a route object with it
	 * 2. With the journeyManager, we will import the journey data
	 */

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
		activateJourneys();
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
	if (routeM.routes.length > 0) {
		journeyM.setCurrentJourneyId("00000");
		// Activate all journeys
		//journeyM.activate(routeM.routes, Number(0), 0, currentMap);
		// Execute the run function at the frequency of the sampleRate
		clicker = setInterval(run, (1000));
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
		//let idJourney = '00195';
		Promise.resolve(comm.getJourney(idJourney)).then(journey => {
			//saveJSON(journey, idJourney+".json")
			// Creates the route for the retrieved journey
			routeM.setupSingleRoute(journey.ref_route,currentMap)
			// Updates the current route
			currentRoute = routeM.routes[routeM.routes.length - 1];
			// Creates a journey from the retrieved journey data 
			journeyM.importJourney(idJourney,currentRoute,journey.sessions,currentMap)
			console.log(journey)
		})
	} else {
		alert("It seems that the connection to Firebase is dissabled. Connect to Firebase and try again")
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
	clearInterval(clicker);
}
