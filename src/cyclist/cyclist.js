
/**
* This class defines a hybrid unit composed by one rider and one bicycle.
*
* DEFINITIONS <br> (Reference book: Vehicle Dynamics and Control, Rajamani, First Edition) <br><br>
* SPACING ERROR: the actual spacing from the preceding vehicle and the desired inter-vehicle spacing. <br>
* DESIRED INTER-VEHICLE SPACING: the desired distance between the current vehicle and the one in front including the length of the vehicle ahead.It could be chosen as a function of vehicle speed.
*
* Initial version developed in JAVA / Processing 3 by jsalam
* @param {Object} id cyclist ID
* @param {Position} position Insertion position
* @param {Number} speed insertion speed
*
*/
class Cyclist{
  constructor(id, route, position, speed){
    /** The bicycle and its attributes such as electric, assisted, weight*/
    this.bicycle = new Bicycle(); // here add attributes of bicycle
    /** The rider and her attributes such as weight, fitness, power*/
    this.rider = new Rider(); // here add atributes of rider

    // Activated by default because the cyclists is an instance only if it is activated
    this.stauts = "enabled";
    // The session subscribed to this cyclist. It uses the observer pattern to notify things to its session
    this.observers = [];
    // the current route on which this cyclist is running
    this.myRoute = route;

    // Kinematic Variables
    this.id = id;
    this.position = position;
    this.mySpeed = speed; // the agent's current speed
    this.myAcceleration; // the agent's current acceleration
    //this.distance = 0; // the distance elapsed from the origin
    this.step = 0; // the distance to move from current position
    // this.expectedAcc; // the expected acceleration
    this.targetSpeed = 6; // the leader's target. The leader gets its target speed from user input
    // relative time
    this.timeCounter = 0;

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
    this.desiredSpacing = 15;
    this.desirdIVSpacing = this.length_vehicle_front + this.desiredSpacing;
    this.designKSimple = 0.35;// the lower the value, the slower the
    this.designKAdaptive = 0.1;
  }

  generateDataPoint(){
    let datapoint = new DataPoint(this.myAcceleration, this.position, this.mySpeed, this.timeCounter);
    this.timeCounter++;
    return (datapoint);
  }

  /*
  * Subscribe as observer to this cyclist
  https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
  **/
  subscribe(observer){
    this.observers.push(observer);
    // notify
    this.notifyObservers(this.generateDataPoint());

  }

  /*
  * Unubscribe from this cyclist
  https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
  **/
  unsubscribe(observer){
    this.observers = this.observers.filter(subscriber => subscriber !== observer);
  }

