let valueSlider

function setup() {

  createCanvas(windowHeight, windowWidth);

  valueSlider=createSlider(-10,38,9);
  valueSlider.position(10,10);
  

  gapSlider=createSlider(-10,38,9);
  gapSlider.position(10,30);
}

function draw() {

  //let inputValue = mouseX; //Part1
  let inputValue = valueSlider.value();
  
  //let inputMin = 0; //Part1
  //let inputMax = 400; //Part1
  let inputMin = -10;
  let inputMax = 58;

  let outputMin = -200;
  let outputMax = 255;

  let outputValue = map(inputValue, inputMin, inputMax, outputMin, outputMax);
  //console.log(outputValue);

  


  fill(30-outputValue);
  rect(0+outputValue,0,200,200);

  fill(30-outputValue);
  rect(0,200+outputValue,200,200);
  
  fill(30-outputValue);
  rect(200,0-outputValue,200,200);
  
  fill(30-outputValue);
  rect(200-outputValue,200,200,200);
}
