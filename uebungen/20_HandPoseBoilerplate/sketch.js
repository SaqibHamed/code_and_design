/**
 * HandPose Boilerplate mit ml5.js
 * 
 * Dieses Sketch erkennt Hände über die Webcam und zeichnet die erkannten Keypoints.
 * Es dient als Ausgangspunkt für eigene Hand-Tracking-Projekte.
 * 
 * Dokumentation: https://docs.ml5js.org/#/reference/handpose
 * 
 * Jede Hand hat 21 Keypoints (0-20):
 * - 0: Handgelenk
 * - 1-4: Daumen
 * - 5-8: Zeigefinger
 * - 9-12: Mittelfinger
 * - 13-16: Ringfinger
 * - 17-20: Kleiner Finger
 */

// Globale Variablen
let handpose;           // Das ml5.js HandPose-Modell
let video;              // Die Webcam
let hands = [];         // Array mit allen erkannten Händen
let ratio;              // Skalierungsfaktor zwischen Video und Canvas
let isModelReady = false; // Flag, ob das Modell geladen und Hände erkannt wurden
let pinchThreshold = 40; // Abstand in Pixeln unter dem das Quadrat als "Pinch" gilt
// Gamification: circles that appear and can be removed with pinch
let circles = [];
let spawnInterval = 120; // frames between spawns
let lastSpawnFrame = 0;
let maxCircles = 300;
let pinchRemoveRadius = 80; // radius in which pinch removes circles
let removedCount = 0;
// Per-hand pinch state tracking
let handStates = []; // one entry per detected hand index: { state: 'blue'|'red'|'violet', pinchStart: millis(), mx,my,d }
let pinchHoldMillis = 500; // 0.5s to transition red -> violet

/**
 * Lädt das HandPose-Modell vor dem Setup
 * Diese Funktion wird automatisch vor setup() ausgeführt
 */
function preload() {
  handpose = ml5.handPose({maxHands: 8});
}

/**
 * Initialisiert Canvas und Webcam
 */
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); // Performanceoptimierung
  
  // Webcam einrichten
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // Versteckt das Standard-Video-Element
  
  // Berechne Skalierungsfaktor für Video-zu-Canvas-Anpassung
  ratio = width / video.width;
  
  // Starte Hand-Erkennung
  handpose.detectStart(video, gotHands);
}

/**
 * Hauptzeichnungs-Loop
 */
function draw() {
  background(0);

  // Spiegle die Darstellung horizontal (für intuitivere Interaktion)
  push();
  translate(width, 0);
  scale(-1, 1);

  //Zeige das Video (optional)
  image(video, 0, 0, video.width * ratio, video.height * ratio);
  
  // Zeichne nur, wenn das Modell bereit ist und Hände erkannt wurden
  if (isModelReady) {
    drawHandPoints();
    
    // Quadrat zwischen Keypoint 4 (Daumen) und 8 (Zeigefinger) zeichnen.
    // Das Quadrat sitzt im Mittelpunkt beider Punkte und skaliert mit dem Abstand.
    drawMidpointSquare();
    // Gamification: spawn and draw circles, handle removals
    updateCircles();
    
  }
  
  pop();
}

/**
 * Callback-Funktion für HandPose-Ergebnisse
 * Wird automatisch aufgerufen, wenn neue Hand-Daten verfügbar sind
 * 
 * @param {Array} results - Array mit erkannten Händen
 */
function gotHands(results) {
  hands = results;
  
  // Setze Flag, sobald erste Hand erkannt wurde
  if (hands.length > 0) {
    isModelReady = true;
  }
}

/**
 * Zeichnet alle erkannten Hand-Keypoints
 * Jede Hand hat 21 Keypoints (siehe Kommentar oben)
 */
function drawHandPoints() {
  // Durchlaufe alle erkannten Hände (normalerweise max. 2)
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    
    // Durchlaufe alle 21 Keypoints einer Hand
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      
      // Zeichne Keypoint als grüner Kreis
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x * ratio, keypoint.y * ratio, 10);
    }
  }
}

/**
 * Zeichnet ein Quadrat im Mittelpunkt zwischen Keypoint 4 und 8.
 * Die Größe des Quadrats skaliert mit dem Abstand der beiden Punkte.
 */