  /*
  * Notify all observers of this cyclist
  https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
  **/
  notifyObservers(data){
    this.observers.forEach(function(element){
      element.notify(data);
    })
    //observer => observer.notify(data));
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

  run(sampleRate){
    // get the stepLength
    let step = this.getStep(sampleRate);
    // if (!this.isLeader)console.log("step "+ step);
    // Ask the route for the location of the step
    let tmpPosition = this.myRoute.getPosition(this.position, step);

    if (tmpPosition instanceof Position){
      // uodate position
      this.position = tmpPosition;
      // update speed
      this.mySpeed = step * sampleRate;
      // notify
      this.notifyObservers(this.generateDataPoint());
      if (!this.isLeader){
        console.log("my speed: "+this.mySpeed.toPrecision(4)+ ", in front's: " + this.leaderCyclist.mySpeed.toPrecision(4));
        console.log("my accel: "+this.myAcceleration.toPrecision(4)+ ", in front's: " + this.leaderCyclist.myAcceleration.toPrecision(4));
      }
    } else {
      this.status = "disabled";
      //console.log("Session completed for cyclist: " , this.id );
    }
  }

  /**
  * Get data from all the the other agents and act based on data from the
  * nearestFrontNode
  *
  * @param leader
  */
  getStep(sampleRate) {
    let step;
    // If leader, accelerate with simpleCruiseControl
    if (this.isLeader) {
      // simple acceleration
      this.simpleCC();
      // for all other cyclsist
    } else {
      // get the gap to the preceding cyclsist
      let gap = GeometryUtils.getDistance(this.leaderCyclist.position , this.position);
      // console.log(gap)
      /* NOTE: Ideally this should be just collaborativeACC() without any condition, but I am testng it as it was coded in java
      * The issue is that CACC does not account for situations in which a follower overpasses the preceding vehicle
      */
      if (gap > this.desirdIVSpacing) {
        // apply acceleration algortithm
        this.collaborativeACC();
        //this.simpleCC();
      } else {
        // display negative acceleration
        this.myAcceleration = Utilities.map(gap, 0, this.desirdIVSpacing, -0.01, -0.035);
      }
    }
    // Get the step length for that speed
    // x = Vi*t + (at2)/2, where time(t) is = 1
    step = (this.mySpeed * sampleRate) + (((this.myAcceleration * Math.pow(sampleRate, 2))) / 2);
    //console.log("speed: " + this.mySpeed + ", acceleration: " + this.myAcceleration + ", step:" + step + ", sampleRate " , sampleRate);
    return Number(step);
  }

  /**
  * Simple Cruise Control Algorithm. This control algorithm simply
  * accelerates the node until it reaches the target speed. It lacks of any
  * form of adaptation
  *
  * @return
  */
  simpleCC() {
    //console.log("k: " + this.designKSimple + ", target: " + this.targetSpeed);
    this.myAcceleration = -this.designKSimple * (this.mySpeed - this.targetSpeed);
    return this.myAcceleration;
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
  collaborativeACC() {

    this.nearestFrontNode = this.leaderCyclist;

    // a Get information from the nearest node in the front
    let rel_speed_front;
    let spacing_error;
    let nodeFrontAcceleration;

    if (this.nearestFrontNode) {
      // Calculate relative speed to the node in front
      rel_speed_front = this.mySpeed - this.nearestFrontNode.mySpeed;
      // distance to vehice ahead
      let distanceFrontToCurrent = GeometryUtils.getDistance(this.position, this.nearestFrontNode.position);
      // Calculate spacing error
      spacing_error = - distanceFrontToCurrent + this.desirdIVSpacing;

      nodeFrontAcceleration = this.nearestFrontNode.myAcceleration;

    } else {
      rel_speed_front = 0;
      spacing_error = 0;
      nodeFrontAcceleration = 0;
    }

    // console.log("rel_speed_front: " + rel_speed_front + ", spacing_error: " + spacing_error + ", nodeFrontAcceleration: " +nodeFrontAcceleration);
    // b Calculate (Acceleration desired) A_des

    // * let a_des = this.alpha1 * (nodeFrontAcceleration + this.alpha2)
    // * (this.leaderNode.myAcceleration - this.alpha3)
    // * (rel_speed_front - this.alpha4)
    // * ((this.mySpeed - this.leaderNode.mySpeed) - this.alpha5)
    // * this.spacing_error;

    // WARNING: THIS IS NOT THE EQUATION AS DEFINED BY SEGATA ET AL, IT IS
    // AN ADAPTATION THAT WORKS BETTER IN THIS SIMULATOR. SEE SEGATA'S
    // EQUATION COMMENTED ABOVE

    let a_des = (this.alpha1 * nodeFrontAcceleration) + (this.alpha2 * this.leaderCyclist.myAcceleration)
    - (this.alpha3 * rel_speed_front) - (this.alpha4 * (this.mySpeed - this.leaderCyclist.mySpeed))
    - (this.alpha5 * spacing_error);

    //console.log("a_des "+ a_des)
    // c Calculate desired acceleration adding a delay
    let a_des_lag = (this.alphaLag * a_des) + ((1 - this.alphaLag) * this.lastAccelerationPlatoon);
    //console.log("a_des_lag "+ a_des_lag)
    this.lastAccelerationPlatoon = a_des_lag;
    this.myAcceleration = a_des_lag;
    return a_des_lag;
  }

  /**
  * Determine which node is in front
  *
  * @param {Journey} the journey to which this cyclist belongs
  */
  getFrontCyclist(journey) {
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
  }


}
