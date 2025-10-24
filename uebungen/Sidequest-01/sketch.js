let vid; let w = 64; let h = 48; let scl=10;

function setup(){
  createCanvas(w*scl, h*scl);
  vid = createCapture(VIDEO);
  vid.size(w, h);
}
function draw(){
  background(220);
  vid.get();
}