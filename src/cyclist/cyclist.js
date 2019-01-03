
/**
* This class defines a hybrid unit composed by one rider and one bicycle.
*
* DEFINITIONS (Reference book: Vehicle Dynamics and Control, Rajamani)
* SPACING ERROR: the actual spacing from the preceding vehicle and the desired inter-vehicle spacing.
* DESIRED INTER-VEHICLE SPACING: the desired distance between the current vehicle and the one in front including the length of the vehicle ahead.It could be chosen as a function of vehicle speed.
*
* @author jsalam
* Initial version developed in JAVA / Processing 3
*
*/
class Cyclist{
  constructor(id, position, speed){
    /** The bicycle and its attributes such as electric, assisted, weight*/
    this.bicycle = new Bicycle(); // here add attributes of bicycle
    /** The rider and her attributes such as weight, fitness, power*/
    this.rider = new Rider(); // here add atributes of rider

    // Kinematic Variables
    this.id = id;
    this.position = position;
    this.mySpeed = speed; // the agent's current speed
    this.myAcceleration; // the agent's current acceleration
    //this.distance = 0; // the distance elapsed from the origin
    this.step = 0; // the distance to move from current position
    // this.expectedAcc; // the expected acceleration
    this.targetSpeed; // the leader's target. The leader gets its target speed from user input

    // variables for CACC
    // 1 . acceleration variables
    this.topSpeed = 3;
    this.lastAccelerationPlatoon = 0;// Last acceleration calculated with CACC
    this.isLeader = true;
    this.greenWave = false;
    this.nearestFrontCyclist = null; // nearest Cyclist ahead
    this.leaderCyclist = null; // leader  Cyclist

    // 2 . Platoon's parameters (CACC)
    this.alpha1 = 0.5;
    this.alpha2 = 0.5;
    this.alpha3 = 0.3;
    this.alpha4 = 0.1;
    this.alpha5 = 0.04;
    this.alphaLag = 0.8;
    this.length_vehicle_front = 2;
    this.desiredSpacing = 55;
    this.desirdIVSpacing = this.length_vehicle_front + this.desiredSpacing;
    this.designKSimple = 0.02;// the lower the value, the slower the
    this.designKAdaptive = 0.1;
  }
  /**
  * Sets the leader to this cyclist
  @param {Session} leader The leader
  */
  setLeader(cyclist){
    if (cyclist.id != this.id){
      this.leaderCyclist = cyclist;
      this.isLeader = false;
    }
  }


    /**
  	* Determine which node is in front
  	*
  	* @param nodes
  	*/
  	// getFrontCyclist(journey) {
    //   // If I am not the leader
    //   if (!this.isLeader){
    //     // get all the cyclists
    //     let cyclists = [];
    //     for (let ssn of journey.sessions) {
    //       cyclists.push(ssn.cyclist);
    //     };
    //     // Get the route
    //     let route = journey.referenceRoute;
    //     // Get the distance to the leader, which is the farthest cyclist
    //   	let	distanceToFront = GeometryUtils.getDistance(cyclists[0].position, this.position);
    //     //
    // 		for (let i = 0; i < followers.length; i++) {
    //
    // 			let temp = followers[i];
    // 			// If temp is not myself
    // 			if (temp.id != this.id) {
    // 				// If temp is ahead
    // 				if (temp.position.x - this.position.x > 0) {
    // 					// if temp is closer
    // 					if (temp.position.x - this.position.x <= distanceToFront) {
    // 						// if (pos.dist(temp.pos) <= distanceToFront) {
    // 						// distanceToFront = pos.dist(temp.pos);
    // 						distanceToFront = temp.position.x - this.position.x;
    // 						this.nearestFrontNode = temp;
    // 						// System.out.println(id + " is behind of "+
    // 						// nearestFrontNode.id);
    // 					} else {
    // 						// System.out.println(id + " is ahead of "+ temp.id);
    // 					}
    // 				}
    // 			}
    // 		}
    //   }
  	// }

  /**
	* Simple Cruise Control Algorithm. This control algorithm simply
	* accelerates the node until it reaches the target speed. It lacks of any
	* form of adaptation
	*
	* @return
	*/
	simpleCC() {
		let acceleration = -this.designKSimple * (this.mySpeed - this.targetSpeed);
		return acceleration;
	}

