const guessBtn = document.getElementById('guessBtn');
const mapViewport = document.getElementById('mapViewport');
const mapWrapper = document.getElementById('mapWrapper');
const map = document.getElementById('map');
const marker = document.getElementById('marker');
const screenshot = document.getElementById("screenshot");
const result = document.getElementById("result");
const realMarker = document.getElementById("realMarker");
const line = document.getElementById("line");
const mapContainer = document.getElementById("mapContainer");
const bigScore = document.getElementById("bigScore");
const bossbarFill = document.getElementById("bossbar-fill");
const multiplayerBtn = document.getElementById("multiplayerBtn");
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const game = document.getElementById("game");

const usernameInput = document.getElementById("usernameInput");
const skinPreview = document.getElementById("skinPreview");
const playerSkin = document.getElementById("playerSkin");
const playerNameEl = document.getElementById("playerName");
let round = 0;
let totalScore = 0;
const maxRounds = 3;
let playerName = "";

  skinPreview.src = "images/default-skin.webp";

document.getElementById("backBtn").onclick = () => {
  document.getElementById("endScreen").style.display = "none";
  // Leerstring statt "block": #startScreen ist per CSS ein Grid-Layout -
  // "block" würde das als Inline-Style überschreiben und das Layout zerstören.
  startScreen.style.display = "";

  round = 0;
  totalScore = 0;
};

//Skin
usernameInput.addEventListener("input", () => {
  const name = usernameInput.value.trim();

  if (!name) return;

skinPreview.src = `https://minotar.net/helm/${name}/100.png`;});

startBtn.onclick = () => {
  const name = usernameInput.value.trim();

  if (!name) {
    alert("Please enter your Minecraft username!");
    return;
  }

  playerName = name;

  playerSkin.src = `https://minotar.net/helm/${name}/40.png`;
  playerNameEl.innerText = name;

  round = 0;
  totalScore = 0;

  startScreen.style.display = "none";
  game.style.display = "block";

  startTimer();
  loadRandomLocation();
};

  multiplayerBtn.onclick = () => {
  const name = usernameInput.value.trim();

    alert("No Multiplayer avaible at this time");

}
document.getElementById("wieBtn").onclick = function () {
  document.getElementById("popup").style.display = "block";
};

document.getElementById("popupCloseBtn").onclick = function () {
  document.getElementById("popup").style.display = "none";
};

let maxTime = 30;
let timeLeft = maxTime;
let timerInterval;

let guessX = null;
let guessY = null;

let zoom = 0.9;
let offsetX = 0;
let offsetY = 0;

// Wenn gesetzt (als Bruchteil 0..1 der Kartengröße), hält updateTransform()
// diesen Punkt in der Mitte der Viewport - genutzt, um die Karte nach dem
// Guess auf Tipp/echten Standort zu zentrieren.
let centerOnX = null;
let centerOnY = null;

// Wenn gesetzt ([min, max] als Bruchteil 0..1), zoomt updateTransform() so
// weit raus, dass diese Spanne komplett in die Viewport passt - sonst bleibt
// vom Explore-Zoom manchmal ein Marker außerhalb der sichtbaren Fläche, egal
// wie gut zentriert wird.
let fitBoundsX = null;
let fitBoundsY = null;
const RESULT_FIT_PADDING = 0.6;
const RESULT_MAX_ZOOM = 2.5;

// Marker sollen auf dem Bildschirm immer ähnlich groß bleiben, egal wie
// weit man rein-/rausgezoomt hat.
const MARKER_BASE_SIZE = 40;
const REAL_MARKER_BASE_SIZE = 20;
const MARKER_MIN_SCALE = 0.6;
const MARKER_MAX_SCALE = 2.5;

// DRAG STATE
let isDragging = false;
let moved = false;
let startX = 0;
let startY = 0;
const dragThreshold = 5;

