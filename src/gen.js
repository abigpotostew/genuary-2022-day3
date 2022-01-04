import {
    BlobI,
    CircleI,
    EyeData,
    GrowingTexturedLine,
    GrowingTexturedLineShape,
    HeadData,
    LineI,
    MaskShape,
    MouthApprox,
    MouthApproxShape,
    ShapeItem,
    SteppedColorLineShape,
    SvgPolygon,
    TwoEye,
    UnionShape
} from "./shapes.js";
import {fbm} from "./util.js";
import {
    getBodyPart,
    getLightLanguageCharacter,
    getLightLanguageCharacterIds,
    mouthOvalPoints,
    mouthPoints
} from "./data";
import P5 from 'p5'
import {angleModes, eyeModes, lineModes} from "./features";

const borderGlobal = 10;


export const genEyeMask = (p5, world) => {

    const eyeRadius = p5.sb.random(p5.width * .1, p5.width * .15);
    const eyePosition = p5.createVector();
    eyePosition.x = p5.width / 2
    eyePosition.y = p5.sb.random(p5.height * .2 + eyeRadius, p5.height * .7 - eyeRadius);//, p5.height*.9-data.radius);
    // const pupilRadius = eyeRadius * p5.sb.random(.1, .5);


    const data = new HeadData()
    data.colorScheme = {}
    data.colorScheme.fill = world.colorScheme.secondary();
    data.position = eyePosition;
    const wint = eyeRadius;
    const numInlays = p5.sb.randomInt(1, 10);
    const extraSpace = p5.sb.random(1, 3)
    const width = eyeRadius + eyeRadius / numInlays / ((numInlays * 2 * extraSpace))

    // line width
    data.width = width

    data.height = data.width / 2
    data.growingTexturedLines = [];
    const rad = eyeRadius;
    let addNextSection = p5.sb.random();
    const lineWidth = rad / (numInlays * 2 * extraSpace)
    data.pupilRadius = (1) / numInlays * rad;
    if (numInlays === 1) {
        data.radius = rad * 2
    } else {
        data.radius = rad + data.pupilRadius;//lineWidth * 2
    }


    // width += lineWidth;
    for (let i = 0; i < numInlays; i++) {
        const d = new GrowingTexturedLine();
        d.rotation = 0;//getRotationFromFeature(p5, world)
        d.origin = p5.createVector(p5.width / 2, data.position.y)
        d.width = lineWidth;
        d.growthFactor = 1;
        d.points = [];
        // small inner to big outer
        const radius = (1 - i / numInlays) * rad;
        const outerRadius = (i + 1) / numInlays * rad;
        let a = p5.HALF_PI
        const aStep = p5.HALF_PI / 50;
        while (a < p5.PI) {
            d.points.push(p5.cos(a) * radius, p5.sin(a) * radius)
            a += aStep;
        }
        a = p5.TWO_PI
        let end = 3 * p5.PI / 2;
        if (addNextSection < 1) {
            if (i === 0) {
                end = 0
            } else {
                end = p5.QUARTER_PI + p5.QUARTER_PI / (numInlays + 1) + rad * .0023 * (1 - (i + 1) / numInlays)
            }

            while (a > end) {
                d.points.push(p5.cos(a) * outerRadius - outerRadius - radius, p5.sin(a) * outerRadius)
                a -= aStep;
            }
            if (addNextSection < .25) {

            }
        }

        d.points.reverse()
        for (let j = 0, tmp = 0; j < d.points.length; j += 2) {
            tmp = d.points[j]
            d.points[j] = d.points[j + 1]
            d.points[j + 1] = tmp
        }

        d.showIndent = world.features.lineMode(lineModes.inlet)


        d.colorScheme = {
            colorsArray: []
        }
        let colIndex = 0;
        let randBypass = p5.sb.random();
        for (let i = 0; i < d.points.length / 2; i++) {
            if (p5.sb.random() < randBypass) {
                colIndex++;
                randBypass = p5.sb.random();
            }
            d.colorScheme.colorsArray.push(world.colorScheme.continuousStepped(colIndex))
        }
        data.growingTexturedLines.push(new SteppedColorLineShape(d))
    }
    data.growingTexturedLines.reverse()


    return new MaskShape(data)
}


