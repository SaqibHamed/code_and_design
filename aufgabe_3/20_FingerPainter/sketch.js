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
let handpose;             // Das ml5.js HandPose-Modell
let video;                // Die Webcam
let hands = [];           // Array mit allen erkannten Händen
let ratio;                // Skalierungsfaktor zwischen Video und Canvas
let isModelReady = false; // Flag, ob das Modell geladen und Hände erkannt wurden

// Layer fürs Zeichnen
let drawingLayer;

// Abstand in Pixeln, unter dem Daumen/Zeigefinger als "Pinch" zählen
let pinchThreshold = 40;

// Persistente Stroke-Positionen pro Hand und Fingerkuppe
// prevTipPosPerHand[handIndex] = [{x,y}, ... für 5 Fingerspitzen]
let prevTipPosPerHand = [];

// Reset-Kreis (unten mittig)
let resetCircleRadius = 60;
let resetCircleYOffset = 80; // Abstand vom unteren Rand

// Fingertip-Indices und Farben
const fingertipIndices = [4, 8, 12, 16, 20];
const fingertipColors = [
  [255, 100, 100], // Daumen
  [0, 0, 255],     // Zeigefinger (blau)
  [120, 255, 150], // Mittelfinger
  [255, 200, 100], // Ringfinger
  [200, 120, 255]  // Kleiner Finger
];

// Straightness: Verhältnis (direkte Distanz / Summe Segmentlängen)
const straightnessThreshold = 0.85;

// Mindest-Distanz (Pixel) der direkten Strecke Basis->Spitze, damit Finger als "gestreckt" zählt
//              thumb index middle ring pinky
const fingertipMinDirect = [40,   35,   35,   35,   35];

/**
 * Lädt das HandPose-Modell vor dem Setup
 * Diese Funktion wird automatisch vor setup() ausgeführt
 */
function preload() {
  // Multi-Hand-Tracking bis zu 6 Hände
  handpose = ml5.handPose({ maxHands: 6 });
}

/**
 * Initialisiert Canvas und Webcam
 */
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); // Performance

  // separater Layer für persistente Zeichnung
  drawingLayer = createGraphics(windowWidth, windowHeight);
  drawingLayer.clear();

  // Webcam einrichten
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // Versteckt das Standard-Video-Element

  // Skalierungsfaktor fürs Video -> Canvas
  ratio = width / video.width;

  // Hand-Erkennung starten
  handpose.detectStart(video, gotHands);
}

/**
 * Hauptzeichnungs-Loop
 */
function draw() {
  background(0);

  // Darstellung horizontal spiegeln (wie im Spiegel)
  push();
  translate(width, 0);
  scale(-1, 1);

  // Video
  image(video, 0, 0, video.width * ratio, video.height * ratio);

  // Zeichnungslayer oben drüber
  image(drawingLayer, 0, 0, width, height);

  // Reset-Kreis (Pinch to reset)
  drawResetCircle();

  // Nur zeichnen, wenn Modell bereit ist
  if (isModelReady) {
    drawHandPoints();      // Finger anzeigen + zeichnen, wenn gerade/aktiv
    drawWithIndexFinger(); // nur noch für "Pinch zum Reset"
  }

  pop();
}

/**
 * Callback-Funktion für HandPose-Ergebnisse
 * 
 * @param {Array} results - Array mit erkannten Händen
 */
function gotHands(results) {
  hands = results;

  if (hands.length > 0) {
    isModelReady = true;
  } else {
    // keine Hand -> Stroke-Historie zurücksetzen
    prevTipPosPerHand = [];
  }
}

/**
 * Zeichnet alle erkannten Hand-Keypoints
 * und legt die Logik für "Finger gestreckt" + Zeichnen fest
 */