const locations = [
  { image: "images/bild1.png", x: 0.504, y: 0.494 },
  { image: "images/bild2.png", x: 0.557, y: 0.220 },
  { image: "images/bild3.png", x: 0.123, y: 0.431 },
  { image: "images/bild4.png", x: 0.303, y: 0.233 },
  { image: "images/bild5.png", x: 0.781, y: 0.368 },
  { image: "images/bild6.png", x: 0.325, y: 0.987 },
  { image: "images/bild7.png", x: 0.565, y: 0.978 },
  { image: "images/bild8.png", x: 0.760, y: 0.871 },
  { image: "images/bild9.png", x: 0.936, y: 0.814 },
  { image: "images/bild10.png", x: 0.264, y: 0.697 },
  { image: "images/bild11.png", x: 0.458, y: 0.828 },
  { image: "images/bild12.png", x: 0.423, y: 0.299 },
  { image: "images/bild13.png", x: 0.665, y: 0.550 },
  { image: "images/bild14.png", x: 0.864, y: 0.639 },
  { image: "images/bild15.png", x: 0.371, y: 0.597 },
  { image: "images/bild16.png", x: 0.178, y: 0.825 },
  { image: "images/bild17.png", x: 0.471, y: 0.456 },
  { image: "images/bild18.png", x: 0.167, y: 0.321 },
  { image: "images/bild19.png", x: 0.653, y: 0.289 },
  { image: "images/bild20.png", x: 0.520, y: 0.040 },
  { image: "images/bild21.png", x: 0.479, y: 0.138 },
  { image: "images/bild22.png", x: 0.330, y: 0.071 },
  { image: "images/bild23.png", x: 0.208, y: 0.584 },
  { image: "images/bild24.png", x: 0.849, y: 0.123 },
  { image: "images/bild25.png", x: 0.926, y: 0.479 },
  { image: "images/bild26.png", x: 0.059, y: 0.835 },
  { image: "images/bild27.png", x: 0.087, y: 0.576 },
  { image: "images/bild28.png", x: 0.314, y: 0.338 },
  { image: "images/bild29.png", x: 0.319, y: 0.868 },
  { image: "images/bild30.png", x: 0.643, y: 0.711 },
  { image: "images/bild31.png", x: 0.456, y: 0.976 },
  { image: "images/bild32.png", x: 0.716, y: 0.105 },
  { image: "images/bild33.png", x: 0.475, y: 0.651 },
  { image: "images/bild34.png", x: 0.401, y: 0.881 },
  { image: "images/bild35.png", x: 0.184, y: 0.933 },
  { image: "images/bild36.png", x: 0.052, y: 0.160 },
  { image: "images/bild37.png", x: 0.808, y: 0.212 },
  { image: "images/bild38.png", x: 0.087, y: 0.337 },
  { image: "images/bild39.png", x: 0.588, y: 0.830 },
  { image: "images/bild40.png", x: 0.254, y: 0.402 },
  { image: "images/bild41.png", x: 0.082, y: 0.916 },
  { image: "images/bild42.png", x: 0.246, y: 0.959 },
  { image: "images/bild43.png", x: 0.860, y: 0.837 },
  { image: "images/bild44.png", x: 0.030, y: 0.446 },
  { image: "images/bild45.png", x: 0.208, y: 0.066 },
  { image: "images/bild46.png", x: 0.052, y: 0.673 },
  { image: "images/bild47.png", x: 0.929, y: 0.325 },
  { image: "images/bild48.png", x: 0.822, y: 0.902 },
  { image: "images/bild49.png", x: 0.794, y: 0.571 },
  { image: "images/bild50.png", x: 0.442, y: 0.192 }

];

let currentLocation;

