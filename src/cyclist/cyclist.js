/**
 * This abstract class defines a hybrid unit composed by one rider and one bicycle. It is extended by SimulatedCyclist and ActualCyclist
 *
 * DEFINITIONS <br> (Reference book: Vehicle Dynamics and Control, Rajamani, First Edition) <br><br>
 * SPACING ERROR: the actual spacing from the preceding vehicle and the desired inter-vehicle spacing. <br>
 * DESIRED INTER-VEHICLE SPACING: the desired distance between the current vehicle and the one in front including the length of the vehicle ahead.It could be chosen as a function of vehicle speed.
 *
 * Initial version developed in JAVA / Processing 3 by jsalam
 * @param {Object} id cyclist ID. Attributes: id (String) journey (String), route (String)
 * @param {Position} position Insertion position
 * @param {Number} speed insertion speed
 *
 */
class Cyclist {
    constructor(id, route, position, speed, isSimulated) {
        // boolean variable defining if this cyclist is simulated or is an actual cyclists on the street
        this.isSimulated = isSimulated;
        /** The bicycle and its attributes such as electric, assisted, weight*/
        this.bicycle = new Bicycle(); // here add attributes of bicycle
        /** The rider and her attributes such as weight, fitness, power*/
        this.rider = new Rider(); // here add atributes of rider
        // Activated by default because the cyclists is an instance only if it is activated
        this.status = "enabled";
        // The session subscribed to this cyclist. It uses the observer pattern to notify things to its session
        this.observers = [];
        // this is an object with {id:this.appID, journey:journeyTmp.id, route:journeyTmp.referenceRoute.id};
        this.id = id;
        // the current route on which this cyclist is running
        this.myRoute = route;

        // Kinematic Variables
        this.position = position;
        this.mySpeed = speed; // the agent's current speed
        this.myAcceleration = 0; // the agent's current acceleration
        //this.distance = 0; // the distance elapsed from the origin
        this.step = 0; // the distance to move from current position
        this.latestSuggestion = 'none'; // String: none, up, down, mantain
        if (GUI.speed != undefined) {
            this.targetSpeed = GUI.speed.value; // the leader's target. The leader gets its target speed from user input
        }
        // relative time
        this.timeCounter = 0;

        // variables for CACC
        // 1 . acceleration variables
        this.topSpeed = 5;
        this.lastAccelerationPlatoon = 0; // Last acceleration calculated with CACC
        this.isLeader = true;
        this.greenWave = false;
        this.nearestFrontCyclist; // nearest Cyclist ahead
        this.leaderCyclist; // leader  Cyclist

        // 2 . Platooning parameters (CACC)
        this.alpha1 = 0.5;
        this.alpha2 = 0.5;
        this.alpha3 = 0.3;
        this.alpha4 = 0.1;
        this.alpha5 = 0.02;
        this.alphaLag = 0.8;
        this.length_vehicle_front = 2;
        this.desiredSpacing = 15;
        this.desiredIVSpacing = this.length_vehicle_front + this.desiredSpacing;
        this.designKSimple = 0.35; // the lower the value, the slower the
        this.designKAdaptive = 0.1;

        // this.ciclistStarted = false;
    }

    /** Unubscribe from this cyclist
    https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
    */
    unsubscribe(observer) {
        this.observers = this.observers.filter(subscriber => subscriber !== observer);
    }

    notify() {
        // do something
    }

    /*
    * Notify all observers of this cyclist
    https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
    **/
    notifyObservers(data) {
        this.observers.forEach(function(element) {
            element.notify(data);
        });
    }

    /**
     * Get the session observing this cyclist. There should be only one session observing each cyclist 
     */
    getSession() {
        for (const observer of this.observers) {
            if (observer instanceof Session) {
                return observer;
            }
        }
        return undefined;
    }

    /**
     * Get the journey observing this cyclist. There should be only one journey observing each cyclist 
     */
    getJourney() {
        for (const observer of this.observers) {
            if (observer instanceof Journey) {
                return observer;
            }
        }
        return undefined;
    }

    getGreenWave() {
        for (const observer of this.observers) {
            if (observer instanceof GreenWave) {
                return observer;
            }
        }
        return undefined;
    }

    /**
    * Sets the leader to this cyclist
    @param {Session} leader The leader
    */
    setLeader(cyclist) {
        if (cyclist.id != this.id) {
            this.leaderCyclist = cyclist;
            this.isLeader = false;
        }
    }

