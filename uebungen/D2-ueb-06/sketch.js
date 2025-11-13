var drehwinkel=0;
let bild;

function preload() {
  bild = loadImage('Project-B-1.png');
}

function setup() {
  createCanvas(400, 400);
  rectMode (CENTER);
  angleMode(DEGREES);
}

function draw() {
  background(220);

  push();
    translate(width / 2, height / 2);
    rotate(radians(drehwinkel));

    fill(0, 0, 255);
    rect(150, 0, 100, 100); // 150px Orbit-Radius
  pop();

  drehwinkel += 1;
}
