let drehwinkel = [];
let offsets = [];
let tempo = [];
let anzahl = 200;      // Anzahl generierter Objekte
let colorA = "#ff5900"; // Orange
let colorB = "#bf00ff"; // Violett

let isViolet = [];     // merkt sich, ob Kreis aktuell violett ist
let wasHovering = [];  // merkt sich, ob Maus im letzten Frame drauf war

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  for (let i = 0; i < anzahl; i++) {
    offsets[i] = random(50, 1200);     // Abstand zur Mitte
    tempo[i] = random(0.2, 0.7);      // Tempo der erstellten Objekte
    drehwinkel[i] = random(TAU);   // TAU wird als 360°-Winkel bezeichnet

    isViolet[i] = false;              // Am anfang ist alles Orange
    wasHovering[i] = false;           // Maus ist am anfang nicht aktiv
  }
}

function draw() {
  background(0, 15);  // Weisser Hintergrund  mit Fade-Effekt

  // Mittelpunkt ist der Ursprung (Nullpunkt)
  translate(width / 2, height / 2);

  // Maus position zur Mitte
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;

  for (let i = 0; i < anzahl; i++) {

    // findet heraus wo sich die Elipsen im Orbit befinden
    let x = cos(drehwinkel[i]) * offsets[i];
    let y = sin(drehwinkel[i]) * offsets[i];

    // Abstand Maus ↔ Kreis
    let distToMouse = dist(mx, my, x, y);
    let hovering = distToMouse < 40;  // Overlap mit Elipse

    if (hovering && !wasHovering[i]) {
      // Farbe umschalten
      isViolet[i] = !isViolet[i]; //! wechselt den Boolean Status wie ein Hebel
      tempo[i] = -tempo[i]; // Drehrichtung wechseln bei einem Mouse-Overlap
    }

    if (isViolet[i]) {
      fill(colorB);   // violett
    } else {
      fill(colorA);   // orange
    }

    // Kreis zeichnen
    ellipse(x, y, 60, 60);
    stroke(0,0,0,0);

    // merken, ob Maus in diesem Frame drauf war
    wasHovering[i] = hovering;

    // Drehwinkel aktualisieren
    drehwinkel[i] += radians(tempo[i]);
  }
}

