import p5 from 'p5';
import {GrowingTexturedLine, SteppedColorLineShape} from "./shapes";
import {PRNGRand} from "./random";
import {ColorScheme} from "./color";
import {getCurvePoints} from "./curve";


let chunks=[]
var recorder;
const pixelDens = 1;
const sketch = p5 => {

    let colorScheme;
    let colorsArrayMap = new Map()
    let acceleration = 0;
    let velocity = 0

    let radius = 0.5;
    let colorFlipAllowed = false;

    const frate = 30 // frame rate
    const numFrames = 100 // num of frames to record
    let recording = false


    p5.setup = () => {
        const canv = p5.createCanvas(800, 800);
        canv.parent('sketch')
        p5.pixelDensity(pixelDens)
        p5.colorMode(p5.HSB)
        p5.sb = new PRNGRand(new Date().getMilliseconds())
        colorScheme = new ColorScheme(p5)

    }

    p5.keyPressed = () => {
        if (p5.key === 'r') {
            recording=!recording
            if(recording){
                record()
            }else{
                exportVideo()
            }
        }
    }

    p5.draw = () => {
        p5.background(colorScheme.tertiary({brightness: .3}));

        if (p5.keyIsDown(32)) {
            acceleration += 0.0025
            if (acceleration >= 0.05 && colorFlipAllowed) {
                colorScheme = new ColorScheme(p5)
                colorsArrayMap = new Map()
                colorFlipAllowed = false;
            }
            acceleration = Math.min(acceleration, .05)
            if (acceleration < 0.05 * .3) {
                colorFlipAllowed = true
            }
        }
        acceleration *= .98;
        velocity += acceleration;
        velocity = Math.min(velocity, 1)
        radius = radius + velocity
        velocity *= 0.97 * .017

        radius = Math.min(Math.max(radius * .95, 0), 1)

        // document.getElementById('debug').innerText = 'acceleration: ' + acceleration.toFixed(3) + ' velocity: ' + velocity.toFixed(3) + ' radius: ' + radius


        const nsin = (n) => (p5.sin(n) + 1) * .5
        const newCircle = (colorsI, radiusIn, maxRadius, minRadius, lineWidth) => {
            const radius = radiusIn
            const d = new GrowingTexturedLine();
            d.rotation = 0;//getRotationFromFeature(p5, world)
            d.origin = p5.createVector(p5.width / 2, p5.width / 2)
            lineWidth = lineWidth || 10;
            d.width = lineWidth;
            d.growthFactor = 1;
            d.points = [];
            // small inner to big outer


            const frameTime = p5.frameCount / 100;
            const numSegments = 9;
            const aStep = p5.TWO_PI / numSegments;
            let a = 0
            const pointsNoCurve = []
            while (a < p5.TWO_PI) {
                const r = p5.noise(a + frameTime) * radius * (1 + velocity) + minRadius
                pointsNoCurve.push(p5.cos(a) * r, p5.sin(a) * r)
                a += aStep;
            }
            d.points = getCurvePoints(pointsNoCurve, 1.0, 5, true)


            d.showIndent = false;// world.features.lineMode(lineModes.inlet)


            d.widthFunc = (f) => {
                return lineWidth + nsin(f * p5.TWO_PI + frameTime) * nsin(f * p5.TWO_PI * 1.3 + frameTime * 10.123) * nsin(f * p5.TWO_PI * 2 + frameTime * .8) * lineWidth * 3 + lineWidth * .5
            }

            let colorsArray = colorsArrayMap.get(colorsI) || []
            colorsArrayMap.set(colorsI, colorsArray)
            d.colorScheme = {
                colorsArray
            }
            if (colorsArray.length < d.points.length / 2) {
                let colIndex = 0;
                let randBypass = p5.sb.random();
                for (let i = 0; i < d.points.length / 2; i++) {
                    if (p5.sb.random() < randBypass) {
                        colIndex++;
                        randBypass = p5.sb.random();
                    }
                    d.colorScheme.colorsArray.push(colorScheme.continuousStepped(colIndex))
                }
            }

            new SteppedColorLineShape(d).render(p5)
        }
        const n = 7;
        for (let i = 0; i < n; i++) {
            const fi = i / n
            let maxRadius = p5.width * .52 * (1 + fi)
            let minRadius = p5.width * .009 * (fi + 1);
            let radiusIn = radius * p5.width * .85 * (1 - fi) * 2
            let lineWidth = (1 - fi) * 60 + 3.5
            newCircle(i, radiusIn, maxRadius, minRadius, lineWidth)

        }

    }
    // var recorder=null;
    const record=()=> {
        chunks.length = 0;
        let stream = document.querySelector('canvas').captureStream(30)
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = e => {
            if (e.data.size) {
                chunks.push(e.data);
            }
        };
        recorder.start();

    }

    const  exportVideo= (e)=> {
        recorder.stop();

        setTimeout(()=> {
            var blob = new Blob(chunks);
            var vid = document.createElement('video');
            vid.id = 'recorded'
            vid.controls = true;
            vid.src = URL.createObjectURL(blob);
            document.body.appendChild(vid);
            vid.play();
        },1000)
    }
}


new p5(sketch);
