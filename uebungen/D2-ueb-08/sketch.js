function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  //Plan: durchmesser der ellipse abhängig von der distanz zur maus.
  
  //let d = dist(mouseX, mouseY, width / 2, height / 2);
  //let diameter = map(d, 0, width / 2, 50, 200);
  //ellipse(width / 2, height / 2, diameter);

  let durchmesser;
  let distanz = dist(mouseX,mouseY, width/2, height/2);
  console.log(distanz);
  durchmesser = map(distanz, 0, width/2, 10, 500);
  ellipse(width/2, height/2, durchmesser,durchmesser);
}
