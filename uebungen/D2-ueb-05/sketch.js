let posX=0;
let posY=0;
let threshold = 120;
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220,30);
  posX=posX+5; //Tempo Rechts

  if (posX>width){
    posX=0-50;
  }

  if (posX<threshold){
    fill(255, 0, 0);
  }
  else{
    fill(0,0,255);
  }
  if(frameCount%50== 0){
    posY=random(-240,240);
  }
  

  rect(posX, height/2+posY, 50, 50);
}
