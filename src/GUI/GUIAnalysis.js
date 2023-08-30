class GUIAnalysis {

    static onClick(element, fun) {
        let elmnt = document.getElementById(element);
        elmnt.onclick = fun;
    }

    static updateRouteName(name) {
        GUIAnalysis.routeName1.innerHTML = name;
        GUIAnalysis.routeName2.innerHTML = name;
    }

    static updateRouteLength(x) {
        GUIAnalysis.routeLength.innerHTML = x;

    }
}
// ***** Buttons ****
GUIAnalysis.connectFirebase = document.getElementById("connectFirebase");
GUIAnalysis.getJourneyData = document.getElementById("getJourneyData");
GUIAnalysis.showJourney = document.getElementById("showJourney");

// ***** Labels ****
GUIAnalysis.routeName1 = document.getElementById("routeName1");
GUIAnalysis.routeName2 = document.getElementById("routeName2");
GUIAnalysis.routeLength = document.getElementById("routeLength");


// ****** Inputs ****
GUIAnalysis.idJourney = document.getElementById("idJourney");