function drawHandPoints() {
  // alle erkannten Hände
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];

    // Finger-Linien (zur Orientierung)
    stroke(255, 0, 0);
    strokeWeight(2);

    let fingerChains = [
      [0, 1, 2, 3, 4],   // Daumen
      [0, 5, 6, 7, 8],   // Zeigefinger
      [0, 9, 10, 11, 12],
      [0, 13, 14, 15, 16],
      [0, 17, 18, 19, 20]
    ];

    for (let chain of fingerChains) {
      for (let k = 0; k < chain.length - 1; k++) {
        let a = hand.keypoints[chain[k]];
        let b = hand.keypoints[chain[k + 1]];
        line(
          a.x * ratio, a.y * ratio,
          b.x * ratio, b.y * ratio
        );
      }
    }

    // Initialisiere Stroke-Historie für diese Hand falls nötig
    if (!prevTipPosPerHand[i]) {
      prevTipPosPerHand[i] = new Array(fingertipIndices.length).fill(null);
    }

    // alle 21 Keypoints einer Hand
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];

      // Ist das eine Fingerspitze?
      let tipIdx = fingertipIndices.indexOf(j);

      if (tipIdx !== -1) {
        // Chain für diesen Finger bestimmen
        let chain;
        if (j === 4) chain = [1, 2, 3, 4];        // Daumen
        else if (j === 8) chain = [5, 6, 7, 8];   // Zeigefinger
        else if (j === 12) chain = [9, 10, 11, 12];
        else if (j === 16) chain = [13, 14, 15, 16];
        else if (j === 20) chain = [17, 18, 19, 20];

        // Straightness: direkte Distanz vs. Summe der Segmente
        let sumSeg = 0;
        for (let s = 0; s < chain.length - 1; s++) {
          let pA = hand.keypoints[chain[s]];
          let pB = hand.keypoints[chain[s + 1]];
          sumSeg += dist(
            pA.x * ratio, pA.y * ratio,
            pB.x * ratio, pB.y * ratio
          );
        }

        let pBase = hand.keypoints[chain[0]];
        let pTip  = hand.keypoints[chain[chain.length - 1]];
        let direct = dist(
          pBase.x * ratio, pBase.y * ratio,
          pTip.x  * ratio, pTip.y  * ratio
        );

        let ratioStraight = (sumSeg > 0) ? direct / sumSeg : 0;

        // Mindestdirektdistanz pro Finger (wichtig für "Spitze nahe Start")
        let minDirect = fingertipMinDirect[tipIdx] || 0;

        // Finger gilt als gestreckt/aktiv
        let isStraight = (ratioStraight > straightnessThreshold) && (direct > minDirect);

        // Farbe der Fingerspitze
        let col = fingertipColors[tipIdx];

        if (isStraight) {
          // aktive Fingerspitze: farbiger Punkt + heller Rand
          noStroke();
          fill(col[0], col[1], col[2]);
          circle(keypoint.x * ratio, keypoint.y * ratio, 14);

          stroke(255);
          strokeWeight(2);
          noFill();
          circle(keypoint.x * ratio, keypoint.y * ratio, 18);

          // PERSISTENTES ZEICHNEN nur mit gestreckten Fingern
          // Wenn du NUR mit dem Zeigefinger zeichnen willst:
          // if (j === 8) { ... } drumherum setzen.
          let prev = prevTipPosPerHand[i][tipIdx];
          let cx = keypoint.x * ratio;
          let cy = keypoint.y * ratio;

          drawingLayer.push();
          drawingLayer.stroke(col[0], col[1], col[2]);
          drawingLayer.strokeWeight(8);
          drawingLayer.strokeCap(ROUND);

          if (prev) {
            drawingLayer.line(prev.x, prev.y, cx, cy);
          } else {
            drawingLayer.point(cx, cy);
          }

          drawingLayer.pop();

          // aktuelle Position als vorherige speichern
          prevTipPosPerHand[i][tipIdx] = { x: cx, y: cy };
        } else {
          // Gebogener Finger: nur gedämpfter Umriss
          noFill();
          stroke(col[0] * 0.6, col[1] * 0.6, col[2] * 0.6, 200);
          strokeWeight(3);
          circle(keypoint.x * ratio, keypoint.y * ratio, 12);

          // Stroke unterbrechen
          prevTipPosPerHand[i][tipIdx] = null;
        }
      } else {
        // Kein Fingertip: kleiner grüner Punkt
        fill(0, 255, 0);
        noStroke();
        circle(keypoint.x * ratio, keypoint.y * ratio, 8);
      }
    }
  }
}

/**
 * Nur noch für:
 * Wenn Daumen (4) und Zeigefinger (8) sich berühren UND
 * der Pinch-Mittelpunkt im Reset-Kreis ist -> Canvas löschen.
 */
function drawWithIndexFinger() {
  if (hands.length === 0) return;

  let resetX = width / 2;
  let resetY = height - resetCircleYOffset;

  // Jede Hand auf Pinch innerhalb des Reset-Kreises prüfen
  for (let h = 0; h < hands.length; h++) {
    let hand = hands[h];
    if (!hand || !hand.keypoints || hand.keypoints.length < 9) continue;

    let indexTip = hand.keypoints[8];
    let thumbTip = hand.keypoints[4];

    let ix = indexTip.x * ratio;
    let iy = indexTip.y * ratio;
    let tx = thumbTip.x * ratio;
    let ty = thumbTip.y * ratio;

    let pinchDist = dist(ix, iy, tx, ty);
    let mx = (ix + tx) / 2;
    let my = (iy + ty) / 2;

    // Pinch + Mittelpunkt innerhalb des Reset-Kreises?
    if (pinchDist < pinchThreshold && dist(mx, my, resetX, resetY) < resetCircleRadius) {
      // Canvas leeren
      drawingLayer.clear();
      prevTipPosPerHand = []; // Stroke-Historie zurücksetzen

      // visuelles Feedback (roter Kreis am Pinch-Punkt)
      push();
      noFill();
      stroke(255, 0, 0);
      strokeWeight(3);
      ellipse(mx, my, 60, 60);
      pop();

      return;
    }
  }
}

/**
 * Reset-Kreis unten in der Mitte zeichnen
 */
function drawResetCircle() {
  let cx = width / 2;
  let cy = height - resetCircleYOffset;

  push();
  // leicht dunkler Hintergrundkreis
  noStroke();
  fill(0, 0, 0, 140);
  ellipse(cx, cy, (resetCircleRadius * 2) + 8, (resetCircleRadius * 2) + 8);

  // heller Rand
  noFill();
  stroke(255);
  strokeWeight(2);
  ellipse(cx, cy, resetCircleRadius * 2, resetCircleRadius * 2);

  // Text
  noStroke();
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text('Pinch to reset', cx, cy);
  pop();
}
