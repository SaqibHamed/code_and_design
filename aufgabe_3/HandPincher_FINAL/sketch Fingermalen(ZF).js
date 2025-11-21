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

/**
 * Lädt das HandPose-Modell vor dem Setup
 * Diese Funktion wird automatisch vor setup() ausgeführt
 */
function preload() {
  handpose = ml5.handPose();
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
      
      // Zeichne Keypoint als grüner Kreis
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x * ratio, keypoint.y * ratio, 10);
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

  let hand = hands[0];

  let indexTip = hand.keypoints[8]; // Zeigefingerspitze
  let thumbTip = hand.keypoints[4]; // Daumenspitze

  let ix = indexTip.x * ratio;
  let iy = indexTip.y * ratio;
  let tx = thumbTip.x * ratio;
  let ty = thumbTip.y * ratio;

  // Abstand zwischen Daumen und Zeigefinger
  let pinchDist = dist(ix, iy, tx, ty);

  // Wenn Pinch (Daumen & Zeigefinger berühren sich) -> Canvas leeren
  if (pinchDist < pinchThreshold) {
    drawingLayer.clear();
    prevIndexPos = null;

    // Optional visuelles Feedback (kurzer Kreis)
    drawingLayer.push();
    drawingLayer.noFill();
    drawingLayer.stroke(255, 0, 0);
    drawingLayer.strokeWeight(3);
    drawingLayer.ellipse(ix, iy, 40, 40);
    drawingLayer.pop();

    return;
  }

  // Zeichnen: Zeigefingerbewegung als Stroke
  if (prevIndexPos != null) {
    drawingLayer.stroke(255, 255, 0);
    drawingLayer.strokeWeight(4);
    drawingLayer.line(prevIndexPos.x, prevIndexPos.y, ix, iy);
  }

  // aktuelle Position merken
  prevIndexPos = { x: ix, y: iy };
}
