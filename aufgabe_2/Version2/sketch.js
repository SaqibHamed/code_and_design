//TOWERDEFFENCE CHAT-GPT GAME

// --- Config ---
const GRID_STEP = 50;
const BULLET_SPEED = 12;
const BULLET_DIAM = 14;
const FIRE_RATE = 8;          // Frames zwischen Schüssen bei gedrückter Maus
const TIP_OFFSET = 60;        // Abstand Actor-Mitte zur "Spitze"
const TOWER_SIZE = 50;        // Kantenlänge rotes Quadrat
const TOWER_RADIUS = 30;      // Abstand, ab dem "Tower erreicht" gilt
const MOB_SPEED = 2;          // Grundspeed der Mobs
const MOB_RADIUS = 18;        // Kollisionsradius der Mobs
const SPAWN_INTERVAL = 60;    // alle X Frames spawnt ein Mob (während Spiel)
const OFFSCREEN_MARGIN = 80;  // wie weit außerhalb gespawnt wird

// --- State ---
let bullets = [];
let mobs = [];
let fireCooldown = 0;
let frameSinceSpawn = 0;

let score = 0;
let lastScore = 0;
let gameState = "playing"; // "playing" | "gameover"

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  startGame();
}

function draw() {
  clear();

  // --- Grid ---
  stroke(200);
  strokeWeight(1);
  for (let y = 0; y <= height; y += GRID_STEP) line(0, y, width, y);
  for (let x = 0; x <= width; x += GRID_STEP) line(x, 0, x, height);

  const cx = width / 2;
  const cy = height / 2;
  const angle = atan2(mouseY - cy, mouseX - cx);

  if (gameState === "playing") {
    // Schießen
    if (fireCooldown > 0) fireCooldown--;
    if (mouseIsPressed && fireCooldown === 0) {
      spawnBullet(cx, cy, angle);
      fireCooldown = FIRE_RATE;
    }

    // Bullets
    noStroke();
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.pos.add(b.vel);
      b.life--;
      fill(255, 220, 0);
      ellipse(b.pos.x, b.pos.y, BULLET_DIAM, BULLET_DIAM);
      if (
        b.life <= 0 ||
        b.pos.x < -100 || b.pos.x > width + 100 ||
        b.pos.y < -100 || b.pos.y > height + 100
      ) {
        bullets.splice(i, 1);
      }
    }

    // Spawner
    frameSinceSpawn++;
    if (frameSinceSpawn >= SPAWN_INTERVAL) {
      spawnMob();
      frameSinceSpawn = 0;
    }

    // Mobs
    for (let mi = mobs.length - 1; mi >= 0; mi--) {
      const m = mobs[mi];
      const dir = createVector(cx - m.pos.x, cy - m.pos.y).limit(MOB_SPEED);
      m.pos.add(dir);

      // zeichnen
      fill(80, 160, 255);
      noStroke();
      ellipse(m.pos.x, m.pos.y, MOB_RADIUS * 2, MOB_RADIUS * 2);

      // Tower erreicht? -> Game Over (Score bleibt sichtbar)
      if (dist(m.pos.x, m.pos.y, cx, cy) <= TOWER_RADIUS) {
        gameOver();
        break;
      }

      // Treffer durch Bullet?
      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        const rSum = MOB_RADIUS + BULLET_DIAM * 0.5;
        if (dist(b.pos.x, b.pos.y, m.pos.x, m.pos.y) <= rSum) {
          bullets.splice(bi, 1);
          mobs.splice(mi, 1);
          score += 1; // Zähler hoch
          break;
        }
      }
    }
  } else {
    // Game-Over-Overlay
    drawGameOverOverlay();
  }

  // Tower/Actor (immer zeichnen)
  push();
  translate(cx, cy);
  rotate(angle);
  noStroke();
  fill(255, 0, 0);
  rect(0, 0, TOWER_SIZE, TOWER_SIZE);
  fill(0, 255, 0);
  rect(35, 0, 50, 15); // "Spitze"
  pop();

  // HUD: Score (oben links)
  drawScoreHUD();
}

function spawnBullet(cx, cy, angle) {
  const dir = p5.Vector.fromAngle(angle);
  const origin = createVector(cx, cy).add(dir.copy().mult(TIP_OFFSET));
  bullets.push({
    pos: origin,
    vel: dir.mult(BULLET_SPEED),
    life: 180
  });
}

function spawnMob() {
  const side = floor(random(4));
  let x, y;
  if (side === 0) {           // oben
    x = random(-OFFSCREEN_MARGIN, width + OFFSCREEN_MARGIN);
    y = -OFFSCREEN_MARGIN;
  } else if (side === 1) {    // rechts
    x = width + OFFSCREEN_MARGIN;
    y = random(-OFFSCREEN_MARGIN, height + OFFSCREEN_MARGIN);
  } else if (side === 2) {    // unten
    x = random(-OFFSCREEN_MARGIN, width + OFFSCREEN_MARGIN);
    y = height + OFFSCREEN_MARGIN;
  } else {                    // links
    x = -OFFSCREEN_MARGIN;
    y = random(-OFFSCREEN_MARGIN, height + OFFSCREEN_MARGIN);
  }
  mobs.push({ pos: createVector(x, y) });
}

function startGame() {
  bullets = [];
  mobs = [];
  score = 0;
  frameSinceSpawn = 0;
  gameState = "playing";

  // exakt EIN einzelner NPC zu Beginn
  spawnMob();
}

function gameOver() {
  gameState = "gameover";
  lastScore = score; // Score speichern, sichtbar lassen
}

function drawScoreHUD() {
  const txt = `Score: ${score}`;
  textSize(20);
  textAlign(LEFT, TOP);
  // Hintergrundplatte für Lesbarkeit
  noStroke();
  fill(255, 255, 255, 180);
  const pad = 8;
  const w = textWidth(txt) + pad * 2;
  rectMode(CORNER);
  rect(12, 12, w, 32, 6);
  fill(0);
  text(txt, 12 + pad, 12 + 6);
}

function drawGameOverOverlay() {
  // halbtransparentes Overlay
  fill(255, 255, 255, 220);
  rectMode(CORNER);
  noStroke();
  rect(0, 0, width, height);

  // Text
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("GAME OVER", width / 2, height / 2 - 30);

  textSize(24);
  text(`Score: ${lastScore}`, width / 2, height / 2 + 10);

  textSize(18);
  text("Klick, Enter oder R zum Neustart", width / 2, height / 2 + 45);
}

function mousePressed() {
  if (gameState === "gameover") startGame();
}

function keyPressed() {
  if (gameState === "gameover" && (key === 'r' || key === 'R' || keyCode === ENTER || keyCode === RETURN)) {
    startGame();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
