class AnalysisUtils {
    static getDistanceToAttractorAtTimeSteps() {
        console.log(routeM.routes[0])

    }

    static getDatasetsFromJourney() {
        let att = journeyM.journeys[0].sessions.filter(session => session.id_session.id == "0_ghost");
        let fols = journeyM.journeys[0].sessions.filter(session => session.id_session.id != "0_ghost");
        return { attractor: att, followers: fols }
    }


}