function drawMidpointSquare() {
  if (!hands || hands.length === 0) return;

  // Farben (RGB) für mehrere Hände, rot für Pinch bleibt gleich
  const outlineColors = [ [0,200,255], [255,150,0], [120,255,100], [200,100,255] ];

  for (let h = 0; h < hands.length; h++) {
    let hand = hands[h];
    if (!hand || !hand.keypoints || hand.keypoints.length < 9) continue;

    // Keypoints 4 (Daumen) und 8 (Zeigefinger)
    let thumb = hand.keypoints[4];
    let index = hand.keypoints[8];

    // Auf Canvas skalierte Koordinaten
    let tx = thumb.x * ratio;
    let ty = thumb.y * ratio;
    let ix = index.x * ratio;
    let iy = index.y * ratio;

    // Abstand und Mittelpunkt
    let d = dist(tx, ty, ix, iy);
    let mx = (tx + ix) / 2;
    let my = (ty + iy) / 2;

    // ensure handStates entry exists
    if (!handStates[h]) {
      handStates[h] = { state: 'blue', pinchStart: 0, mx: mx, my: my, d: d };
    }

    // Update tracking info
    handStates[h].mx = mx;
    handStates[h].my = my;
    handStates[h].d = d;

    // State transitions: blue -> red when pinch begins, red -> violet after hold
    if (d < pinchThreshold) {
      if (handStates[h].state === 'blue') {
        handStates[h].state = 'red';
        handStates[h].pinchStart = millis();
      } else if (handStates[h].state === 'red') {
        // has it been held long enough to become violet?
        if (millis() - handStates[h].pinchStart >= pinchHoldMillis) {
          handStates[h].state = 'violet';
        }
      }
      // if violet, remain until fingers separate
    } else {
      // fingers released -> reset to blue (allow new pinches)
      handStates[h].state = 'blue';
      handStates[h].pinchStart = 0;
    }

    // Größe: mappe einen erwartbaren Distanzbereich auf eine Pixelgröße
    let size = map(d, 0, 400, 10, 300);
    size = constrain(size, 6, min(width, height));

    // Winkel von Daumen -> Zeigefinger
    let dx = ix - tx;
    let dy = iy - ty;
    let angle = atan2(dy, dx);

    push();
    translate(mx, my);
    rotate(angle);
    rectMode(CENTER);

    // Draw square based on current pinch state (blue/red/violet)
    let hs = handStates[h] || { state: 'blue' };
    if (hs.state === 'red') {
      noStroke();
      fill(255, 80, 80, 180);
      rect(0, 0, size, size);
      noFill();
      stroke(200, 30, 30);
      strokeWeight(3);
      rect(0, 0, size + 6, size + 6);
    } else if (hs.state === 'violet') {
      // violet filled/outlined square: indicates locked state, cannot remove spots
      noStroke();
      fill(180, 80, 200, 190);
      rect(0, 0, size, size);
      noFill();
      stroke(150, 50, 180);
      strokeWeight(3);
      rect(0, 0, size + 6, size + 6);
    } else {
      noFill();
      let c = outlineColors[h % outlineColors.length];
      stroke(c[0], c[1], c[2]);
      strokeWeight(3);
      rect(0, 0, size, size);
    }
    pop();

    // Marker an den beiden Punkten für diese Hand
    noStroke();
    fill(255, 100, 100);
    circle(tx, ty, 8);
    fill(100, 255, 100);
    circle(ix, iy, 8);
  }
}

/** Gamification: spawn black circles and allow pinch to remove them */
function spawnCircle() {
  if (circles.length >= maxCircles) return;
  // spawn within the visible video area (video.width*ratio x video.height*ratio)
  let w = video.width * ratio;
  let h = video.height * ratio;
  // because canvas is mirrored, spawn in the same coordinate system used for drawing
  let cx = random(0, w);
  let cy = random(0, h);
  circles.push({ x: cx, y: cy, r: random(8, 26) });
}

function removeCirclesAt(x, y, radius) {
  let before = circles.length;
  circles = circles.filter(c => {
    return dist(c.x, c.y, x, y) > radius;
  });
  removedCount += (before - circles.length);
}

function updateCircles() {
  // spawn new circle occasionally
  if (frameCount - lastSpawnFrame > spawnInterval) {
    spawnCircle();
    lastSpawnFrame = frameCount;
    // slowly increase spawn rate over time (optional), keep modest
    if (spawnInterval > 30 && frameCount % 1200 === 0) spawnInterval -= 5;
  }

  // Draw all circles (they should be drawn in the same mirrored coordinate space
  // as video and the squares). We are inside the mirrored push/pop in draw().
  noStroke();
  fill(0, 200); // black with slight alpha
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    circle(c.x, c.y, c.r * 2);
  }

  // Handle pinch removals: check all hands, if pinched remove nearby circles
  if (hands && hands.length > 0) {
    for (let h = 0; h < hands.length; h++) {
      // use the computed handStates from drawMidpointSquare to decide removal
      let hs = handStates[h];
      if (!hs) continue;
      // only remove when in the 'red' pinch state — not when violet
      if (hs.state === 'red') {
        removeCirclesAt(hs.mx, hs.my, pinchRemoveRadius);
      }
    }
  }

  // HUD: show counts
  push();
  resetMatrix(); // draw HUD in screen coords (not mirrored)
  translate(10, 24);
  fill(255);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  text(`Circles: ${circles.length}`, 0, 0);
  text(`Removed: ${removedCount}`, 0, 18);
  pop();
}

