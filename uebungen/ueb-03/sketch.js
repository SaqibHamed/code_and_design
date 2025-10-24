let valueSlider

function setup() {
  createCanvas(400, 400);
  valueSlider=createSlider(-10,38,9);
  valueSlider.position(10,10);
}

function draw() {

  //let inputValue = mouseX; //Part1
  let inputValue = valueSlider.value();
  
  //let inputMin = 0; //Part1
  //let inputMax = 400; //Part1
  let inputMin = -10;
  let inputMax = 38;

  let outputMin = 0;
  let outputMax = 255;

  let outputValue = map(inputValue, inputMin, inputMax, outputMin, outputMax);
  //console.log(outputValue);

  background(outputValue);
  fill (255-outputValue);
  ellipse(200, 200, 400, 400);
}
