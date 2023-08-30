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

// statistical values
let analysis;
let dataLoaded = false;

// visualization
let barChart;

/**
Setup. It setups variables and initializes instances
*/
function setup() {

    createCanvas(1200, 800, SVG)

    //Set up to connect or not connect to the database
    connect = false;

    // GUI elements
    GUIAnalysis.onClick("connectFirebase", connectFirebase);
    GUIAnalysis.onClick("getJourneyData", getFirebaseData);
    GUIAnalysis.onClick("showJourney", createAndActivateJourney);

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

function analyzeData() {
    let result = AnalysisUtils.getDistanceToAttractorAtTimeSteps();

    for (let i = 0; i < result.length; i++) {
        const element = result[i];
        element.meanDistance = ss.mean(element.distance);
        element.sdDistance = ss.sampleStandardDeviation(element.distance);
    }
    analysis = result;

    return result;
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
        GUIAnalysis.updateRouteLength(routeM.routes[0].getTotalLength().toFixed(2));
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

    //**Plot all journeys
    currentMap.plotJourneys();

    //**Plot routes
    //currentMap.plotRoutes();
    currentMap.plotRoutesCornerPoints();

    //**Plot dataPoints
    //currentMap.displaySessionMarker[0, 0];

    //**Plot green waves
    //currentMap.plotGreenWaves();

    //**Plot cyclists
    currentMap.plotCyclists();

    //**Plot markers on top of datapoints
    //currentMap.displaySessionMarkers(30000);

    //**Analyze data
    let tmpdata = analyzeData();


    for (let i = 0; i < tmpdata.length; i++) {
        //**Instantiate the bar chart
        let barChart = new BarChart(100, 200 + (i * 350), 900, 300) // x,y,w,h

        //**Assign to chart
        barChart.setData(tmpdata[i].time, tmpdata[i].distance, tmpdata[i].id);

        // barChart.setData([-10, -5, 0, 5, 10], [-10, -5, 0, 5, 10]);

        barChart.setLabelGap(60, 20);

        //**Plot the results
        if (i == 0) {
            barChart.plot(this, { xAxis: "Seconds", yAxis: "Proximity  in meters", title: "Proximity between bicycle and attractor", subTitle: "Case: " + tmpdata[i].id });
        } else {
            barChart.plot(this, { xAxis: "Seconds", yAxis: "Proximity  in meters", title: "", subTitle: "Case: " + tmpdata[i].id });
        }

    }
}