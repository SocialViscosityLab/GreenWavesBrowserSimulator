/**
  The visualization class of Session class.
  @param {Cyclist} session The session associated to this class
  */
class MapCyclist {

    constructor(cyclist) {
        this.cyclist = cyclist;
        this.marker;
        this.greenGhost;
        this.purpleGhost;
        this.blueIcon;
        this.redIcon;
        this.greenIcon;
        this.purpleIcon;
        this.iconFactory();
    }

    getID() {
        return this.cyclist.id;
    }

    iconFactory() {
        this.greenGhost = this.makeIcon('ghost.png', 'shadow.png', 10, 35);
        this.purpleGhost = this.makeIcon('ghostDisabled.png', 'shadow.png', 10, 35);
        // customize icon whether it is simulated or not
        if (this.cyclist.isSimulated) {
            this.blueIcon = this.makeIcon('okSpeedSim.png', false, 0, 35);
            this.redIcon = this.makeIcon('slowDownSim.png', false, 0, 35); // slow Down
            this.greenIcon = this.makeIcon('speedUpSim.png', false, 0, 35); // speed Up
            this.purpleIcon = this.makeIcon('disabledSim.png', false, 0, 35); // disabled
        } else {
            this.blueIcon = this.makeIcon('okSpeed.png', false, 0, 35);
            this.redIcon = this.makeIcon('slowDown.png', false, 0, 35); // slow Down
            this.greenIcon = this.makeIcon('speedUp.png', false, 0, 35); // speed Up
            this.purpleIcon = this.makeIcon('disabled.png', false, 0, 35); //disabled
        }
    }

    /**
    * Adds a marker for the cyclist position
    @param {Cartography} theMap An instance of Cartography class that contains the Leaflet map
    */
    plotMarker(theMap) {
        // for the first marker
        if (!this.marker) {
            this.marker = L.marker([this.cyclist.position.lat, this.cyclist.position.lon], { icon: this.blueIcon }).addTo(theMap);
            this.currentIcon = this.blueIcon;
        } else {
            let newLatLng = new L.LatLng(this.cyclist.position.lat, this.cyclist.position.lon);
            if (this.cyclist.greenWave) {
                this.changeIcon(this.blueIcon);
            } else {
                if (this.cyclist.status == "disabled") {
                    this.changeIcon(this.purpleIcon);
                } else {
                    // change the color of markers according to acceleration direction
                    if (this.cyclist.myAcceleration > 0) {
                        this.changeIcon(this.greenIcon);
                    } else {
                        this.changeIcon(this.redIcon);
                    }
                }
            }


            this.marker.setLatLng(newLatLng);
        }
        // Update marker label
        let label = "C: " + this.cyclist.id.id + " Tick: " + this.cyclist.timeCounter;

        this.marker.bindPopup(label);

    }

    plotGhost(theMap) {
        // for the first marker
        if (!this.marker) {
            this.marker = L.marker([this.cyclist.position.lat, this.cyclist.position.lon], { icon: this.greenGhost }).addTo(theMap);
            this.currentIcon = this.greenGhost;
        } else {
            let newLatLng = new L.LatLng(this.cyclist.position.lat, this.cyclist.position.lon);
            if (this.cyclist.status == "disabled") {

                this.changeIcon(this.purpleGhost);
            }
            this.marker.setLatLng(newLatLng);
            let greenWaveCount = String(this.cyclist.getFollowersInGreenWave().length) + "/" + String(this.cyclist.getFollowers().length);
            this.marker.bindPopup(greenWaveCount);
        }

    }

    /**
     * This prevents from retrieving the png at each interval
     * */
    changeIcon(newIcon) {
        if (this.currentIcon.options.iconUrl !== newIcon.options.iconUrl) {
            this.marker.setIcon(newIcon);
            this.currentIcon = newIcon;
        }
    }

    makeIcon(iconFileName, shadowFileName, x, y) {
        var theIcon = {
            iconUrl: 'src/mapCode/markers/' + iconFileName,
            iconSize: [21, 38], // size of the icon
            iconAnchor: [x, y], // point of the icon which will correspond to marker's location
            popupAnchor: [-3, -36] // point from which the popup should open relative to the iconAnchor
        };
        if (shadowFileName) {
            theIcon.shadowUrl = 'src/mapCode/markers/' + shadowFileName;
            theIcon.shadowSize = [37, 13]; // size of the shadow
            theIcon.shadowAnchor = [4, 10]; // the same for the shadow
        }
        return L.icon(theIcon);
    }
}