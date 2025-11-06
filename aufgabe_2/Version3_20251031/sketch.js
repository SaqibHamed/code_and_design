var mouseX=0;
var mouseY=0;

let SLIDERPOS = 0;

let posX=[];
let posY=[];
let generations=80;
let threshold = mouseY;

let color1Aa, color1Ab, color1Ac;
let color1Ba, color1Bb, color1Bc;



function setup() {
  createCanvas(windowWidth, windowHeight);
  color1Aa = random(0,255);
  color1Ab = random(0,255);
  color1Ac = random(0,255);
  color1Ba = random(0,255);
  color1Bb = random(0,255);
  color1Bc = random(0,255);
  
  for (let i = 0; i < generations; i++) {
    posX[i] = random(width);
    posY[i] = random(height);
  }
}
function mousePressed() {
  fill(255);
  ellipse(mouseX, mouseY, 2500);
  color1Aa = random(0,255);
  color1Ab = random(0,255);
  color1Ac = random(0,255);
  color1Ba = random(0,255);
  color1Bb = random(0,255);
  color1Bc = random(0,255);
}

function draw() {
  threshold = mouseY;
  
  background(0,10);

    for (let i=0; i<generations; i++){
      posY[i] += random(1, 5 + i); // jede Generation etwas schneller

    if (posY[i] > height) {
      posY[i] = -20;
      posX[i] = random(width);
    }


    if (generations%6==0){
      fill("green");
    }
    else if(generations%5==0){
      fill("purple");
    }
    else if(generations%4==0){
      fill("orange");
    }
    else if(generations%3==0){
      fill("red");
    }
    else if(generations%2==0){
      fill("blue");
    }
    else{
      fill("yellow");
    }

    console.log(i);

  

  //----------- Code für Generationen ------------
  posY[i]=posY[i]+random(1,20); //Tempo nach unten

  if (posY[i]>height){
    posY[i]=-50;
  }
  if (posY[i] <threshold){
    fill(random(color1Aa),random(color1Ab),random(color1Ac));
  }
  else{
    fill(random(color1Ba),random(color1Bb),random(color1Bc));
  }
  if(frameCount%40== 0){
    posX[i]+=random(0,windowWidth);
  }
  
ellipse(posX[i], posY[i], random(5, 20));
}




}
