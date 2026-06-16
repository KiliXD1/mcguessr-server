const guessBtn = document.getElementById('guessBtn');
const mapViewport = document.getElementById('mapViewport');
const mapWrapper = document.getElementById('mapWrapper');
const map = document.getElementById('map');
const marker = document.getElementById('marker');
const screenshot = document.getElementById("screenshot");
const result = document.getElementById("result");
const coords = document.getElementById("coords");
const timerEl = document.getElementById("timer");
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
const SERVER_URL = "";
let round = 0;
let totalScore = 0;
const maxRounds = 3;
let playerName = "";
let scoreSent = false;

  skinPreview.src = "images/default-skin.webp";

const isMobile = () => window.innerWidth <= 768;

document.getElementById("backBtn").onclick = () => {
  document.getElementById("endScreen").style.display = "none";
  startScreen.style.display = "block";

  round = 0;
  totalScore = 0;
};

//Skin
usernameInput.addEventListener("input", () => {
  const name = usernameInput.value.trim();

  if (!name) return;
  skinPreview.src = `https://minotar.net/helm/${name}/100.png`;
});

skinPreview.src = `https://minotar.net/helm/${name}/100.png`;

startBtn.onclick = () => {
  const name = usernameInput.value.trim();
  let scoreSent = false;

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

  loadLeaderboard();
  startTimer();
  loadRandomLocation();
};

  multiplayerBtn.onclick = () => {
  const name = usernameInput.value.trim();

    alert("No Multiplayer avaible at this time");
};


document.getElementById("wieBtn").onclick = function () {
  document.getElementById("popup").style.display = "block";
};

async function loadLeaderboard() {
  console.log("Loading leaderboard...");

  const res = await fetch(`${SERVER_URL}/leaderboard`);
  const data = await res.json();

  const board = document.getElementById("leaderboardList");
  if (!board) return;
  board.innerHTML = "";

  data
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .forEach((entry, index) => {
      let medal = "";
      let extraClass = "";

      if (index === 0) { medal = "🥇"; extraClass = "gold"; }
      else if (index === 1) { medal = "🥈"; extraClass = "silver"; }
      else if (index === 2) { medal = "🥉"; extraClass = "bronze"; }

      const skin = `https://minotar.net/helm/${entry.name}/30.png`;

      board.innerHTML += `
        <div class="lb-entry ${extraClass}">
          <span class="rank">${medal}</span>
          <img src="${skin}" class="lb-skin">
          <span class="name">${entry.name}</span>
          <span class="score">${entry.score}</span>
        </div>
      `;
    });
}

let maxTime = 30;
let timeLeft = maxTime;
let timerInterval;

let guessX = null;
let guessY = null;

let zoom = 0.9;
let offsetX = 0;
let offsetY = 0;

// DRAG STATE
let isDragging = false;
let moved = false;
let startX = 0;
let startY = 0;
const dragThreshold = 5;

const locations = [
  { image: "images/bild1.png",  x: 0.504, y: 0.494 },
  { image: "images/bild2.png",  x: 0.557, y: 0.220 },
  { image: "images/bild3.png",  x: 0.123, y: 0.431 },
  { image: "images/bild4.png",  x: 0.303, y: 0.233 },
  { image: "images/bild5.png",  x: 0.781, y: 0.368 },
  { image: "images/bild6.png",  x: 0.325, y: 0.987 },
  { image: "images/bild7.png",  x: 0.565, y: 0.978 },
  { image: "images/bild8.png",  x: 0.760, y: 0.871 },
  { image: "images/bild9.png",  x: 0.936, y: 0.814 },
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
  mapContainer.classList.remove("expanded");

  // Marker reset
  marker.style.display = "none";
  realMarker.style.display = "none";
  line.style.display = "none";

  guessX = null;
  guessY = null;

  // MAP RESET
  zoom = 0.9;
  offsetX = 0;
  offsetY = 0;

  updateTransform();

  // Timer neu starten
  startTimer();
}

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

  line.style.width = length + "px";
  line.style.left = px1 + "px";
  line.style.top = py1 + "px";
  line.style.transform = `rotate(${angle}deg)`;

  line.style.display = "block";

  setTimeout(() => { line.style.opacity = "1"; }, 10);
}

function showResult() {
  // Map groß machen
  mapContainer.classList.add("fullscreen");

  // echte Position berechnen
  const realX = currentLocation.x;
  const realY = currentLocation.y;

  // Marker setzen
  realMarker.style.left = (realX * 100) + "%";
  realMarker.style.top  = (realY * 100) + "%";
  realMarker.style.display = "block";

  // Linie berechnen
  drawLine(guessX, guessY, realX, realY);
}


