// The journey manager in this simulation
let journeyM;
// The routes manager in this simulation
let routeM;
// The instance of Cartography displayed in browser/
let currentMap;
// The period of time used to trigger each step of the simulator and record data from vehicles
//let sampleRate;
// The interval object controlling the simuation internal clock
//let clicker;
// The instance that reads files from the hard drive
let directory;
//The intance of the communication
let comm;
// Current selected route
let currentRoute;
//Current journey
//let currentJourney;

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
    GUIAnalysis.onClick("connectFirebase", connectFirebase);
    GUIAnalysis.onClick("getJourneyData", getFirebaseData);
    GUIAnalysis.onClick("showJourney", createAndActivateJourney);
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
    // this.addCyclistListener();
}

function createAndActivateJourney() {
    // Creates the route for the uploaded journey
    if (jsonObjects[0]) {
        createRouteAndJourneys(jsonObjects[0]);
        activateJourneys();
    } else {
        alert("Wrong journey ID")
    }
}

/**
 * On HTML button click event it  activates journeys in the Journey Manager
 */
function activateJourneys() {
    // activate all the journeys
    if (routeM.routes.length > 0) {
        GUIAnalysis.updateRouteName(routeM.routes[0].id);
        // Display journey
        displayJourney()
    } else {
        alert("No journey to be displayed in Journey Manager")
    }
}

/**
 * Connects to database on the cloud to read (or write) data
 */
function connectFirebase() {
    comm = new Communication();
    connect = !connect;
    if (connect) {
        GUIAnalysis.connectFirebase.innerHTML = "Firebase enabled";
        GUIAnalysis.connectFirebase.style.background = "red";
    } else {
        comm = undefined;
        GUIAnalysis.connectFirebase.innerHTML = "Firebase disabled";
        GUIAnalysis.connectFirebase.style.background = "brown";
    }
}

/**
 * Retrieve data from the database
 */
function getFirebaseData() {
    if (connect) {
        // gets the journey id from the GUI input box
        let idJourney = GUIAnalysis.idJourney.value;
        if (idJourney.length == 5) {

            Promise.resolve(comm.getJourney(idJourney)).then(journey => {
                saveJSON(journey, idJourney + ".json");
                // Creates the route for the retrieved journey
                createRouteAndJourneys(journey);
                // Activate journey and display it on the map
                activateJourneys();
            })
        } else {
            alert("Double check journey ID. It should have the form 00000")
        }
    } else {
        alert("It seems that the connection to Firebase is dissabled. Connect to Firebase and try again")
    }
}

/**
 * Internal function to create route and journeys in the route and journey managers
 * @param {JSON} downloadedJourney 
 */

function createRouteAndJourneys(downloadedJourney) {
    routeM.setupSingleRoute(
        downloadedJourney.ref_route.name,
        downloadedJourney.ref_route.position_points,
        downloadedJourney.ref_route.vertex_types,
        currentMap);
    // Updates the current route
    currentRoute = routeM.routes[routeM.routes.length - 1];
    // Creates a journey from the retrieved journey data 
    journeyM.importJourney(downloadedJourney.ref_route.name, currentRoute, downloadedJourney.sessions, currentMap)
}

/**
 * display data
 */
function displayJourney() {
    // ALWAYS invoke this methods to display the latest condition of each journey and its sessions
    currentMap.updateJourney();
    //**Run cyclists
    //journeyM.runCyclists(sampleRate);
    //**plot all journeys
    currentMap.plotJourneys();
    //**plot routes
    currentMap.plotRoutes();
    currentMap.plotRoutesCornerPoints();
    //**plot dataPoints
    //currentMap.displaySessionMarker[0, 0];
    //** plot green waves
    //currentMap.plotGreenWaves();
    //**plot cyclists
    currentMap.plotCyclists();
    //**plot markers on top of datapoints
    currentMap.displaySessionMarkers(30000);
}