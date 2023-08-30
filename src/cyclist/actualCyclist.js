/**
 * This class is used for actual flesh and bone cyclists. For simulated cyclists use the class SimulatedCyclist.
 *
 * Initial version developed in JAVA / Processing 3 by jsalam
 * @param {Object} id cyclist ID. Attributes: id (String) journey (String), route (String)
 * @param {Position} position Insertion position
 * @param {Number} speed insertion speed
 *
 */
class ActualCyclist extends Cyclist {
    constructor(id, route, position, speed) {
        super(id, route, position, speed, false);
        // Current data point of the cyclist
        this.currentDataPoint;
    }

    /** Method for actual cyclists*/
    setDataPoint(acc, pos, speed, time) {
        this.myAcceleration = acc;
        this.position = pos;
        this.mySpeed = speed;
        this.timeCounter = time;
        this.currentDataPoint = new DataPoint(acc, pos, speed, time);
        // update suggestion
        this.currentDataPoint.suggestion = this.latestSuggestion;
    }

    /** Subscribe as observer to this cyclist
    https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
    */
    subscribe(observer) {
        this.observers.push(observer);
        // notify to all actual cyclists
        // this.notifyObservers(this.currentDataPoint);
    }

    run() {
        if (this.status == "enabled") {
            if (this.currentDataPoint != undefined) {
                this.notifyObservers(this.currentDataPoint);
            }
        }
    }
}