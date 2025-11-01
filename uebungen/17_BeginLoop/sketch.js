
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0, 50);
}

function draw() {
  
  noFill();
  stroke(255);

 

  //Studiere mal den Code ab hier. Welche Blöcke wiederholen sich?
  //Welche Werte verändern sich?

  for (let i=0; i<10; i++){
    
    let distanz = dist (mouseX, mouseY, i*200, height/2);
    let yPos = map (distanz, 0, width, -300, 300);
    ellipse(i * 200, height / 2-yPos, 200, 200);
    if (i%4==0){
      stroke("green");
    }
    else{
      stroke("purple");
    }
}
//ich benötige eine rote ellipse die in der mitte spawnt und sich zur maus hin bewegt
  let distanz = dist (mouseX, mouseY, width/2, height/2);
  let diameter = map (distanz, 0, width, 500, 90);
  stroke("red");
  strokeWeight(5);
ellipse(width/2, height/2, diameter);
}
