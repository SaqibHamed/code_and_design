let x = 0;
let y = 0;

let amp;
let mic;
let hueVal = 0;
let posSlider;
let preVol = 0;

let smoothX; 
let smoothDiam = 0;

// ⭐ NEU: Skalierungsfaktor (kannst du live anpassen)
let scaleFactor = 0.05; // z.B. 0.2 = 20 % der bisherigen Größe

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("black");
  colorMode(HSB, 360, 100, 100);
  noStroke();

  userStartAudio();
  mic = new p5.AudioIn();
  mic.start();
  amp = new p5.Amplitude();
  amp.setInput(mic);
  amp.smooth(0.9);

  x = width / 2;
  y = height / 2;
  smoothX = x;

  posSlider = createSlider(0, width, width / 2);
  posSlider.position(10,30);
  posSlider.style('width', '300px');
}

function draw() {
  background(0, 0, 10, 0.02);

  let targetX = posSlider.value();
  smoothX = lerp(smoothX, targetX, 0.1);

  let vol = amp.getLevel();
  vol = lerp(preVol, vol, 0.2);

  // 🔸 Basisdurchmesser berechnen
  let diamTarget = map(vol, 0.00, 0.01, 0, 8000);

  // 🔸 Kreisdurchmesser glätten
  smoothDiam = lerp(smoothDiam, diamTarget, 0.2);

  // ⭐ Hier Radius "messen" und skalieren
  let radius = smoothDiam / 2;
  let scaledRadius = radius * scaleFactor; // proportional kleiner machen
  let scaledDiam = scaledRadius * 2;       // wieder in Durchmesser umrechnen

  // Farbe anpassen
  let hueChange = map(vol, 0, 0.01, 0, 10);
  hueVal = (hueVal + hueChange) % 360;

  fill(0, 0, 0, 0);
  stroke(hueVal, 100, 100);
  strokeWeight(5);

  // ⭐ Kreis mit skalierter Größe zeichnen
  ellipse(smoothX, y, scaledDiam);

  preVol = vol;

  // Optional: Radius im Console-Log ausgeben
  // console.log("Radius:", scaledRadius);
}

function keyPressed() {
  if (key == 's') {
    saveCanvas('meinBild.png');
  }
}
