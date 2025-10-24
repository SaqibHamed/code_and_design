function setup() {
  createCanvas(400, 400);

  let inputValue = mouseX;
  let inputMin = -10;
  
  let inputMax = 38;

  let outputMin = 0;
  let outputMax = 255;

  let outputValue = map(inputValue, inputMin, inputMax, outputMin, outputMax);
  console.log(outputValue);

}

function draw() {
  background(220);
}
