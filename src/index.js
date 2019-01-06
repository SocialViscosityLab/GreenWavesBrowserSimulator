var init = function(){
	// The journey manager in this simulation
	let journeyM;
	// The routes manager in this simulation
	this.routeM;
	// The instance of Cartography displayed in browser/
	let currentMap;
	// The period of time used to trigger each step of the simulator and record data from vehicles
	let sampleRate;
	// The interval object controlling the simuation internal clock
	let clicker;
	// The instance that reads files from the hard drive
	let directory;

	/**
	P5.js Setup. It setups variables and initializes instances
	*/
	//function setup(){
this.setup = function (){
		// Instantiate and initialize the map
		currentMap = new Cartography();
		// Instantiate RouteManager
		this.routeM = new RouteManager();
		// Instantiate JourneyManager
		journeyM = new JourneyManager();
		//new Communication();
		directory = new DirectoryReader();
		// activate cyclist addition listener
		this.addCyclistListener();
		document.getElementById("routeButton").onclick = this.routeM.setupRoutes;
		document.getElementById("loopButton").onclick = this.switchRouteLoop;
		document.getElementById("activateJourney").onclick = this.activateJourneys;

		//workbench();
	}

	/**
	* On HTML button click event it create the route markers of the cornerpoints on the map
	*/
this.setupRoutes = function(){
		// Get routes from directory and set them up.
		this.routeM.setupRoutes(directory, currentMap);
		/**** Visualization  of route on Map *****/
		// plot route path on map
		currentMap.plotRoutes();
		// plot route corner points on map
		currentMap.plotRoutesCornerPoints();
	}

	/**
	* On HTML button click event it opens or closes the route loop
	*/
this.switchRouteLoop = function(){
		routeM.switchRouteLoop(0, document.getElementById("loopButton"));
		// plot route path on map
		currentMap.plotRoutes();
	}

	this.workbench = function(){
		let coll = [1,2,3,4,5];
		console.log( coll.slice(coll.length - 6, coll.length));
	}

	/**
	* On HTML button click event it  activates journeys in the Journey Manager
	*/
	this.activateJourneys = function(){
		// activate all the journeys
		let ghostSpeed = Number(document.getElementById("speed").value);
		sampleRate = Number(document.getElementById("sampleRate").value);
		if (routeM.routes.length > 0){
			// Activate all journeys
			journeyM.activate(routeM.routes, ghostSpeed , sampleRate, currentMap);
			// Execute the run function at the frequency of the sampleRate
			clicker = setInterval(run, (1000*sampleRate));
		}else{
			alert("Setup routes first")
		}
	}

	/**
	* Add session to journey with nearest route
	*/
	this.addCyclistListener = function(){
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
	this.run = function(){
		for(let routeTmp of routeM.routes){
			if (!routeTmp.status){
				clearInterval(clicker);
				alert("Route finalized");
			}
		}
		// Run cyclists
		journeyM.runCyclists(sampleRate);
		//plot all journeys
		currentMap.plotJourneys();
		//plot dataPoints
		//currentMap.displaySessionMarker[0,0];
		// plot cyclists
		currentMap.plotCyclists();
		// plot green waves
		currentMap.plotGreenWaves();
	}
}
