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
    GUI.routeButton.onclick = setupRoutes;
    GUI.loopButton.onclick = switchRouteLoop;
    GUI.activateJourney.onclick = activateJourneyDelayed;
    GUI.connectFirebase.onclick = connectFirebase;

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
    // Updates the current route with the last uploaded route
    currentRoute = routeM.routes[routeM.routes.length - 1];
    if (connect) {
        // adds route to firebase
        comm.addNewRoute(currentRoute.id, currentRoute.getPositionPoints());
    }
}

function activateJourneyDelayed() {
    window.setTimeout(createAndActivateJourney, GUI.ghostDelay.value * 1000);
}

function createAndActivateJourney() {
    if (connect) {
        comm.getNewJourneyId().then(activateJourneys);
    } else {
        window.setTimeout(activateJourneys, GUI.ghostDelay.value * 1000);
    }
}
/**
 * On HTML button click event it opens or closes the route loop
 */
function switchRouteLoop() {
    routeM.switchRouteLoop(0, GUI.loopButton);
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
    let ghostSpeed = Number(GUI.speed.value);
    sampleRate = Number(GUI.sampleRate.value);
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
        // Route computations
        GUI.routeName.innerHTML = "<b>Route Name: </b>" + currentJourney.referenceRoute.id + ', ';
        GUI.journeyID.innerHTML = "<b>Journey ID: </b>" + currentJourney.id;
        GUI.routeDistance.innerHTML = "<b>- Total length: </b>" + currentRoute.getTotalLength() + ' m,';
        GUI.estimatedDuration.innerHTML = "<b>Anticipated duration: </b>" + currentRoute.getDuration(GUI.speed.value, 'min').toFixed(2) + ' min,';
        GUI.startTime.innerHTML = "<b>Start time: </b>" + currentJourney.sessions[0].startTime;
    } else {
        alert("Setup routes first")
    }
}

function connectFirebase() {
    comm = new Communication();
    connect = !connect;
    if (connect) {
        GUI.connectFirebase.textContent = "Connected";
        GUI.connectFirebase.style.color = "red";
    } else {
        comm = undefined;
        GUI.connectFirebase.textContent = "Disconnected";
        GUI.connectFirebase.style.color = "black";
    }
}

/**
 * Save Jsons files
 */
function saveSessionOnJson() {

}

/**
 * Add session to journey with nearest route
 */
function addCyclistListener() {
    currentMap.map.on('click', function(event) {
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

    // This chunk of code records ghost data in the database while the route is active

    if (journeyM.areJourneysCompleted()) {
        clearInterval(clicker);
        alert("All journeys finalized");
    }

    // Record data on database
    if (connect) {
        //This is for leaders
        journeyM.recordLeadersDataOnDataBase(comm);
        //This is for simulated followers
        journeyM.recordFollowersDataOnDataBase(comm);
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

    if (journeyM.leaders[0].status == "enabled") {
        GUI.ellapsedTime.innerHTML = "<b>Ellapsed time: </b>" + (((Date.now() - currentJourney.sessions[0].startTime) / 1000) / 60).toFixed(2) + ' min,';
    }
}