// -------------------- TRANSFORM --------------------
function updateTransform() {
  const vp = mapViewport.getBoundingClientRect();

  const mapWidth  = map.offsetWidth  * zoom;
  const mapHeight = map.offsetHeight * zoom;
  const vpWidth   = vp.width;
  const vpHeight  = vp.height;

  const minX = vpWidth  - mapWidth;
  const minY = vpHeight - mapHeight;

  offsetX = Math.min(0, Math.max(offsetX, minX));
  offsetY = Math.min(0, Math.max(offsetY, minY));

  mapWrapper.style.transform =
    `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;
}

// -------------------- CLICK (GUESS) --------------------
mapViewport.addEventListener("click", (e) => {
  if (moved) {
    moved = false;
    return;
  }

  // On mobile: first tap expands the map, second tap places guess
  if (isMobile() && !mapContainer.classList.contains("expanded") && !mapContainer.classList.contains("fullscreen")) {
    mapContainer.classList.add("expanded");
    return;
  }

  const rect = map.getBoundingClientRect();
  const x = (e.clientX - rect.left)  / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  guessX = x;
  guessY = y;

  marker.style.left = (x * 100) + "%";
  marker.style.top  = (y * 100) + "%";
  marker.style.display = "block";

  coords.innerText = `x: ${x.toFixed(3)} | y: ${y.toFixed(3)}`;

  if (isMobile()) mapContainer.classList.remove("expanded");
});

// -------------------- TIMER --------------------
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
    setTimeout(() => { loadRandomLocation(); }, 1500);
    return;
  }

  guessBtn.click();
}

// -------------------- MOUSE DRAG --------------------
mapWrapper.addEventListener("mousedown", (e) => {
  isDragging = true;
  moved = false;

  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;

  e.preventDefault();
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) moved = true;

  offsetX = dx;
  offsetY = dy;
  updateTransform();
});

window.addEventListener("mouseup", () => { isDragging = false; });

// -------------------- TOUCH DRAG + PINCH ZOOM --------------------
let touchStartX = 0;
let touchStartY = 0;
let lastTouchDist = 0;

function getTouchDist(e) {
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
  }

mapWrapper.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    moved = false;
    startX = e.touches[0].clientX - offsetX;
    startY = e.touches[0].clientY - offsetY;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    isDragging = false;
    lastTouchDist = getTouchDist(e);
  }
  e.preventDefault();
}, { passive: false });

mapWrapper.addEventListener("touchmove", (e) => {
  if (e.touches.length === 1 && isDragging) {
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    if (
      Math.abs(e.touches[0].clientX - touchStartX) > dragThreshold ||
      Math.abs(e.touches[0].clientY - touchStartY) > dragThreshold
    ) moved = true;

  offsetX = dx;
  offsetY = dy;
    updateTransform();
  } else if (e.touches.length === 2) {
    const dist = getTouchDist(e);
    const factor = dist / lastTouchDist;

    const rect = mapViewport.getBoundingClientRect();
    const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
    const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;

    const oldZoom = zoom;
    zoom = Math.min(Math.max(zoom * factor, 0.185), 5);

    offsetX = midX - ((midX - offsetX) * (zoom / oldZoom));
    offsetY = midY - ((midY - offsetY) * (zoom / oldZoom));

  updateTransform();
    lastTouchDist = dist;
    moved = true;
  }
  e.preventDefault();
}, { passive: false });

mapWrapper.addEventListener("touchend", () => { isDragging = false; });

// -------------------- SUBMIT --------------------
guessBtn.onclick = () => {
  if (guessX === null) return;

  const dx = guessX - currentLocation.x;
  const dy = guessY - currentLocation.y;

  const distance = Math.sqrt(dx * dx + dy * dy);
  const score = Math.max(0, 5000 - Math.floor(distance * 5000));

  totalScore += score;
  round++;

  result.innerText = `Runde ${round}/3 | Punkte: ${score}`;

showResult();

bigScore.innerText = "+" + score;
bigScore.style.display = "block";

setTimeout(() => {

  mapContainer.classList.remove("fullscreen");
    mapContainer.classList.remove("expanded");
  realMarker.style.display = "none";
  line.style.display = "none";

  if (round >= maxRounds) {
    endGame();
  } else {
    loadRandomLocation();
  }

}, 5000);
};

function endGame() {
  sendScore(playerName, totalScore);

  // UI wechseln
  game.style.display = "none";
  document.getElementById("endScreen").style.display = "flex";

  // Score anzeigen
  document.getElementById("finalScore").innerText = totalScore + " Punkte";

  // Leaderboard aktualisieren
  loadLeaderboard();
}

async function sendScore(name, score) {
  console.log("Sende Score:", name, score);
  await fetch(`${SERVER_URL}/leaderboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score })
  });
}

// -------------------- ZOOM (WHEEL) --------------------
mapViewport.addEventListener("wheel", (e) => {
  e.preventDefault();

  const rect = mapViewport.getBoundingClientRect();

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const zoomFactor = 1.1;
  const oldZoom = zoom;
  zoom *= (e.deltaY < 0) ? 1.1 : (1 / 1.1);
  zoom = Math.min(Math.max(zoom, 0.185), 5);

  offsetX = mouseX - ((mouseX - offsetX) * (zoom / oldZoom));
  offsetY = mouseY - ((mouseY - offsetY) * (zoom / oldZoom));

  updateTransform();
});

window.onload = () => {
  loadLeaderboard();
  setInterval(loadLeaderboard, 30000);

};