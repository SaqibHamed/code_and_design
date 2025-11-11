var mouseX=0;
var mouseY=0;

let SLIDERPOS = 0;

let rando=0;

let posX=[];
let posY=[];
let generations=40;

function setup() {
  createCanvas(windowWidth, windowHeight);

  
  for (let i = 0; i < generations; i++) {
    posX[i] = random(width);
    posY[i] = random(height);
  }
}
function mousePressed() {
  fill(255);
  ellipse(mouseX, mouseY, 2500);

}

function draw() {

  background(0,10);

    for (let i=0; i<generations; i++){
      posY[i] += random(1, 5 + i); // jede Generation etwas schneller

    if (posY[i] > height) {
      posY[i] = -20;
      posX[i] = random(width);
    }
    console.log(i);
  //----------- Code für Generationen ------------

  let rando= random(2);
  let binZahl = floor(rando);

  if (posY[i]>height){
    posY[i]=-50;
  }
  
  if(frameCount%60== 0){
    posX[i]+=random(0,windowWidth);
  }
  fill("green");
  textSize(15);
  textAlign(CENTER, CENTER);
  if (binZahl == 0){
    text("0", posX[i], posY[i]);
}
else { // Wenn es nicht 0 ist, muss es 1 sein!
    text("1", posX[i], posY[i]);
}
//ellipse(posX[i], posY[i], 15);
}




}