  /**
	* Collaborative Adaptive Cruise Control.
	*
	* Based on
	* "A Simulation Tool for Automated Platooning in Mixed Highway Scenarios"
	* Segata et al. Proceedings of Mobicom 2012
	*
	* @return
	*/
	// collaborativeACC() {
  //
	// 	// a. Get information from the nearest node in the front
	// 	let rel_speed_front;
	// 	let spacing_error;
	// 	let nodeFrontAcceleration;
  //
	// 	if (this.nearestFrontNode != null) {
	// 		// Calculate relative speed to the node in front
	// 		rel_speed_front = this.mySpeed - this.nearestFrontNode.mySpeed;
  //
	// 		// Calculate spacing error
	// 		spacing_error = -this.distanceFrontToCurrent() + this.length_vehicle_front + this.desiredSpacing;
  //
	// 		nodeFrontAcceleration = this.nearestFrontNode.myAcceleration;
  //
	// 	} else {
	// 		rel_speed_front = 0;
	// 		spacing_error = 0;
	// 		nodeFrontAcceleration = 0;
	// 	}
  //
	// 	// b. Calculate (Acceleration desired) A_des
  //
	// 	// let a_des = this.alpha1 * (nodeFrontAcceleration + this.alpha2)
	// 	// * (this.leaderNode.myAcceleration - this.alpha3)
	// 	// * (rel_speed_front - this.alpha4)
	// 	// * ((this.mySpeed - this.leaderNode.mySpeed) - this.alpha5)
	// 	// * this.spacing_error;
  //
	// 	// WARNING: THIS IS NOT THE EQUATION AS DEFINED BY SEGATA ET AL, IT IS
	// 	// AN ADAPTATION THAT WORKS BETTER IN THIS SIMULATOR. SEE SEGATA'S
	// 	// EQUATION COMMENTED ABOVE
	// 	let a_des = (this.alpha1 * this.nodeFrontAcceleration) + (this.alpha2 * this.leaderNode..myAcceleration)
	// 	- (this.alpha3 * rel_speed_front) - (this.alpha4 * (this.mySpeed - this.leaderNode.mySpeed))
	// 	- (this.alpha5 * spacing_error);
  //
	// 	// c. Calculate desired acceleration adding a delay
	// 	let a_des_lag = (this.alphaLag * a_des) + ((1 - this.alphaLag) * this.lastAccelerationPlatoon);
	// 	this.lastAccelerationPlatoon = a_des_lag;
  //
	// 	return a_des_lag;
	// }

  /**
	* Get data from all the the other agents and act based on data from the
	* nearestFrontNode
	*
	* @param nodes
	*/
	// move(leader, followers) {
	// 	this.setLeader(leader);
	// 	// if leader
	// 	let time = 1;
	// 	// If leader accelerate with simpleCruiseControl
	// 	if (isLeader) {
	// 		myAcceleration = simpleCC();
	// 		targetSpeed = PApplet.map(app.mouseX, 0, app.width, 0.0f, topSpeed);
	// 		// x = Vi*t + (at2)/2, where time(t) is = 1
	// 		step = (mySpeed * time) + (((myAcceleration * (float) Math.pow(time, 2f))) / 2);
	// 		mySpeed = step;
	// 	} else {
  //     this.getFrontCycist(followers);
	// 		if (nearestFrontNode.pos.x - pos.x > desirdIVSpacing) {
	// 			// if (pos.x.dist(nearestFrontNode.pos.x) > desirdIVSpacing) {
	// 			// myAcceleration = adaptiveCC();
	// 			// System.out.println(pos.dist(nearestFrontNode.pos));
	// 			myAcceleration = collaborativeACC();
	// 		} else {
	// 			// reverse acceleration
	// 			// myAcceleration = PApplet.map(pos.dist(nearestFrontNode.pos),
	// 			// 0, desirdIVSpacing, -0.01f, -0.035f);
	// 			myAcceleration = PApplet.map(nearestFrontNode.pos.x - pos.x, 0, desirdIVSpacing, -0.01f, -0.035f);
	// 		}
	// 		// x = Vi*t + (at2)/2, where time(t) is = 1
	// 		step = (mySpeed * time) + (((myAcceleration * (float) Math.pow(time, 2f))) / 2);
	// 		mySpeed = step;
	// 	}
  //
	// 	// change position
	// 	pos.x += step;
	// 	distance += step;
	// }
}
