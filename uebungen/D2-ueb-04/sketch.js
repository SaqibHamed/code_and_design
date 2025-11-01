let posX=0;
let posY=0;


function setup() {
  createCanvas(400, 400);
  posY=(height/2);
}

function draw() {
  background(220);
  let amplitude = 100;
  rect(posX, posY,50, 50); 
  posX=posX+20; //Tempo Rechts
  if (posX>width){
    posX=0-50;
  }
  posY=(posY+sin(1,0)); //Tempo (Oben und Unten)
  if (posY>height){
    posY=0-50;
  }
  else if (posY>height-1){
    posY=height+1;
  }
}
