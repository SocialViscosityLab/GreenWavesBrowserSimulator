class GUI {
    constructor() {}

    static appendChild(element, node) {
        element.appendChild(node);
    }

    static makeNode(type, content, id) {
        let node = document.createElement(type);
        node.innerHTML = content;
        if (id) {
            node.id = id;
        }
        return node;
    }

}
GUI.routeButton = document.getElementById("routeButton");
GUI.loopButton = document.getElementById("loopButton");
GUI.activateJourney = document.getElementById("activateJourney");
GUI.connectFirebase = document.getElementById("connectFirebase");

//*** Input values */
GUI.speed = document.getElementById("speed");
GUI.sampleRate = document.getElementById("sampleRate");
GUI.ghostDelay = document.getElementById("startDelay");


//*** Output value */
GUI.routeName = document.getElementById("routeName");
GUI.startTime = document.getElementById("startTime");
GUI.ellapsedTime = document.getElementById("ellapsedTime");
GUI.estimatedDuration = document.getElementById("estimatedDuration");
GUI.routeDistance = document.getElementById("routeDistance");
GUI.journeyID = document.getElementById("journeyID");
GUI.routeInfo = document.getElementById("routeInfo");