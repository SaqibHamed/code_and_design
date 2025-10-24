
let durchmesser;
durchmesser=0;

let farbe;
farbe="red";

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {

  
  fill(farbe);
  rect(180, 250, 150, 100, 30);

  fill (0, 0, 255, 100);
  ellipse(mouseX,mouseY, durchmesser+noise(1200), durchmesser);
  durchmesser = durchmesser+5;
  
  if (durchmesser==200){
    durchmesser=0;
    removeElements();
  }

if (farbe=="red"){
  farbe="green";
}
else if (farbe=="green"){
  farbe="blue";
}
else if (farbe=="blue"){
  farbe="red";
}

  //fill(155,100);
  //ellipse(180+mouseY, 250, mouseX);

  //fill(blue+mouseX);
  //ellipse(durchmesser+(mouseY*-1), 250, mouseX+(mouseY*-1));
}