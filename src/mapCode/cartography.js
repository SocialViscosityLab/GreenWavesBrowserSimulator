/**
* This class instantiates a Leaflet map on an HTML page (https://leafletjs.com/).
It contains a collection of mapRoutes and a collection of mapJourneys.
Any class named with the prefix 'Map' (e.g., MapJourney) is intended to be used
to visualize its complementary class named without the prefix (e.g., Journey)
*/
class Cartography{
	constructor(){
		// The Leaflet instance
		this.map;
		/** All the routes associates to this map */
		this.mapRoutes = [];
		/** All the journeys running on the routes associates to this map */
		this.mapJourneys = [];
		/** All the cyclists running on the routes */
		this.mapCyclists = [];
		this.setup();
	}

	/**
	Private class used to initiate the map
	*/
	setup(){
		this.setupMap();
		this.displayLabMarker();
		this.captureMouseCoordinates();
	}

	/**
	Sets the first route to the map
	*/
	setupRoute(route){
		this.mapRoutes.push(new MapRoute(route));
	}

	/**
	Sets the first journey to the map
	*/
	setupJourney(journey, greenWave){
		this.mapJourneys.push(new MapJourney(journey, greenWave));
	}

	/**
	Adds a route to the collection of routes of this map
	*/
	addRoute(route){
		this.mapRoutes.push(new MapRoute(route));
	}

	/**
	Adds a journey to the collection of journeys of this map
	*/
	addJourney(journey){
		this.mapJourneys.push(new MapJourney(journey));
	}

	/**
	Adds a cyclist to the collection of cyclists of this map
	*/
	addCyclist(cyclist){
		this.mapCyclists.push(new MapCyclist(cyclist));
	}

	/**
	Updates all the journeys. It serves to visualize the latest condition of the journey's sessions
	*/
	updateJourney(){
		for (let j of this.mapJourneys) {
			j.update();
		}
	}

	/**
	* Instantiation of the map. It uses an accessToken provided by Leaflet.
	*/
	setupMap(){
		let mapHTML = document.getElementById('mapid');

		let tiles;

		this.map = L.map(mapHTML).setView([40.10250,-88.23425], 17);

		// HILDA
		tiles = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		});

		// OpenStreetMap
		// tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{ attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});

		// KRONA B&W
		// tiles = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}', {
		// 	maxZoom: 20,
		// 	attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		// });

		// MAPBOX COLOR
		// tiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		// 	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		// 	maxZoom: 20,
		// 	id: 'mapbox.streets',
		// 	accessToken: 'sk.eyJ1IjoianNhbGFtIiwiYSI6ImNqcDI3eG9yaDAyYzMzcXJ0ZWd3d3g3bTcifQ.o2q4YfWOqzAg9rak5ua-MA'
		// });

		tiles.addTo(this.map)
	}

	/**
	* Simply displays the lab marker on the map
	*/
	displayLabMarker(){
		// add markers
		var d4svMarker = L.marker([40.10250,-88.23425]).addTo(this.map);

		d4svMarker.bindPopup("<b>D</b>4<b>SV</b><br>Research lab").openPopup();
	}

	/**
	* Uses a third party library to display mouse clicked coordinates on the map.
	*/
	captureMouseCoordinates(){
		// Catch event properties
		this.map.on('click', function(e) {
			return e.latlng;
		});
	}

	/**
	* Displays all the journeys' sessions on the map
	*/
	plotJourneys(){
		for(let j of this.mapJourneys){
			//plot ghost Session
			j.plotSessions(this);
		}
	}

	displaySessionMarkers(journeyID, sessionID){
		let tmp = this.mapJourneys[journeyID];
		let tmp2 = tmp.mapSessions[sessionID];
		tmp2.markSessionAllDataPoints(this.map);
	}

	/**
	* Displays all the route paths on the map
	*/
	plotRoutes(){
		for (let r of this.mapRoutes) {
			r.plotPath(this.map);
		}
	}

	/**
	* Displays all the route cornerpoints on the map
	*/
	plotRoutesCornerPoints(){
		for (let r of this.mapRoutes) {
			r.plotRouteCornerPoints(this.map);
		}
	}

	/**
	* Displays all the cyclists on the map
	*/
	plotCyclists(){
		for (let c of this.mapCyclists) {
			c.plotMarker(this.map);
		}
	}

	/**
	* Plot journeys green wave. If no parameter is given all the journeys are plotted
	@param {Number} start The index of the first journey to be plotted
	@param {Number} amount The size of the range of journeys to be plotted
	*/
	plotGreenWaves(start,amount){
		if (start != undefined){
			if (start > this.mapJourneys.length -1){
				console.log("Error. Index larger than array length");
				return undefined;
			}else{
				if (amount != undefined){
					//plot the range
					let n = start+amount;
					if (n > this.mapJourneys.length){ n = this.mapJourneys.length;}
					for (var i = start; i < n; i++) {
						this.mapJourneys[i].plotGreenWave(this.map);
					}
				} else {
					// plot the journey in the start position
					this.mapJourneys[start].plotGreenWave(this.map);
				}
			}
		} else {
			for (let j of this.mapJourneys) {
				j.plotGreenWave(this.map);
			}
		}
	}
}
