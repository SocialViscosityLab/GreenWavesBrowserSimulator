class AnalysisUtils {
    static getDistanceToAttractorAtTimeSteps() {
        let index = [];
        let proximity = [];
        let tStatistics = [];
        let results = [];
        // get the datasets
        let datasets = AnalysisUtils.getDatasetsFromJourney();
        // iterate over the attarctor dataset and the followers datasets calculating the distance at every timestep
        let attDatapoints = datasets.attractor.dataPoints;

        for (let j = 0; j < datasets.followers.length; j++) {
            const follower = datasets.followers[j];
            const followerID = follower.id_session.id;

            for (let i = 0; i < attDatapoints.length; i++) {
                let dpA = attDatapoints[i].position;
                let dpF = follower.dataPoints[i].position;

                let dist = routeM.routes[0].getAtoBDistance(dpA, dpF)

                // filter out outliers
                if (Math.abs(dist) > 200) { dist = 0 }

                index.push(i);
                proximity.push(dist);
            }

            let mean = ss.mean(proximity)
            let sd = ss.sampleStandardDeviation(proximity)

            for (let i = 0; i < proximity.length; i++) {
                tStatistics.push(ss.zScore(proximity[i], mean, sd))
            }

            results.push({ id: followerID, time: index, distance: proximity, tStatistic: tStatistics });

            index = [];
            proximity = [];
            tStatistics = [];
        }

        return results

    }

    static getDatasetsFromJourney() {
        let att = journeyM.journeys[0].sessions.filter(session => session.id_session.id == "0_ghost")[0];
        let fols = journeyM.journeys[0].sessions.filter(session => session.id_session.id != "0_ghost");
        return { attractor: att, followers: fols }
    }


}