// -------------------- LOAD --------------------
function loadRandomLocation() {
  currentLocation = locations[Math.floor(Math.random() * locations.length)];
  screenshot.src = currentLocation.image;
  mapContainer.classList.remove("fullscreen");

  // Marker reset
  marker.style.display = "none";
  realMarker.style.display = "none";
  line.style.display = "none";
  line.style.opacity = "0";
  line.style.width = "0";
  guessBtn.classList.remove("ready");

  guessX = null;
  guessY = null;

  // MAP RESET
  zoom = 0.9;
  offsetX = 0;
  offsetY = 0;
  centerOnX = null;
  centerOnY = null;
  fitBoundsX = null;
  fitBoundsY = null;

  updateTransform();

  // Timer neu starten
  startTimer();
}
//nach guess
function drawLine(x1, y1, x2, y2) {
  const mapWidth = map.offsetWidth;
  const mapHeight = map.offsetHeight;

  // Positionen in "Map-Koordinaten" (nicht Screen!)
  const px1 = x1 * mapWidth;
  const py1 = y1 * mapHeight;

  const px2 = x2 * mapWidth;
  const py2 = y2 * mapHeight;

  const dx = px2 - px1;
  const dy = py2 - py1;

  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Position/Rotation sofort setzen, aber ohne Transition - nur die Breite
  // (Länge der Linie) soll sichtbar von 0 auf die volle Länge wachsen.
  line.style.transition = "none";
  line.style.width = "0px";
  line.style.left = px1 + "px";
  line.style.top = py1 + "px";
  line.style.transform = `rotate(${angle}deg)`;
  line.style.display = "block";
  void line.offsetWidth; // Reflow erzwingen, damit die 0px-Breite tatsächlich greift
  line.style.transition = "";

  requestAnimationFrame(() => {
    line.style.width = length + "px";
    line.style.opacity = "1";
  });
}

function showResult() {
  // echte Position berechnen
  const realX = currentLocation.x;
  const realY = currentLocation.y;

  centerOnX = (guessX + realX) / 2;
  centerOnY = (guessY + realY) / 2;
  fitBoundsX = [Math.min(guessX, realX), Math.max(guessX, realX)];
  fitBoundsY = [Math.min(guessY, realY), Math.max(guessY, realY)];

  // Ohne die sonst übliche 0.25s-Animation in den Fullscreen wechseln: sonst
  // wird die Zentrierung erst für die alte (kleine) Viewport-Größe berechnet
  // und "springt" der Größenänderung hinterher.
  snapViewportSize(() => mapContainer.classList.add("fullscreen"));

  // Marker setzen
  realMarker.style.left = (realX * 100) + "%";
  realMarker.style.top = (realY * 100) + "%";
  realMarker.style.display = "block";

  // Linie berechnen
  drawLine(guessX, guessY, realX, realY);
}


// -------------------- TRANSFORM --------------------
// Natürliche (unskalierte) Kartengröße - ändert sich nie, daher einmal
// gecacht statt bei jedem Drag/Zoom-Event erneut Layout auszulösen.
let mapNaturalWidth = null;
let mapNaturalHeight = null;

// Größenänderungen von #mapViewport, die von JS ausgelöst werden (Fullscreen
// nach dem Guess), sollen sofort gelten statt der üblichen 0.25s-Transition
// hinterherzuhinken - sonst wird z.B. die Zentrierung noch für die alte
// Größe berechnet und "springt" sichtbar nach.
function snapViewportSize(resize) {
  mapViewport.style.transition = "none";
  resize();
  void mapViewport.offsetHeight; // Reflow erzwingen, neue Größe sofort anwenden
  updateTransform();
  mapViewport.style.transition = "";
}

