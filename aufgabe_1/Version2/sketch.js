function setup() {
  createCanvas(windowWidth, windowHeight);
  valueSlider=createSlider(-10,38,9);
  valueSlider.position(10,10);

  strokeSlider=createSlider(-10,38,9);
  strokeSlider.position(10,30);

}

function draw() {


//-------------------------------------------------------------------


  //let inputValue = mouseX; //Part1
  let inputValue = valueSlider.value();
  
  //let inputMin = 0; //Part1
  //let inputMax = 400; //Part1
  let inputMin = 0;
  let inputMax = 50;

  let outputMin = 0;
  let outputMax = 600;

  let outputValue = map(inputValue, inputMin, inputMax, outputMin, outputMax);
  //console.log(outputValue);


//-------------------------------------------------------------------


  let input2Value = strokeSlider.value();
  
  //let inputMin = 0; //Part1
  //let inputMax = 400; //Part1
  let input2Min = 0;
  let input2Max = 50;

  let output2Min = 0.5;
  let output2Max = 5;

  let output2Value = map(input2Value, input2Min, input2Max, output2Min, output2Max);
  //console.log(outputValue);


//-------------------------------------------------------------------


  stroke("red");
  strokeWeight(strokeSlider);
  ellipse((windowWidth/2),(windowHeight/2), 100+outputValue, 500+outputValue);

  stroke("green");
  strokeWeight(strokeSlider);
  fill(255,255,255,0)
  ellipse((windowWidth/2),(windowHeight/2), 500+outputValue, 100+outputValue);

  stroke("blue");
  strokeWeight(strokeSlider);
  fill(255,255,255,0)
  ellipse((windowWidth/2),(windowHeight/2), 500+outputValue, 500+outputValue);
  
  
}
