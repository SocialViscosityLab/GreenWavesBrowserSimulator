class Chart {

    constructor(width, height) {
        this.scaleX;
        this.margin = 100;
        this.width = width;
        this.height = height;
        this.p;
    }

    init = function(p5) {
        p5.setup = function() {
            p5.createCanvas();
        }
    }

    plot(p5) {
        p5.draw = function() {
            //p5.background(240);
            p5.line(0, 0, 100, 100);
            console.log('done')
            p5.noLoop();
        }
    }

    /** to be overwritten by each chart type */
    plotOutput(p5) {
        p5.line(0, 0, 100, 100)
    }

};
const chart = new Chart(1000, 300)

var p5Instance = new p5(chart.init);