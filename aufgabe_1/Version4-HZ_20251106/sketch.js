let x = 0;
let y = 0;
let smoothDiam = 0;
let amp;
let mic;
let hueVal = 0;
let posSlider;
let preVol= 0;

//Farbwerte für verschiedene Lautstärkepegel
// RGBA Modus
let colorRange = {
  0.0: [255,255,255, 150],//weiß
  0.002: [214,100,160, 150],//rosa
  0.005: [205, 0, 0, 150],//rot
  0.014: [104,169,85, 150],//grün
  0.015: [240,136, 31, 255],//orange
  0.016: [1, 136, 181, 255],//blau
  0.018: [241, 198, 31, 100],//gelb
  0.065: [1,136, 181, 255],//blau
  1.0: [0, 0, 0, 255]//schwarz
}



function setup() {
  createCanvas(windowWidth, windowHeight);
  background("black");
  //colorMode back to RGB
  //colorMode(HSB, 360, 100, 100); 
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
  background(0, 0, 10,0.02);

  // 🔸 Slider-Wert auslesen
  x = posSlider.value(); // x-Position wird vom Slider gesteuert

  let vol = amp.getLevel();
  vol = lerp(preVol, vol, 0.8);

  //console.log(vol);
  let diam = map(vol, 0.0, 0.01, 0, 500);

  //smoothDiam = lerp(smoothDiam, diam, 0.08);

  // Farbwert basierend auf colorRange und Lautstärkepegel
  // key vom Wert colorRange entspricht dem Lautstärkepegel
  // finde den nächsthöheren Schwellenwert
  // finde den nächsttiefere Schwellenwert
  let lowerKey = 0.0;
  let upperKey = 0.0;

  let lowerColor;
  let upperColor;
  //angenommen vol = 0.16
  // werte in colorRange: 0.0, 0.15, 0.18
  //lowerKey => 0.0

  for (let key in colorRange) {
    if (vol >= key) {
      lowerKey = key;
      lowerColor = colorRange[key];
    }
    if (vol < key ) {
      upperKey = key;
      upperColor = colorRange[key];
    }
    
  }

 

  //console.log("Volume:", vol, "lowerKey:", lowerKey, "upperKey:", upperKey);
  //let hueChange = map(vol, 0, 0.01, 0, 10);
  // hueVal = (hueVal + hueChange) % 360;


  //angenommen vol = 0.16
  //upperKey => 0.18
  //lowerKey => 0.15
  // wie lässt sich das in Prozenten ausdrücken?

  let colorFrom = color(lowerColor[0], lowerColor[1], lowerColor[2], lowerColor[3]);
  let colorTo = color(upperColor[0], upperColor[1], upperColor[2], upperColor[3]);
  let positionRatio = map(vol, lowerKey, upperKey, 0, 1);

  let farbe = lerpColor(colorFrom, colorTo, positionRatio);

  fill(0, 0, 0, 0);
  stroke(farbe);
  strokeWeight(5);

  // 🔸 Kreis wird basierend auf Slider verschoben
  ellipse(x, y, diam);


  preVol = vol;

  function keyPressed() {
    if (key == 's') {
      saveCanvas('meinBild.png');
    }
  }
}