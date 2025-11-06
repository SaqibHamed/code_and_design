let x = 0;
let y = 0;
let smoothDiam = 0;
let amp;
let mic;
let hueVal = 0;
let posSlider;


function setup() {
  createCanvas(windowWidth, windowHeight);
  background("black");
  colorMode(HSB, 360, 100, 100);
  noStroke();

  userStartAudio(); // AUDIO QUELLE IST MIC
  mic = new p5.AudioIn();
  mic.start();
  amp = new p5.Amplitude();
  amp.setInput(mic);

  x = width / 2; //POSITION DES CIRCLES IN DIE MITTE
  y = height / 2;


  posSlider=createSlider(0, width, width / 2);
  posSlider.position(10,30);
  posSlider.style('width', '300px');


}

function draw() {
  //background(0, 0, 10);

  // 🔸 Slider-Wert auslesen
  x = posSlider.value(); // x-Position wird vom Slider gesteuert

  let vol = amp.getLevel();
  let diam = map(vol, 0.001, 0.003, 1000, 3000);

  smoothDiam = lerp(smoothDiam, diam, 0.08);

  let hueChange = map(vol, 0, 0.01, 0, 10);
  hueVal = (hueVal + hueChange) % 360;

  fill(0, 0, 0, 0);
  stroke(hueVal, 100, 100);
  strokeWeight(5);

  // 🔸 Kreis wird basierend auf Slider verschoben
  ellipse(x, y, smoothDiam);

  function keyPressed() {
    if (key == 's') {
      saveCanvas('meinBild.png');
    }
  }
}