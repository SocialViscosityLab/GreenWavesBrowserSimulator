/**
The visualization class of Journey class.
@param {Journey} journey The journey associated to this class
*/
class MapJourney{
  constructor(journey){
    this.journey = journey;
    /**The visualization of this mapJourney's sessions*/
    this.mapSessions = [];
    this.setup();
  }

  /**
  Private method to setup this mapJourney. It insatntiates and stores all the mapSessions
  corresponding to the session in the journey
  */
  setup(){
    for (let ssn of this.journey.sessions) {
      // check if the collection has that session
      if (!this.mapSessions.includes(ssn)){
        // if not, add this session
        this.mapSessions.push (new MapSession(ssn));
      } else {
        console.log("Duplicated Session")
      }
    }
  }

  /**
  Updates the list of mapSessions running the setup(). It preserves earlier mapSessions
  */
  update(){
    this.setup();
  }
  /**
  * Plots the mapSession on the given map
  @param {Cartography} theMap An insatnce of Cartography that includes the Leaflet map
  */
  plotSessions(theMap){
    for (let ssn of this.mapSessions){
      ssn.markSessionCurrentPoint(theMap);
      // plot session path
      ssn.plotPath(theMap);
    }
  }
}
