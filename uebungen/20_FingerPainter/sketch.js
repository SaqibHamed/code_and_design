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

// NEU: Layer fürs Zeichnen + vorheriger Zeigefingerpunkt
let drawingLayer;
let prevIndexPos = null;
let pinchThreshold = 40; // Abstand in Pixeln, unter dem Daumen/Zeigefinger als "Berührung" zählen
// persistent stroke positions per hand and per fingertip (arrays)
let prevTipPosPerHand = []; // prevTipPosPerHand[handIndex] = [{x,y},... for 5 fingertips]
// Reset circle (bottom center) config
let resetCircleRadius = 60;
let resetCircleYOffset = 80; // distance from bottom
// fingertip colors and straightness
const fingertipIndices = [4, 8, 12, 16, 20];
const fingertipColors = [
  [255, 100, 100], // thumb
  [0, 0, 255], // index (blue)
  [120, 255, 150], // middle
  [255, 200, 100], // ring
  [200, 120, 255]  // pinky
];
const straightnessThreshold = 0.85; // ratio direct/distSum > threshold => straight
// minimum direct distance (pixels) per fingertip to be considered straight (helps thumb detection)
const fingertipMinDirect = [40, 0, 0, 0, 0]; // thumb requires larger direct distance

/**
 * Lädt das HandPose-Modell vor dem Setup
 * Diese Funktion wird automatisch vor setup() ausgeführt
 */
function preload() {
  // enable multi-hand tracking up to 6 hands
  handpose = ml5.handPose({maxHands: 6});
}

/**
 * Initialisiert Canvas und Webcam
 */
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); // Performanceoptimierung
  
  // NEU: separater Layer für persistente Zeichnung
  drawingLayer = createGraphics(windowWidth, windowHeight);
  drawingLayer.clear();
  
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

  // Zeige das Video
  image(video, 0, 0, video.width * ratio, video.height * ratio);
  
  // NEU: Zeichnungslayer oben drüber legen
  image(drawingLayer, 0, 0, width, height);

  // Draw reset circle at bottom center (mirrored coordinate space)
  drawResetCircle();
  
  // Zeichne nur, wenn das Modell bereit ist und Hände erkannt wurden
  if (isModelReady) {
    drawHandPoints();
    
    // NEU: Mit Zeigefinger zeichnen & Pinch zum Löschen
    drawWithIndexFinger();
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
  } else {
    // Wenn keine Hand da ist, vorherigen Punkt zurücksetzen
    prevIndexPos = null;
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

    // Finger-Linien (optional, nur zur Orientierung)
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
    
    // Durchlaufe alle 21 Keypoints einer Hand
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];

      // If this is a fingertip, draw it with its own color and indicate straightness
      let tipIdx = fingertipIndices.indexOf(j);
      if (tipIdx !== -1) {
        // Determine the finger chain for straightness test
        // For thumb use [1,2,3,4], for others use [5,6,7,8], [9,10,11,12], etc.
        let chain;
        if (j === 4) chain = [1, 2, 3, 4];
        else if (j === 8) chain = [5, 6, 7, 8];
        else if (j === 12) chain = [9, 10, 11, 12];
        else if (j === 16) chain = [13, 14, 15, 16];
        else if (j === 20) chain = [17, 18, 19, 20];

        // compute straightness: ratio of direct distance to sum of segments
        let sumSeg = 0;
        for (let s = 0; s < chain.length - 1; s++) {
          let pA = hand.keypoints[chain[s]];
          let pB = hand.keypoints[chain[s + 1]];
          sumSeg += dist(pA.x * ratio, pA.y * ratio, pB.x * ratio, pB.y * ratio);
        }
        let pBase = hand.keypoints[chain[0]];
        let pTip = hand.keypoints[chain[chain.length - 1]];
        let direct = dist(pBase.x * ratio, pBase.y * ratio, pTip.x * ratio, pTip.y * ratio);
        let ratioStraight = (sumSeg > 0) ? direct / sumSeg : 0;
  // also require a minimum direct distance for certain fingers (help thumb detection)
  let minDirect = fingertipMinDirect[tipIdx] || 0;
  let isStraight = (ratioStraight > straightnessThreshold) && (direct > minDirect);

        // draw fingertip
        let col = fingertipColors[tipIdx];
        if (isStraight) {
          noStroke();
          fill(col[0], col[1], col[2]);
          circle(keypoint.x * ratio, keypoint.y * ratio, 14);
          // bright outline
          stroke(255);
          strokeWeight(2);
          noFill();
          circle(keypoint.x * ratio, keypoint.y * ratio, 18);
          // draw persistent stroke on drawingLayer from previous tip pos to current
          if (!prevTipPosPerHand[i]) prevTipPosPerHand[i] = [];
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
          // store current as previous
          prevTipPosPerHand[i][tipIdx] = { x: cx, y: cy };
        } else {
          // bent finger: draw muted outline
          noFill();
          stroke(col[0] * 0.6, col[1] * 0.6, col[2] * 0.6, 200);
          strokeWeight(3);
          circle(keypoint.x * ratio, keypoint.y * ratio, 12);
          // when bent, reset previous tip pos so stroke breaks
          if (prevTipPosPerHand[i]) prevTipPosPerHand[i][tipIdx] = null;
        }
      } else {
        // non-fingertip: small green dot as before
        fill(0, 255, 0);
        noStroke();
        circle(keypoint.x * ratio, keypoint.y * ratio, 8);
      }
    }
  }
}

