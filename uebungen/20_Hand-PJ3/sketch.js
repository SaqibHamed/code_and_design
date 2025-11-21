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
// Two-hand gesture params
const contactThreshold = 30; // distance threshold for thumb-to-finger contact
const mediumDistanceRange = { min: 80, max: 150 }; // range to avoid (medium distance)
const distanceTolerance = 20; // margin around the avoid range

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
    
    // Two-hand gesture: detect thumb-to-other-finger contacts and draw ellipses
    detectAndDrawTwoHandGestures();
    
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
 * Detect thumb-to-middle-finger contacts between two hands.
 * Draw ellipse at contact midpoint if:
 * 1. Two hands detected
 * 2. Thumb (keypoint 4) from one hand touches middle finger (keypoint 12) from other hand
 * 3. Distance < contactThreshold
 * 4. The distance is NOT in the "medium range" (with tolerance margin)
 */
function detectAndDrawTwoHandGestures() {
  if (hands.length < 2) return; // Need two hands

  let hand0 = hands[0];
  let hand1 = hands[1];
  if (!hand0.keypoints || !hand1.keypoints) return;

  // Keypoint indices: 4=thumb tip, 12=middle finger tip
  let thumb0 = hand0.keypoints[4];
  let thumb1 = hand1.keypoints[4];
  let middle0 = hand0.keypoints[12];
  let middle1 = hand1.keypoints[12];

  // Check thumb0 vs middle1
  let d1 = dist(thumb0.x, thumb0.y, middle1.x, middle1.y) * ratio;
  let adjustedMin = mediumDistanceRange.min - distanceTolerance;
  let adjustedMax = mediumDistanceRange.max + distanceTolerance;
  let notMedium1 = (d1 < adjustedMin) || (d1 > adjustedMax);
  
  if (d1 < contactThreshold && notMedium1) {
    // Contact detected: draw ellipse at midpoint
    let mx = (thumb0.x + middle1.x) / 2 * ratio;
    let my = (thumb0.y + middle1.y) / 2 * ratio;
    push();
    noFill();
    stroke(255, 100, 200);
    strokeWeight(3);
    ellipse(mx, my, 80, 120);
    pop();
  }

  // Check thumb1 vs middle0
  let d2 = dist(thumb1.x, thumb1.y, middle0.x, middle0.y) * ratio;
  let notMedium2 = (d2 < adjustedMin) || (d2 > adjustedMax);
  
  if (d2 < contactThreshold && notMedium2) {
    // Contact detected: draw ellipse at midpoint
    let mx = (thumb1.x + middle0.x) / 2 * ratio;
    let my = (thumb1.y + middle0.y) / 2 * ratio;
    push();
    noFill();
    stroke(100, 200, 255);
    strokeWeight(3);
    ellipse(mx, my, 80, 120);
    pop();
  }
}

