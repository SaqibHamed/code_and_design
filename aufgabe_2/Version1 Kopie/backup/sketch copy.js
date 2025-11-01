var mouseX=0;
var mouseY=0;

let posX=0;
let posY=0;
let threshold = 10;
let color1Aa = 255;
let color1Ab = 255;
let color1Ac = 255;
let color1Ba = 255;
let color1Bb = 255;
let color1Bc = 255;

let posX2=0;
let posY2=0;
let threshold2 = 8;
let color2Aa = 255;
let color2Ab = 255;
let color2Ac = 255;
let color2Ba = 255;
let color2Bb = 255;
let color2Bc = 255;

let posX3=0;
let posY3=0;
let threshold3 = 20;
let color3Aa = 255;
let color3Ab = 255;
let color3Ac = 255;
let color3Ba = 255;
let color3Bb = 255;
let color3Bc = 255;

function setup() {
  createCanvas(windowWidth, windowHeight);

  color1Aa = random(0,255);
  color1Ab = random(0,255);
  color1Ac = random(0,255);
  color1Ba = random(0,255);
  color1Bb = random(0,255);
  color1Bc = random(0,255);

  color2Aa = random(0,255);
  color2Ab = random(0,255);
  color2Ac = random(0,255);
  color2Ba = random(0,255);
  color2Bb = random(0,255);
  color2Bc = random(0,255);

  color3Aa = random(0,255);
  color3Ab = random(0,255);
  color3Ac = random(0,255);
  color3Ba = random(0,255);
  color3Bb = random(0,255);
  color3Bc = random(0,255);

  
}

function draw() {
  background(0,20);

  // ---- LAYER NR1 -------------------------------------------

  posY=posY+random(5,20); //Tempo Runter

  if (posY>width){
    posY=0-50;
  }
  if (posY<threshold){
    fill(color1Aa,color1Ab,color1Ac);
  }
  else{
    fill(color1Ba,color1Bb,color1Bc);
  }
  if(frameCount%30== 0){
    posX=random(0,windowWidth);
  }
  
  ellipse(posX, height/8+posY, random(5,20));

  // ---- LAYER NR1 B -------------------------------------------

  posY=posY+random(1,6); //Tempo Runter

  if (posY>width){
    posY=0-50;
  }
  if (posY<threshold){
    fill(color1Ba,color1Bb,color1Bc);
  }
  else{
    fill(color1Aa,color1Ab,color1Ac);
  }
  if(frameCount%80== 0){
    posX=random(0,windowWidth);
  }
  
  ellipse(posX, height/8+posY, random(5,20));

  // ---- LAYER NR1 C -------------------------------------------

  posY=posY+random(1,10); //Tempo Runter

  if (posY>width){
    posY=0-50;
  }
  if (posY<threshold){
    fill(color1Ba,color1Bb,color1Bc);
  }
  else{
    fill(color1Aa,color1Ab,color1Ac);
  }
  if(frameCount%80== 0){
    posX=random(0,windowWidth);
  }
  
  ellipse(posX, height/8+posY, random(5,40));

  // ---- LAYER NR2 A -------------------------------------------

  posY2=posY2+random(-10,5); //Tempo Runter

  if (posY2>width){
    posY2=0-50;
  }
  if (posY2<threshold2){
    fill(color2Aa,color2Ab,color2Ac);
  }
  else{
    fill(color2Ba,color2Bb,color2Bc);
  }
  if(frameCount%60== 0){
    posX2=random(0,windowWidth);
  }
  
  ellipse(posX2, height/8+posY2, random(5,10));

  // ---- LAYER NR2 B -------------------------------------------

  posY2=posY2+random(5,20); //Tempo Runter

  if (posY2>width){
    posY2=0-50;
  }
  if (posY2<threshold2){
    fill(color2Ba,color2Bb,color2Bc);
  }
  else{
    fill(color2Aa,color2Ab,color2Ac);
  }
  if(frameCount%34== 0){
    posX2=random(0,windowWidth);
  }
  
  ellipse(posX2, height/2+posY2, random(5,8));

  // ---- LAYER NR2 C -------------------------------------------

  posY2=posY2+random(10,15); //Tempo Runter

  if (posY2>width){
    posY2=0-50;
  }
  if (posY2<threshold2){
    fill(color2Ba,color2Bb,color2Bc);
  }
  else{
    fill(color2Aa,color2Ab,color2Ac);
  }
  if(frameCount%15== 0){
    posX2=random(0,windowWidth);
  }
  
  ellipse(posX2, height/2+posY2, random(2,10));

  // ---- LAYER NR3 A -------------------------------------------

  posY3=posY3+random(5,70); //Tempo runter

  if (posY3>width){
    posY3=0-50;
  }
  if (posY3<threshold3){
    fill(color3Aa,color3Ab,color3Ac);
  }
  else{
    fill(color3Ba,color3Bb,color3Bc);
  }
  if(frameCount%40== 0){
    posX3=random(0,windowWidth);
  }
  
  ellipse(posX3, height/8+posY3, random(5,20));



  // ---- LAYER NR3 B -------------------------------------------

  posY3=posY3+random(5,20); //Tempo runter

  if (posY3>width){
    posY3=0-50;
  }
  if (posY3<threshold3){
    fill(color3Ba,color3Bb,color3Bc);
  }
  else{
    fill(color3Aa,color3Ab,color3Ac);
  }
  if(frameCount%20== 0){
    posX3=random(0,windowWidth);
  }
  
  ellipse(posX3, height/8+posY3, random(5,20));

  // ---- LAYER NR3 C -------------------------------------------

  posY3=posY3+random(5,80); //Tempo runter

  if (posY3>width){
    posY3=0-50;
  }
  if (posY3<threshold3){
    fill(color3Ba,color3Bb,color3Bc);
  }
  else{
    fill(color3Aa,color3Ab,color3Ac);
  }
  if(frameCount%50== 0){
    posX3=random(0,windowWidth);
  }
  
  ellipse(posX3, height/8+posY3, random(5,20));

  // -----------------------------------------------------------

  //create a rectangle that blocks that stops the elipse moving down and sends it to the top again like an ubrella in the Rain
  //mouseX=winMouseX;
  //mouseY=winMouseY;
  //fill(150,75,0);
  //rect(mouseX, mouseY, width/6, 20);

}

