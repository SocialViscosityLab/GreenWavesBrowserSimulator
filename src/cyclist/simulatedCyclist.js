/**
 * This class is used for cyclists simulated in an agent based modelling platform. For actual flesh and bone cyclists use the class ActualCyclist.
 *
 * Initial version developed in JAVA / Processing 3 by jsalam
 * @param {Object} id cyclist ID. Attributes: id (String) journey (String), route (String)
 * @param {Position} position Insertion position
 * @param {Number} speed insertion speed
 *
 */
class SimulatedCyclist extends Cyclist {
    constructor(id, route, position, speed) {
        super(id, route, position, speed, true);
        this.latestDatapoint = this.generateDataPoint();
    }

    /** Subscribe as observer to this cyclist
    https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
    */
    subscribe(observer) {
        this.observers.push(observer);
        //        this.notifyObservers(this.latestDatapoint);
    }

    // This initializes the first dataPoint of observers collections with the position of the cycists before it starts running.
    initializeObservers() {
        this.notifyObservers(this.latestDatapoint);
    }

    /** Private Makes a datapoint with current properties of this cyclists
     */
    generateDataPoint() {
        const datapoint = new DataPoint(this.myAcceleration, this.position, this.mySpeed, this.timeCounter);
        datapoint.suggestion = this.latestSuggestion;
        return (datapoint)
    }

    run(sampleRate) {
        this.timeCounter += (sampleRate * 1000);
        // If the route is not completed and the cyclists is enabled
        //if (this.position !== this.myRoute.getLastSegment().end && this.status == "enabled"){
        if (this.status == "enabled") {
            if (this.myRoute.loop) {
                // get the stepLength
                let step = this.getStep(sampleRate);
                // Ask the route for the location of the step
                let tmpPosition = this.myRoute.getPosition(this.position, step);
                // update position
                this.position = tmpPosition;
                // update speed
                this.mySpeed = step / sampleRate;
                this.latestDatapoint = this.generateDataPoint();
                // update greenWave
                if (!this.isLeader) {
                    const gw = this.leaderCyclist.getGreenWave();
                    this.greenWave = this.getProximityToLeader() > 0 && this.getProximityToLeader() < gw.getScopeInMeters();
                }
                // notify
                this.notifyObservers(this.latestDatapoint);
            } else {
                if (this.position !== this.myRoute.getLastSegment().end) {
                    // get the stepLength
                    let step = this.getStep(sampleRate);
                    // Ask the route for the location of the step
                    let tmpPosition = this.myRoute.getPosition(this.position, step);
                    // update position
                    this.position = tmpPosition;
                    // update speed
                    this.mySpeed = step / sampleRate;
                    this.latestDatapoint = this.generateDataPoint();
                    // update greenWave
                    if (!this.isLeader) {
                        const gw = this.leaderCyclist.getGreenWave();
                        this.greenWave = this.getProximityToLeader() > 0 && this.getProximityToLeader() < gw.getScopeInMeters();
                    }
                    // notify
                    this.notifyObservers(this.latestDatapoint);
                } else {
                    this.status = "disabled";
                    console.log("Session completed for cyclist: ", this.id);
                    for (let observer of this.observers) {
                        if (observer instanceof Session) {
                            observer.saveToJSON();
                        }
                    }
                }
            }
        }
    }

    /**
     * Get the length of the next step based on the suggested acceleration and sampleRate
     */
    getStep(sampleRate) {
        // If leader, accelerate with simpleCruiseControl
        if (this.isLeader) {
            // simple acceleration
            const tmp = this.simpleCC();
            this.latestSuggestion = this.getSuggestion(this.myAcceleration, tmp);
            this.myAcceleration = tmp;
            // for all other cyclsist
        } else {
            // THIS DISABLES THE CONVOY FUNCTIONALITY BECAUSE EVERYONE IS FOLLOWING THE LEADER
            this.nearestFrontNode = this.leaderCyclist;
            // get the gap to the preceding cyclsist
            let gap = this.myRoute.getAtoBDistance(this.nearestFrontNode.position, this.position);
            //let gap = GeometryUtils.getDistance(this.leaderCyclist.position , this.position);

            /* NOTE: Ideally this should be just collaborativeACC() without any condition, but I am testng it as it was coded in java
             * The issue is that CACC does not account for situations in which a follower overpasses the preceding vehicle
             */
            if (gap > this.desiredIVSpacing) {
                // apply acceleration algorithm
                const tmp = this.collaborativeACC(gap);
                this.latestSuggestion = this.getSuggestion(this.myAcceleration, tmp);
                this.myAcceleration = tmp;
                //this.myAcceleration = this.simpleCC();
            } else {
                // display negative acceleration since the bicycle is already in the gap. 
                this.myAcceleration = Utilities.map(gap, 0, this.desiredIVSpacing, 0.01, -this.designKSimple);
            }
        }
        // Get the step length for that speed
        // x = Vi*t + (at2)/2, where time(t) is = 1
        let step = (this.mySpeed * sampleRate) + (((this.myAcceleration * Math.pow(sampleRate, 2))) / 2);
        // console.log("speed: " + this.mySpeed + ", acceleration: " + this.myAcceleration + ", step:" + step + ", sampleRate ", sampleRate);
        return Number(step);
    }
}