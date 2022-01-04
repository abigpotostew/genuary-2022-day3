import {polyPoint} from "./util";


export class GrowingTexturedLine {
    origin;//: pvector;
    points = [];
    width = 2;
    growthFactor = 1.1;
    colorScheme;
    rotation;
    showIndent;
    endCap;
}

export class SteppedColorLineShape {
    growingTexturedLine;

    constructor(growingTexturedLine) {
        this.growingTexturedLine = growingTexturedLine;
    }

    render(p5) {
        const {
            origin,
            points,
            width,
            growthFactor,
            rotation,
            colorScheme,
            showIndent,
            widthFunc,
        } = this.growingTexturedLine;

        const ren = (second) => {
            p5.push();
            if (second) {
                p5.translate(p5.width, 0);
                p5.scale(-1, 1);
            }
            p5.translate(origin.x, origin.y)
            p5.rotate(rotation)

            const pts = points;
            let w = width;
            const colors = colorScheme.colorsArray;
            let ppx1 = 0;
            let ppy1 = 0;
            let ppx2 = 0;
            let ppy2 = 0;

            let ppstart = [];

            for (let i = 2; i < pts.length + 2; i += 2) {
                p5.strokeWeight(2);
                p5.noStroke();
                p5.strokeJoin(p5.ROUND)
                p5.strokeCap(p5.SQUARE)
                p5.stroke(colors[i / 2 % colors.length]);
                p5.fill(colors[i / 2 % colors.length])
                p5.beginShape();

                const px = pts[i - 2]
                const py = pts[i - 1]
                const x = pts[i % pts.length]
                const y = pts[(i + 1) % pts.length]
                const vx = x - px;
                const vy = y - py;
                const perpLeft = p5.createVector(-vy, vx)
                perpLeft.normalize()
                const perpRight = perpLeft.copy()
                perpRight.mult(-1)
                perpLeft.mult(w)
                perpRight.mult(w)
                if(widthFunc){
                    w = widthFunc(i / pts.length)
                }else{
                    w *= growthFactor
                }

                if (i === 2) {
                    p5.vertex(px + perpLeft.x, py + perpLeft.y)
                    p5.vertex(px + perpRight.x, py + perpRight.y)
                    ppstart = [px + perpLeft.x, py + perpLeft.y, px + perpRight.x, py + perpRight.y]
                } else {
                    p5.vertex(ppx2, ppy2)
                    p5.vertex(ppx1, ppy1)
                }
                ppx1 = x + perpRight.x
                ppy1 = y + perpRight.y
                ppx2 = x + perpLeft.x
                ppy2 = y + perpLeft.y
                if (i >= pts.length) {
                    p5.vertex(ppstart[2], ppstart[3])
                    p5.vertex(ppstart[0], ppstart[1])
                } else {
                    p5.vertex(ppx1, ppy1)
                    p5.vertex(ppx2, ppy2)
                }

                p5.endShape();

                if (showIndent) {
                    // p5.fill('red')
                    p5.ellipse(px, py, w, w,)
                }
            }
            p5.pop();


        }
        ren()

    }

    insert(t) {
        //
    }
}
