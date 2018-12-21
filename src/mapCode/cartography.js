/**
* This class instantiates a Leaflet map on an HTML page (https://leafletjs.com/).
It contains a collection of mapRoutes and a collection of mapJourneys.
Any class named with the prefix 'Map' (e.g., MapJourney) is intended to be used
to visualize its complementary class named without the prefix (e.g., Journey)
*/
class Cartography{
	constructor(){
		this.map;
		this.mapRoutes = [];
		this.mapJourneys = [];
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
	setupJourney(journey){
		this.mapJourneys.push(new MapJourney(journey));
	}

	/**
	Adds a route to the collection of routes of this map
	*/
	addRoute(route){
		this.mapRoutes.push(new mapRoute(route));
	}

	/**
	Adds a journey to the collection of journeys of this map
	*/
	addJourney(journey){
		this.mapJourneys.push(new mapJourney(journey));
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
		this.map = L.map(mapHTML).setView([40.10250,-88.23425], 17);
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 20,
			id: 'mapbox.streets',
			accessToken: 'sk.eyJ1IjoianNhbGFtIiwiYSI6ImNqcDI3eG9yaDAyYzMzcXJ0ZWd3d3g3bTcifQ.o2q4YfWOqzAg9rak5ua-MA'
		}).addTo(this.map);
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
}