/**
 * NEU:
 * Mit der Zeigefingerspitze (Keypoint 8) zeichnen.
 * Wenn Daumen (4) und Zeigefinger (8) sich berühren -> Canvas löschen.
 */
function drawWithIndexFinger() {
  if (hands.length === 0) return;
  // For reset behavior: check all hands for pinch; if pinch midpoint is inside
  // the bottom-center reset circle -> clear canvas. Otherwise keep previous
  // behavior: draw index stroke for the first hand.
  let resetX = width / 2;
  let resetY = height - resetCircleYOffset;

  // Check any hand for pinch inside reset circle
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
    if (pinchDist < pinchThreshold && dist(mx, my, resetX, resetY) < resetCircleRadius) {
      // clear only if pinch happens inside the reset circle
      drawingLayer.clear();
      prevIndexPos = null;
      prevTipPosPerHand = []; // reset stroke history
      // visual feedback on the main canvas (small red circle at pinch point)
      push();
      noFill();
      stroke(255, 0, 0);
      strokeWeight(3);
      ellipse(mx, my, 60, 60);
      pop();
      return;
    }
  }

  // If no reset happened, draw index stroke for the first detected hand (backwards compatible)
  let hand0 = hands[0];
  if (!hand0 || !hand0.keypoints || hand0.keypoints.length < 9) return;
  let indexTip0 = hand0.keypoints[8];
  let thumbTip0 = hand0.keypoints[4];
  let ix0 = indexTip0.x * ratio;
  let iy0 = indexTip0.y * ratio;

  // Zeichnen: Zeigefingerbewegung als Stroke
  if (prevIndexPos != null) {
    let ic = fingertipColors[1];
    drawingLayer.stroke(ic[0], ic[1], ic[2]);
    drawingLayer.strokeWeight(10);
    drawingLayer.line(prevIndexPos.x, prevIndexPos.y, ix0, iy0);
  }

  // aktuelle Position merken
  prevIndexPos = { x: ix0, y: iy0 };
}

function drawResetCircle() {
  // Draw a visible reset target at bottom center (in mirrored coords)
  let cx = width / 2;
  let cy = height - resetCircleYOffset;
  push();
  // subtle fill
  noStroke();
  fill(0, 0, 0, 140);
  ellipse(cx, cy, (resetCircleRadius * 2) + 8, (resetCircleRadius * 2) + 8);
  // outline and label
  noFill();
  stroke(255);
  strokeWeight(2);
  ellipse(cx, cy, resetCircleRadius * 2, resetCircleRadius * 2);
  noStroke();
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text('Pinch to reset', cx, cy);
  pop();
}
