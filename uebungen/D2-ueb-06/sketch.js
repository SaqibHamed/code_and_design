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
  let ratio = width / bild.width;
  image(bild,0,0,bild.width*ratio,bild.height*ratio);

  push();
  //Rechteck 1
    translate(width/2+100, height/2);
    rotate(drehwinkel);
    fill(0,0,255);
    rect (0, 0, 200, 200);
  pop();

  push();
  //Rechteck 2
    translate(width/2-100, height/2);
    rotate(drehwinkel*-1);
    fill(0,0,255);
    rect (0, 0, 200, 200);
  pop();

  fill(255,0,0);
  rect(0, 0, 200, 200); 

  drehwinkel = drehwinkel +1;
}
