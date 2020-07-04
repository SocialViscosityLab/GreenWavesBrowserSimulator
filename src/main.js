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

// Boolean to set if the database should be connected
let connect;


/**
Setup. It setups variables and initializes instances
*/
function setup() {
    //Set up to connect or not connect to the database
    connect = false;

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

/**
 * Activate journeys after some seconds. 
 */
function activateJourneyDelayed() {
    window.setTimeout(function createAndActivateJourney() {
        if (connect) {
            comm.getNewJourneyId2().then(activateJourneys);
        } else {
            activateJourneys();
        }
    }, GUI.ghostDelay.value * 1000);
}

/**
 * On HTML button click event it  activates journeys in the Journey Manager
 */
function activateJourneys() {
    // activate all the journeys
    let ghostSpeed = 0;
    // Set the sample rate
    sampleRate = Number(GUI.sampleRate.value);
    // As long as there are routes in the route manager
    if (routeM.routes.length > 0) {
        // Set a fresh journey ID in the Journey Manager 
        journeyM.setCurrentJourneyId(Communication.newJourneyId);
        // Activate all journeys and connect them to Firebase
        journeyM.activate(routeM.routes, ghostSpeed, sampleRate, currentMap);
        // Execute the run function at the frequency of the sampleRate
        clicker = setInterval(run, (1000 * sampleRate));
        // Update GUI with route computations
        for (const journey of journeyM.journeys) {
            GUI.updateRouteComputations(journey);
        }
    } else {
        alert("Setup routes first")
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
 * Creates or destroys the instance of Communication
 */
function connectFirebase() {
    comm = new Communication();
    connect = !connect;
    GUI.switchStatus(GUI.connectFirebase, connect, { t: "Connected", f: "Disconnected" });
    // Kill comm object
    if (connect == false) comm = undefined;
}

/**
 * Run the simulation
 */
function run() {


    // Record cyclists' data in the database while there are active journeys
    if (connect) {
        //This is for leaders
        journeyM.recordLeadersDataOnDataBase();
        //This is for simulated followers
        journeyM.recordLocalFollowersDataOnDataBase();
    }
    // Run cyclists
    journeyM.runCyclists(sampleRate);
    // plot all journeys
    currentMap.plotJourneys();
    // Plot green waves
    currentMap.plotGreenWaves();
    // Plot cyclists
    currentMap.plotCyclists();
    // Update elapsed time in GUI
    for (const leader of journeyM.leaders) {
        if (leader.status == 'enabled') {
            const id = leader.getJourney().referenceRoute.id;
            let element = document.getElementById(id);
            element.innerHTML = "<b>, Ellapsed time: </b>" + (((Date.now() - leader.getSession().startTime) / 1000) / 60).toFixed(2) + ' min.'
        }
    }

    // Terminate interval 
    // if (journeyM.areJourneysCompleted()) {
    //     clearInterval(clicker);
    //     alert("All journeys finalized");
    // }
}

/**
 * Add session to journey with nearest route
 */
function addCyclistListener() {
    currentMap.map.on('click', function(event) {
        // add ciclists
        if (journeyM.addLocalCyclist(event)) {
            // update mapJourneys
            currentMap.updateJourney();
        }
    });
}