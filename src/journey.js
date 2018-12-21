/**
* A journey is the travel of at least one leader that might be followed by cyclists. Each journey is labeled with an ID.
* It has a collection of sessions: \n
* Session 0: the lead agent \n
* Session n: the nth follower \n
* @param {string} id The journey id
* @param {Route} route The reference route ran by the lead agent
*/
class Journey{
	constructor(id, route){
		this.id = id;
		this.referenceRoute = route;
		this.sessions = [];
		console.log("Journey " + this.id + " initialized" );
	}

	/**
	* Adds a new session to the journey. The session ID is the position in the collection
	*/
	addNewSession(){
		this.sessions.push(new Session(this.sessions.length,new Date()));
		console.log("New session id: " + (this.sessions.length - 1) + " added to journey "+ this.id);
	}

	/**
	* Gets the session by ID
	* @param {Session} id The session that match the id
	*/
	getSession(id){
		for (let ssn of this.sessions) {
			if (ssn.id_user == id){
				return ssn;
			}
		}
	}

	/**
	* Gets the last session added to the journey
	*/
	getLastSession(){
		return this.sessions[this.sessions.length - 1];
	}

	/**
	* Enables the route. It means that the route of this journey is running.
	The route is dissabled by default. It is disables when the leader reaches the end of the route
	* @param {Boolean} bool True if the session status needs to be true.
	*/
	activateRoute(bool){
		this.referenceRoute.status = bool;
	}

	/**
	* Initializes the Ghost leader
	*/
	setupGhost(){
		this.sessions[0].setOrigin(this.referenceRoute, this.referenceRoute.routePoints[0], 5, 0); //route, position, speed, ellapsedTime
		console.log("Ghost in journey "+ this.id+ " initialized");
	}

	/**
	* Executes the leader/ghosts session
	*@param {number} speed The leading cyclists speed in meters per second
	*@param {number} sampleRate Integer value with sampling rate in seconds
	*/
	runGhost(speed, sampleRate){
		this.sessions[0].runSession (this.referenceRoute, speed, sampleRate); //runSession (route, speed, sampleRate in milliseconds){
	}

	setGhostSessionPoints(speed, sampleRate){
		this.sessions[0].setSessionPoints(this.referenceRoute, speed, sampleRate);//route, speed, sampleRate
	}

	/**
	* Executes all the sessions in this journey
	*@param {number} speed The cyclists speed in meters per second. WARNING It applies to ALL cyclists
	*@param {number} sampleRate Integer value with sampling rate in seconds
	*/
	runSessions(speed, sampleRate){
		// for (let ssn of this.sessions) {
		// 	ssn.runSession (this.referenceRoute, speed, sampleRate); //runSession (route, speed, sampleRate in milliseconds){
		// }

		for (var i = 0; i < this.sessions.length; i++) {
			this.sessions[i].runSession (this.referenceRoute, speed, sampleRate);
		}
	}

	/**
	* Executes the especified session
	*@param {string} id The cyclists ID
	*@param {number} speed The cyclists speed in meters per second
	*@param {number} sampleRate Integer value with sampling rate in seconds
	*/
	runSession(id, speed, sampleRate){
		if (this.sessions[id] != undefined){
			this.sessions[id].runSession (this.referenceRoute, speed, sampleRate); //runSession (route, speed, sampleRate in milliseconds){
		}
	}
}