    /**
     * If this is a leader, returns the collection od followers
     */
    getFollowers() {
        let rtn = [];
        if (this.isLeader) {
            for (const observer of this.observers) {
                if (observer instanceof Cyclist) {
                    rtn.push(observer);
                }
            }
        }
        return rtn;
    }

    /**
     * If this is a leader, returns the collection of followers in green wave scope
     */
    getFollowersInGreenWave() {
        let rtn = [];
        for (const cyclist of this.getFollowers()) {
            if (cyclist.greenWave) {
                rtn.push(cyclist);
            }
        }
        return rtn;
    }

    getProximityToLeader() {
        if (!this.isLeader) {
            return this.myRoute.getAtoBDistance(this.leaderCyclist.position, this.position);
        }
        return undefined;
    }

    getSuggestion(initial, suggested) {
        let rtn;
        if (initial < suggested) {
            rtn = 'up';
        } else if (initial > suggested) {
            rtn = 'down'
        } else {
            rtn = 'mantain'
        }
        return rtn;
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
        const tmp = -this.designKSimple * (this.mySpeed - this.targetSpeed);
        return tmp;
    }

    /**
     * Collaborative Adaptive Cruise Control.
     *
     * Based on
     * "A Simulation Tool for Automated Platooning in Mixed Highway Scenarios"
     * Segata et al. Proceedings of Mobicom 2012
     *
     * @param {Number} distanceFrontToThis The distance in meter between this vehicle and the vehicle ahead
     * @return {Number}
     */
    collaborativeACC(distanceFrontToThis) {

        // a Get information from the nearest node in the front
        let rel_speed_front;
        let spacing_error;
        let nodeFrontAcceleration;

        if (this.nearestFrontNode) {
            // Calculate relative speed to the node in front
            rel_speed_front = this.mySpeed - this.nearestFrontNode.mySpeed;
            // distance to vehice ahead
            //let distanceFrontToThis = GeometryUtils.getDistance(this.position, this.nearestFrontNode.position);
            // Calculate spacing error
            spacing_error = -Math.abs(distanceFrontToThis) + this.desiredIVSpacing;

            nodeFrontAcceleration = this.nearestFrontNode.myAcceleration;

        } else {
            rel_speed_front = 0;
            spacing_error = 0;
            nodeFrontAcceleration = 0;
        }

        //console.log("rel_speed_front: " + rel_speed_front + ", spacing_error: " + spacing_error + ", nodeFrontAcceleration: " + nodeFrontAcceleration);
        // b Calculate (Acceleration desired) A_des

        // * let a_des = this.alpha1 * (nodeFrontAcceleration + this.alpha2)
        // * (this.leaderNode.myAcceleration - this.alpha3)
        // * (rel_speed_front - this.alpha4)
        // * ((this.mySpeed - this.leaderNode.mySpeed) - this.alpha5)
        // * this.spacing_error;

        // WARNING: THIS IS NOT THE EQUATION AS DEFINED BY SEGATA ET AL, IT IS
        // AN ADAPTATION THAT WORKS BETTER IN THIS SIMULATOR. SEE SEGATA'S
        // EQUATION COMMENTED ABOVE

        //console.log("rel_speed_leader " + (this.mySpeed - this.leaderCyclist.mySpeed).toFixed(3))

        let a_des = (this.alpha1 * nodeFrontAcceleration) + (this.alpha2 * this.leaderCyclist.myAcceleration) -
            (this.alpha3 * rel_speed_front) - (this.alpha4 * (this.mySpeed - this.leaderCyclist.mySpeed)) -
            (this.alpha5 * spacing_error);

        //console.log("a_des " + a_des.toFixed(3));
        // c Calculate desired acceleration adding a delay
        let a_des_lag = (this.alphaLag * a_des) + ((1 - this.alphaLag) * this.lastAccelerationPlatoon);
        //console.log("a_des_lag "+ a_des_lag)
        this.lastAccelerationPlatoon = a_des_lag;
        //console.log("a_des_lag " + this.myAcceleration.toFixed(3))
        return a_des_lag;
    }

    /**
     * Determine which node is in front
     */
    //getFrontCyclist(journey) {
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
    // 				if (route.getAtoBDistance(temp.position, this.position) > 0) {
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
}