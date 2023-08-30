class BarChart {
    constructor(x, y, w, h) {
        this.xScale = new Scale();
        this.yScale = new Scale();

        // origin
        this.xScale.setOrigin(x, y);
        this.yScale.setOrigin(x, y);

        // width and height
        this.xScale.setLength(w);
        this.yScale.setLength(h);

        // main and aux axis
        this.mainAxis;
        this.auxAxis;

        this.dataX;
        this.dataY;
        this.n; // number of bars
        this.barWidth;

        this.fontMarkSize = 13;
        this.fontLabelSize = 18;

        this.compementaryData;
    }

    setData(dataX, dataY, complementaryData) {
        this.dataX = dataX;
        this.dataY = dataY;
        this.n = dataX.length;
        this.barWidth = this.xScale.length / this.n;

        this.xScale.setMinMaxInput(ss.min(dataX), ss.max(dataX));
        this.yScale.setMinMaxInput(ss.min(dataY), ss.max(dataY));

        this.xScale.setMinMaxOutput(-this.xScale.orgX, -this.xScale.orgX + this.xScale.length);
        this.yScale.setMinMaxOutput(-this.yScale.orgX, -this.yScale.orgX + this.yScale.length);

        this.xScale.setCoordinate('abscissa');
        this.yScale.setCoordinate('ordinate');

        this.complementaryData = complementaryData;
    }

    setLabelGap(abscissa, ordinate) {
        this.xScale.setUnit(abscissa);
        this.yScale.setUnit(ordinate);
    }

    plot(p5, labels) {

        this.plotData();

       // this.plotMarks();

        this.plotLabels(labels.xAxis, labels.yAxis, labels.title, labels.subTitle);

        this.plotLegend(["cyclist ahead", "within range", "cyclist behind"], [color(200, 0, 0, 200), color(0, 0, 200, 200), color(0, 200, 0, 200)], width - 300, height - 150);

        this.xScale.plot(p5);

        this.yScale.plot(p5);

        // preparing data

        let xFlags = [] ;
        let accDistance = 0;
        for (let i = 0; i < routeM.routes[0].segments.length; i++) {
            const segment = routeM.routes[0].segments[i];
            accDistance = accDistance + Number(segment.length);
            xFlags.push ({ pos: accDistance, label: segment.endType})
        }

        this.xScale.plotFlags(p5, xFlags, { maxVal: accDistance, minVal: 0, unit: 'm' })

        this.yScale.plotFlags(p5, [{ pos: 20, label: "Scope of ideal proximity" }])
    }

    plotData() {
        this.mainAxis = this.xScale //principal axis, usually the abscissa
        this.auxAxis = this.yScale //auxiliary axis, usually the ordinate

        for (let i = 0; i < this.n; i++) {

            if (this.dataY[i] < 0) {
                fill(200, 0, 0, 200)
            } else if (this.dataY[i] > 0 && Math.abs(this.dataY[i]) >= 20) { // 20 meters
                fill(0, 200, 0, 200)
            } else(
                fill(0, 0, 200, 200)
            )
            noStroke();

            let mainVal = this.mainAxis.mappValue(this.dataX[i])
            let auxVal = this.auxAxis.mappValue(this.dataY[i])

            rect(
                this.mainAxis.orgX + mainVal,
                this.mainAxis.orgY,
                this.barWidth, -auxVal)
        }
    }

    /**
     * Adds flag markers on the main axis
     */
    plotMarks() {

        let accDistance = 0;
        textAlign(LEFT, BASELINE)

        for (let i = 0; i < routeM.routes[0].segments.length; i++) {
            const segment = routeM.routes[0].segments[i];
            accDistance = accDistance + Number(segment.length);
            let mark = accDistance;
 
            noFill();
            stroke(10, 100);

            let tmpX = this.mainAxis.linearMapping2(
                mark,
                0,
                routeM.routes[0].getTotalLength(),
                this.mainAxis.minOutput + this.mainAxis.orgX,
                this.mainAxis.maxOutput + this.mainAxis.orgX)

            let tmpY = this.mainAxis.orgY;
            line(tmpX, tmpY - 2, tmpX, tmpY - 12 + -(i * 9));

            push();
            translate(tmpX - 5, tmpY - 17 - (i * 9))
            noStroke();
            fill(10, 100);
            textSize(this.fontMarkSize);
            text(segment.endType + ", " + accDistance.toFixed(0) + " m", 3, 3);
            pop();
        }
    }

    plotLabels(xAxis, yAxis, title, subtitle) {
        noStroke();
        fill(0)
        textSize(this.fontLabelSize);
        textAlign(CENTER, CENTER)

        //  X axis
        let mpMain = this.mainAxis.mappValue(this.mainAxis.maxData / 2) + 100;
        text(xAxis, mpMain, this.auxAxis.orgY + (this.auxAxis.length/2));

        // Y Axis
        push()
        translate(this.auxAxis.orgX -50, this.auxAxis.orgY);
        rotate(-PI / 2);
        text(yAxis, 0, 0);
        pop();

        // title
        textAlign(LEFT, CENTER)
        textSize(this.fontLabelSize + 3);
        text(title, this.auxAxis.orgX - 70, this.auxAxis.orgY - (this.auxAxis.length / 2) - this.fontLabelSize);

        textAlign(LEFT, CENTER)
        // subtitle
        textSize(this.fontMarkSize);
        let tmp = this.auxAxis.mappValue(this.auxAxis.maxData)
        text(subtitle, this.auxAxis.orgX - this.fontMarkSize, this.auxAxis.orgY - tmp - this.fontMarkSize);
    }

    plotLegend(legend, colors, x, y) {
        stroke(0, 200)
        line(x, y, x + 100, y)

        for (let i = 0; i < legend.length; i++) {
            const element = legend[i];
            noStroke();
            fill(0);
            textSize(this.fontMarkSize);
            textAlign(LEFT, TOP)
            let leading = this.fontMarkSize * 0.25
            text(element, x + 15, y + (this.fontMarkSize * i) + leading);

            if (colors && colors[i]) {
                const element = colors[i];
                fill(element)
                rect(x, y + (this.fontMarkSize * i) + (this.fontMarkSize * .5), 12, (this.fontMarkSize) - leading)
            }
        }
    }
}