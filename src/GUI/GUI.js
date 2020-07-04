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

    static updateRouteComputations(journey) {
        let node = GUI.makeNode('p', "<b>Route Name: </b>" + journey.referenceRoute.id + ', <b>Journey ID: </b>' + journey.id)
        let node2 = GUI.makeNode('li', "<b>Total length: </b>" + journey.referenceRoute.getTotalLength().toFixed(1) +
            " m, <b>Anticipated duration: </b>" + journey.referenceRoute.getDuration(GUI.speed.value, 'min').toFixed(2) +
            " min, <b>Start time: </b>" + journey.sessions[0].startTime);
        let node3 = GUI.makeNode('span', "<b>, Ellapsed time: </b>", journey.referenceRoute.id)
        GUI.appendChild(node2, node3);
        GUI.appendChild(node, node2);
        GUI.appendChild(GUI.routeInfo, node);
    }

    /**
     * Change appearance of html element
     * @param {GUI} element the GUI element
     * @param {boolean} booleanValue 
     * @param {Object} wording Object with 't' and 'f' keys to change the GUI element's textContent
     */
    static switchStatus(element, booleanValue, wording) {
        if (booleanValue == true) {
            if (wording) element.textContent = wording.t;
            element.style.color = "red";
        } else {
            if (wording) element.textContent = wording.f;
            element.style.color = "black";
        }
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