function updateTransform() {
  if (mapNaturalWidth === null) {
    mapNaturalWidth = map.offsetWidth;
    mapNaturalHeight = map.offsetHeight;
  }

  const vp = mapViewport.getBoundingClientRect();

  const vpWidth = vp.width;
  const vpHeight = vp.height;

  // Nach dem Guess: so weit rauszoomen, dass Tipp UND echter Standort mit
  // etwas Rand in die Viewport passen - sonst bleibt vom Explore-Zoom
  // manchmal einer der beiden Punkte außerhalb des sichtbaren Bereichs,
  // egal wie gut der Mittelpunkt zentriert ist.
  if (fitBoundsX !== null && fitBoundsY !== null) {
    const spanXPx = (fitBoundsX[1] - fitBoundsX[0]) * mapNaturalWidth;
    const spanYPx = (fitBoundsY[1] - fitBoundsY[0]) * mapNaturalHeight;
    const fitZoomX = spanXPx > 0 ? (vpWidth * RESULT_FIT_PADDING) / spanXPx : Infinity;
    const fitZoomY = spanYPx > 0 ? (vpHeight * RESULT_FIT_PADDING) / spanYPx : Infinity;
    zoom = Math.min(fitZoomX, fitZoomY, RESULT_MAX_ZOOM);
  }

  // Nie weiter rauszoomen als die Karte die Viewport füllt, sonst bleibt
  // unten/rechts ein Rand sichtbar (z.B. wenn die Viewport nach dem Guess
  // größer wird).
  const minZoom = Math.max(vpWidth / mapNaturalWidth, vpHeight / mapNaturalHeight);
  zoom = Math.max(zoom, minZoom);

  const mapWidth = mapNaturalWidth * zoom;
  const mapHeight = mapNaturalHeight * zoom;

  if (centerOnX !== null && centerOnY !== null) {
    offsetX = vpWidth / 2 - centerOnX * mapWidth;
    offsetY = vpHeight / 2 - centerOnY * mapHeight;
  }

  const minX = vpWidth - mapWidth;
  const minY = vpHeight - mapHeight;

  offsetX = Math.min(0, Math.max(offsetX, minX));
  offsetY = Math.min(0, Math.max(offsetY, minY));

  mapWrapper.style.transform =
    `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;

  // Marker gegen den Kartenzoom gegenskalieren, damit sie beim Reinzoomen
  // nicht riesig und beim Rauszoomen nicht unsichtbar klein werden.
  const markerScale = Math.min(MARKER_MAX_SCALE, Math.max(MARKER_MIN_SCALE, 1 / zoom));
  marker.style.width = (MARKER_BASE_SIZE * markerScale) + "px";
  realMarker.style.width = (REAL_MARKER_BASE_SIZE * markerScale) + "px";
}

// Viewport ändert sich per CSS-Transition (Hover-Vorschau, Fullscreen nach
// dem Guess) - danach Zoom/Pan neu einklemmen, damit kein Rand entsteht.
mapViewport.addEventListener("transitionend", (e) => {
  if (e.propertyName === "width" || e.propertyName === "height") {
    updateTransform();
  }
});

// -------------------- CLICK (GUESS) --------------------
mapViewport.addEventListener("click", (e) => {
  if (moved) {
    moved = false;
    return;
  }

  const rect = map.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  guessX = x;
  guessY = y;

  marker.style.left = (x * 100) + "%";
  marker.style.top = (y * 100) + "%";
  marker.style.display = "block";
  guessBtn.classList.add("ready");
});
// -------------------- Timer --------------------
function startTimer() {
  clearInterval(timerInterval);

  timeLeft = maxTime;
  updateBossbar();

  timerInterval = setInterval(() => {
    timeLeft--;

    updateBossbar();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      autoSubmit();
    }
  }, 1000);
}

function updateBossbar() {
  const percent = (timeLeft / maxTime) * 100;
  bossbarFill.style.width = percent + "%";

  // Farbwechsel
  if (percent > 50) {
    bossbarFill.style.background = "linear-gradient(to right, #a000ff, #ff00ff)";
  } else if (percent > 20) {
    bossbarFill.style.background = "orange";
  } else {
    bossbarFill.style.background = "red";
  }
}

function autoSubmit() {
  if (guessX === null) {
    result.innerText = "Not guessed!";
    setTimeout(() => {
      loadRandomLocation();
    }, 1500);
    return;
  }

  guessBtn.click();
}
// -------------------- DRAG --------------------
mapWrapper.addEventListener("mousedown", (e) => {
  isDragging = true;
  moved = false;
  centerOnX = null;
  centerOnY = null;
  fitBoundsX = null;
  fitBoundsY = null;

  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;

  e.preventDefault();
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
    moved = true;
  }

  offsetX = dx;
  offsetY = dy;

  updateTransform();
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

// -------------------- SUBMIT --------------------
guessBtn.onclick = () => {
  if (guessX === null) return;

  const dx = guessX - currentLocation.x;
  const dy = guessY - currentLocation.y;

  const distance = Math.sqrt(dx * dx + dy * dy);
  const score = Math.max(0, 5000 - Math.floor(distance * 5000));

  totalScore += score;
  round++;

  result.innerText =
    `Runde ${round}/3 | Punkte: ${score}`;

showResult();

bigScore.innerText = "+" + score;
bigScore.style.display = "block";

setTimeout(() => {

  mapContainer.classList.remove("fullscreen");
  realMarker.style.display = "none";
  line.style.display = "none";

  if (round >= maxRounds) {
    endGame();
  } else {
    loadRandomLocation();
  }

}, 5000);
};
//ENDE
async function endGame() {
  // UI wechseln
  game.style.display = "none";
  document.getElementById("endScreen").style.display = "flex";

  // Score anzeigen
  document.getElementById("finalScore").innerText = totalScore + " Punkte";

  const finalRankEl = document.getElementById("finalRank");
  finalRankEl.style.display = "none";
  finalRankEl.classList.remove("top3");

  // Erst wenn der Score wirklich gespeichert ist das Leaderboard neu laden -
  // sonst kommt beim GET direkt danach noch der alte Stand zurück und man
  // musste bisher manuell neu laden, um den eigenen Score zu sehen.
  const rank = await sendScore(playerName, totalScore);
  if (rank !== null) {
    const medals = { 1: "🥇 ", 2: "🥈 ", 3: "🥉 " };
    finalRankEl.textContent = `${medals[rank] ?? ""}Platz ${rank}`;
    finalRankEl.classList.toggle("top3", rank <= 3);
    // display war eben schon "none" -> Animation (siehe CSS) spielt beim
    // Umschalten auf "block" garantiert von vorne ab.
    finalRankEl.style.display = "block";
  }

  await loadLeaderboard();
}

async function sendScore(name, score) {
  try {
    const res = await fetch("/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.rank ?? null;
  } catch (e) {
    console.error("Score konnte nicht gesendet werden:", e);
    return null;
  }
}

async function loadLeaderboard() {
  let entries;
  try {
    const res = await fetch("/leaderboard");
    entries = await res.json();
  } catch (e) {
    console.error("Leaderboard konnte nicht geladen werden:", e);
    return;
  }

  // Wird sowohl auf dem Startbildschirm als auch auf dem Endscreen angezeigt -
  // beide Container tragen die Klasse "leaderboardList" und bekommen dieselben
  // Daten.
  document.querySelectorAll(".leaderboardList").forEach((board) => renderLeaderboard(board, entries));
}

const LEADERBOARD_SLOTS = 10;

function renderLeaderboard(board, entries) {
  board.innerHTML = "";
  const medals = ["🥇", "🥈", "🥉"];

  // Immer alle 10 Plätze rendern, auch unbelegte - das Leaderboard soll
  // stets seine volle Größe behalten statt mit weniger Einträgen zu schrumpfen.
  for (let index = 0; index < LEADERBOARD_SLOTS; index++) {
    const entry = entries[index];

    const row = document.createElement("div");
    row.className = "lb-entry";
    if (!entry) row.classList.add("lb-empty");
    else if (index === 0) row.classList.add("gold");
    else if (index === 1) row.classList.add("silver");
    else if (index === 2) row.classList.add("bronze");

    const rank = document.createElement("span");
    rank.className = "rank";
    rank.textContent = medals[index] ?? (index + 1) + ".";

    const skin = document.createElement("img");
    skin.className = "lb-skin";
    skin.src = `https://minotar.net/helm/${encodeURIComponent(entry ? entry.name : "MHF_Steve")}/30.png`;

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = entry ? entry.name : "— —"; // textContent statt innerHTML - kein XSS über den Spielernamen

    const score = document.createElement("span");
    score.className = "score";
    score.textContent = entry ? entry.score : "";

    row.append(rank, skin, name, score);
    board.appendChild(row);
  }
}

loadLeaderboard();

// -------------------- ZOOM --------------------
mapViewport.addEventListener("wheel", (e) => {
  e.preventDefault();
  centerOnX = null;
  centerOnY = null;
  fitBoundsX = null;
  fitBoundsY = null;

  const rect = mapViewport.getBoundingClientRect();

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const zoomFactor = 1.1;
  const oldZoom = zoom;

  zoom *= (e.deltaY < 0) ? zoomFactor : (1 / zoomFactor);
  zoom = Math.min(Math.max(zoom, 0.185), 5);

  offsetX = mouseX - ((mouseX - offsetX) * (zoom / oldZoom));
  offsetY = mouseY - ((mouseY - offsetY) * (zoom / oldZoom));

  updateTransform();
});