
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

    // Subscription true by default because the cyclists is an instance only if it is subscribed
    this.stauts = "subscribed";
    this.myRoute;

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
    this.nearestFrontCyclist ; // nearest Cyclist ahead
    this.leaderCyclist ; // leader  Cyclist

    // 2 . Platooning parameters (CACC)
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
  * Simple Cruise Control Algorithm. This control algorithm simply
  * accelerates the node until it reaches the target speed. It lacks of any
  * form of adaptation
  *
  * @return
  */
  simpleCC() {
    this.myAcceleration = -this.designKSimple * (this.mySpeed - this.targetSpeed);
    return this.myAcceleration;
  }

  /**
	* Get data from all the the other agents and act based on data from the
	* nearestFrontNode
	*
	* @param leader
	*/
	getStep(nearestCyclistAhead, sampleRate) {
    let step;
		// If leader, accelerate with simpleCruiseControl
		if (isLeader) {
      // simple acceleration
			simpleCC();
      // for all other cyclsist
		} else {
      // get the gap to the preceding cyclsist
      let gap = GeometryUtils.getDistance(nearestCyclistAhead.position , this.position);
      // console.log(gap)
      /* NOTE: Ideally this should be just collaborativeACC() without any condition, but I am testng it as it was coded in java
      * The issue is that CACC does not account for situations in which a follower overpasses the preceding vehicle
      */
			if (gap > this.desirdIVSpacing) {
        // apply acceleration algortithm
				collaborativeACC();
			} else {
				// display negative acceleration
				this.myAcceleration = Utilities.map(gap, 0, this.desirdIVSpacing, -0.01, -0.035);
			}
		}
    // Get the step length for that speed
    // x = Vi*t + (at2)/2, where time(t) is = 1
    step = (this.mySpeed * sampleRate) + (((this.myAcceleration * Math.pow(sampleRate, 2))) / 2);

		return step;
	}

  move(nearestCyclistAhead, sampleRate){
    // get the stepLength
    let step = this.getStep(nearestCyclistAhead, sampleRate);
    // Ask the route for the location of the step
    let tmpPosition = this.myRoute.getPosition(this.position, step);

    if (tmpPosition instanceof Position){

      this.position = tmpPosition;

      // push datapoint to cyclsist's Session

      //tmpDataP = new DataPoint(1000, tmpPosition, speed, Number(lastTime) + Number(sampleRate));

      //this.dataPoints.push(tmpDataP);

    } else {
      this.status = "unsubscribed";
      console.log("Session completed for cyclist: " + this.id +" Status: unsubscribed");
    }



    // update speed
    this.mySpeed = step * sampleRate;

  }

    /**
  	* Determine which node is in front
  	*
  	* @param {Journey} the journey to which this cyclist belongs
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
    //     // get cyclists in order
    //     for (let temp of followers) {
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


}
