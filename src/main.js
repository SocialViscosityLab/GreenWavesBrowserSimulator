
let journey;
let currentRoute;
let currentMap;
let ellapsedTime;
let speed;
let sampleRate;
let speedRate;
let clicker;

	/**
	Setups the variables
	*/
	function setup(){
		ellapsedTime = document.getElementById("ellapsedTime");
		speed = document.getElementById("speed");
		document.getElementById("routeButton").onclick = setupRoute;
		document.getElementById("activateJourney").onclick = activateJourney;
		// Instantiate and initialize the map
		currentMap = new Cartography();
		//new Communication();
		this.setupRoute();
		this.activateJourney();
	}

	/**
	* Create the route markers of the cornerpoints on the map
	*/
	function setupRoute(){
		// Instantiate objects
		currentRoute = new Route("Peabody_First_Gregory_Forth");
		// Open or close the route loop
		currentRoute.setLoop(false);
		// This is SHADY..... Keep it by now
		let totalRoutePoints = 5;
		// initialize route
		currentRoute.initiateRoutePoints(totalRoutePoints);

		/**** Visualization  of route on Map *****/
		// add route to map
		currentMap.setupRoute(currentRoute);
		// plot route path on map
		currentMap.plotRoutes();

		//workbench();
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
