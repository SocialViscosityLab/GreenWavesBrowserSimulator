/**
 * The class defining the scope and collection of positions in a ghost's green wave
 */
class GreenWave {
    constructor(journey, scope) {
        this.journey = journey;
        // The green wave scope in number of positions.
        if (scope) {
            this.greenWaveScope = scope;
        } else {
            this.greenWaveScope = 5;
        }
        this.greenWavePositions = [];
        this.initialize();
    }

    /**
     * Fills a collection of datapoints for the greenwave. The position used is the begining of the joourney route
     */
    initialize() {
        // set all greenwave datapoints to the origin
        for (var i = 0; i < this.greenWaveScope; i++) {
            this.greenWavePositions.push(this.journey.referenceRoute.routePoints[0]);
        }
        //console.log("Green wave of "+ this.journey.id + " initiallized with: " + this.greenWavePositions.length + " dataPoints");
    }

    /**
     * The observer notify() function. Instances of this class observe an instance of Cyclist class
     */
    notify(data) {
        // add the position to the end
        this.greenWavePositions.unshift(data.position);
        // remove the first position
        this.greenWavePositions.pop();
    }

    /**
    * Sets the green wave scope in number of datapoints. Usually the green wave scope is defined in ticks, which can be converted to time by
    multiplying them by the duration of the sample rate, or into distance by multiplying ellapsed time by the speed
    */
    setGreenWaveScope(val) {
        console.log("here");
        this.greenWaveScope = val;
    }
}