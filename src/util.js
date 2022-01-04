
export const fbm = (p5,vec) => {
    // Initial values
    let value = 0.0;
    let amplitude = 2.0;
    const frequency = 0;
    //
    // Loop of octaves
    for (let i = 0; i < 6; i++) {
        value += amplitude * p5.noise(vec.x, vec.y);
        vec.mult(2);
        amplitude *= 0.5;
    }
    return value;
};

//vertices are {x,y}[]
//https://editor.p5js.org/slow_izzm/sketches/gh_U2jZyu
export function polyPoint(vertices, px, py) {
    let collision = false;

    // go through each of the vertices, plus
    // the next vertex in the list
    let next = 0;
    for (let current = 0; current < vertices.length; current++) {

        // get next vertex in list
        // if we've hit the end, wrap around to 0
        next = current + 1;
        if (next == vertices.length) next = 0;

        // get the Vectors at our current position
        // this makes our if statement a little cleaner
        let vc = vertices[current]; // c for "current"
        let vn = vertices[next]; // n for "next"

        // compare position, flip 'collision' variable
        // back and forth
        if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) &&
            (px < (vn.x - vc.x) * (py - vc.y) / (vn.y - vc.y) + vc.x)) {
            collision = !collision;
        }
    }
    return collision;
}
