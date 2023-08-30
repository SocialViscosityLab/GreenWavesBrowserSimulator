class Scale {
    constructor() {
        this.orgX;
        this.orgY;
        this.length;
        this.minData;
        this.maxData;
        this.minOutput;
        this.maxOutput;
        this.unit;
        this.input;
        this.mappedVal;
        this.mapper = "linear";
        this.forcedMapped = false;
        this.coordinate = 'abscissa' // "x: abscissa or y: ordinate"
        this.markPos = 20;
        this.fontSize = 12;
        this.flagOffset = 2; // offset for any additional element ploted on the scale
        this.flagLength = this.flagOffset * 5;
    }

    /**
     * 
     * @param {Number} orgX 
     * @param {Number} orgY
     */
    setOrigin = function (orgX, orgY) {
        this.orgX = orgX;
        this.orgY = orgY;
        return this;
    }

    /**
     * 
     * @param {Number} length The length of the scale in pixels
     */
    setLength = function (length) {
        this.length = length;
        return this;
    }

    /**
     * 
     * @param {Number} minData 
     * @param {Number} maxData 
     */
    setMinMaxInput = function (minData, maxData) {
        this.minData = minData;
        this.maxData = maxData;
        //console.log("scale + limits defined" + this.minData + " " + this.maxData + " " + this.minOutput + " " + this.maxOutput);
        return this;
    }

    /**
     * 
     * @param {Number} minOutput 
     * @param {Number} maxOutput 
     */
    setMinMaxOutput = function (minOutput, maxOutput) {
        this.minOutput = minOutput;
        this.maxOutput = maxOutput;
        // this correction is necessary because these values are used to map imput values but
        // the plotting origin is translated in the show() function. 
        let shiftToZero = this.mappValue(0);
        this.minOutput -= shiftToZero;
        this.maxOutput -= shiftToZero;
        //console.log("scale + limits defined" + this.minData + " " + this.maxData + " " + this.minOutput + " " + this.maxOutput);
        return this;
    }

    /**
     * The gap between markers on the scale. Usually this is a fraction of this.max.Input
     * @param {Number} val 
     */
    setUnit = function (val) {
        this.unit = val;
        return this;
    }

    /**
     * Either Logaritmic or linear
     * @param {String} val 
     */
    setMapper = function (val) {
        this.mapper = val;
        return this;
    }

    setCoordinate(val) {
        this.coordinate = val;
        return this;
    }

    // Mapping values
    mappValue = function (val) {
        let rtn;
        if (val >= this.minData && val <= this.maxData) {
            this.input = val;
            switch (this.mapper) {

                case "linear":
                    rtn = this.linearMapping(this.input);
                    break;

                case "logarithmic":

                    if (this.minOutput != undefined) {
                        if (this.minOutput >= 0) {
                            if (val > 0) {
                                rtn = Math.log10(this.input);
                            } else {
                                console.log("Logarithmic scale! The value to be mapped (" + val + ") must be larger than 0")
                            }
                        } else {
                            window.alert("Logarithmic scale! The min output(" + this.minOutput + ") must be positive");
                        }
                    }
                    break;
            }

            this.forcedMapped = false;

            if (this.minOutput > rtn || rtn > this.maxOutput) {
                console.log("Mapped value exceeds output scale limits. Value: " + rtn + ". Output scale limits: " + this.minOutput + " to " + this.maxOutput);
                rtn = this.getMappedValueInRange(this.minOutput, this.maxOutput);
                this.forcedMapped = true;
            }

        } else {
            if (this.minData == undefined || this.maxData == undefined) {
                console.log("Input limits are undefined. Min: " + this.minData + ", Max: " + this.maxData);
            } else {
                console.log("Value exceeds scale limits. Value: " + val + " Scale limits: " + this.minData + " - " + this.maxData);
            }
        }

        return rtn;
    }

    linearMapping = function (val) {

        return this.linearMapping2(val, this.minData, this.maxData, this.minOutput, this.maxOutput) //this.minOutput + (this.maxOutput - this.minOutput) * ((val - this.minData) / (this.maxData - this.minData));
    }

    linearMapping2 = function (val, minIn, maxIn, minOut, maxOut) {
        return minOut + (maxOut - minOut) * ((val - minIn) / (maxIn - minIn));
    }

    getMappedValueInRange = function (minOut, maxOut) {

        if (this.mapper == "linear") {

            return this.linearMapping2(this.mappedVal, this.minOutput, this.maxOutput, minOut, maxOut);

        } else if (this.mapper == "logarithmic") {

            var minIn = Math.log10(this.minData);

            var maxIn = Math.log10(this.maxData);

            // if (val < 0 || val == NaN){
            // 	val = 0;
            // }

            if (minIn < 0 || minIn == NaN) {
                minIn = 0;
            }

            return this.linearMapping2(this.mappedVal, minIn, maxIn, minOut, maxOut);

        }

    }


    posOnScale = function () {

        var x;

        if (this.mapper == "linear") {
            x = ((this.mappedVal - this.minOutput) / (this.maxOutput - this.minOutput)) * this.length;

            if (x == NaN) {
                x = 0;
            }

        } else if (this.mapper == "logarithmic") {

            var val = Math.log10(this.mappedVal);

            var minIn = Math.log10(this.minData);

            var maxIn = Math.log10(this.maxData);

            if (minIn < 0 || minIn == NaN) {
                minIn = 0;
            }

            x = this.linearMapping2(this.mappedVal, minIn, maxIn, 0, this.length);

            //x = this.linearMapping2(val, this.minOutput, this.maxOutput, 0, this.length);
        }

        return x;
    }

    getPosFromMinInput = function () {

        var x = ((this.input - this.minData) / (this.maxData - this.minData)) * this.length;

        if (x == NaN) {
            x = 0;
        }

        return x;
    }


    // Displaying scale

    plot = function (p5) {

        textSize(this.fontSize);

        // check that the basic coordinates are assigned
        if (this.orgX != undefined && this.orgY != undefined && this.length != undefined) {

            push();
            translate(this.orgX, this.orgY);

            let tempY = 0;
            let start = this.mappValue(this.minData); // the lowest point of the scale
            let end = this.mappValue(this.maxData); // the highest poit of the scale

            if (this.coordinate == 'ordinate') {
                rotate(-PI / 2);
                //this.markPos = -20
            }

            // draw the axis
            p5.stroke(10, 150);
            p5.fill(10, 150);
            p5.line(start, tempY, end, tempY);

            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.textStyle(p5.BOLD)
            p5.noStroke();

            // min value text
            push()
            translate(start, tempY)
            if (this.coordinate == 'ordinate') {
                rotate(PI / 2);
                p5.text(this.minData.toFixed(1), - this.markPos, 0);
            } else {
                p5.text(this.minData.toFixed(1), 0, this.markPos);
            }
            p5.ellipse(0, 0, 5, 5);
            pop()

            // max value text
            push()
            translate(end, tempY)
            if (this.coordinate == 'ordinate') {
                rotate(PI / 2);
                p5.text(this.maxData.toFixed(1), - this.markPos, 0);
            } else {
                p5.text(this.maxData.toFixed(1), 0, this.markPos);
            }
            p5.ellipse(0, 0, 5, 5);
            pop()

            p5.textStyle(p5.NORMAL)


            //**This is only needed when plotting the input AND output on the same scale*/
            if (this.minOutput != undefined && this.maxOutput != undefined) {

                p5.textAlign(p5.CENTER, p5.TOP);

                if (this.forcedMapped) {
                    p5.fill(255, 0, 0);
                    p5.text("Forced output ", tempX - 60, tempY + 7.5);
                }
            }

            // Check that the scale unit is assigned
            if (this.unit != undefined) {

                let positiveSteps = this.maxData / this.unit;

                let negativeSteps = this.minData / this.unit;

                // There is a problem with this mode of plotting the marks on the scale. There might be that the min value is positive and non-zero. So the scale must
                // have a number of positive marks that fit inside the substraction of the max and the min value. The same applies to the opposite case: when the max value is negative. 
                // this needs to be revised

                //plot positives
                let countP = 1;
                p5.stroke(0);
                while (countP <= positiveSteps) {
                    let pos = countP * this.unit;
                    p5.push()
                    p5.translate(this.mappValue(pos), tempY)
                    p5.noStroke()
                    p5.ellipse(0, 0, 5, 5);

                    if (this.coordinate == 'ordinate') {
                        p5.rotate(PI / 2)
                        p5.text(pos, -this.markPos, 0)
                    } else {
                        p5.text(pos, 0, this.markPos)
                    }
                    p5.pop();
                    countP++;
                }

                // plot negatives
                let countN = -1;
                while (countN >= negativeSteps) {
                    let pos = countN * this.unit;
                    p5.push()
                    p5.translate(this.mappValue(pos), tempY);
                    p5.noStroke()
                    p5.ellipse(0, 0, 5, 5);
                    if (this.coordinate == 'ordinate') {
                        p5.rotate(PI / 2)
                        p5.text(pos, -this.markPos, 0)
                    } else {
                        p5.text(pos, 0, this.markPos)
                    }
                    p5.pop();
                    countN--;
                }
            }

            pop()

        } else {

            p5.noStroke();
            p5.text("Coordinates undefined", 10, 20);
            // default basic coordinates

        }

    }

    /**
     * 
     * @param {p5 Instance} p5 
     * @param {Array} flags Object array with {pos:number, label:string}
     * @param {Number} override In case user wants to add flags mapped to a different scale other than
     * the original scale. It should be an object with {maxVal:number, minVal:number, unit:string}
    */
    plotFlags = function (p5, flags, override) {

        p5.textAlign(LEFT, BASELINE);



        for (let i = 0; i < flags.length; i++) {
            const flag = flags[i];
            let mark = Number(flag.pos);
            let mast = (i * this.flagLength) + this.flagLength;

            p5.noFill();
            p5.stroke(10, 100);

            let posOnScale;
            let label;

            if (override) {
                posOnScale = this.linearMapping2(
                    mark,
                    override.minVal,
                    override.maxVal,
                    this.minOutput,
                    this.maxOutput);
                label = flag.label + ", " + mark.toFixed(0) + " " + override.unit;
            } else {
                posOnScale = this.mappValue(mark);
                label = flag.label + ", " + mark.toFixed(0);
            }

            p5.push();
            p5.translate(this.orgX, this.orgY);
            if (this.coordinate == 'ordinate') {
                p5.rotate(-p5.PI / 2);
                p5.line(posOnScale, this.flagOffset, posOnScale, this.flagOffset + mast);
                push();
                p5.translate(posOnScale, this.flagOffset + mast);
                p5.rotate(p5.PI / 2);
                p5.noStroke();
                p5.fill(10, 100);
                p5.textSize(this.fontMarkSize);
                p5.text(label, 0, 0);
                pop();
            } else {
                p5.line(posOnScale, - this.flagOffset, posOnScale, - this.flagOffset - mast);
                p5.noStroke();
                p5.fill(10, 100);
                p5.textSize(this.fontMarkSize);
                p5.text(label, posOnScale, - this.flagOffset - mast);
            }
            p5.pop();
        }

    }

}