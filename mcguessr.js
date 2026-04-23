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

const bossbarFill = document.getElementById("bossbar-fill");

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

//Skin
usernameInput.addEventListener("input", () => {
  const name = usernameInput.value.trim();

  if (!name) return;

  // 🔥 HEAD render (perfekt für UI)

skinPreview.src = `https://minotar.net/helm/${name}/100.png`;});
startBtn.onclick = () => {
  const name = usernameInput.value.trim();

  if (!name) {
    alert("Bitte Username eingeben!");
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

//Leaderboard
async function loadLeaderboard() {
  try {
    const res = await fetch("http://localhost:3000/leaderboard");
    const data = await res.json();

    const list = document.getElementById("leaderboardList");
    list.innerHTML = "";

    data.forEach((player, index) => {
      const entry = document.createElement("div");

      if (index === 0) entry.className = "lb-entry gold";
      else if (index === 1) entry.className = "lb-entry silver";
      else if (index === 2) entry.className = "lb-entry bronze";
      else entry.className = "lb-entry";

      entry.innerHTML = `
        <img src="https://minotar.net/helm/${player.name}/40.png">
        <span>#${index + 1} ${player.name}</span>
        <b>${player.score}</b>
      `;

      list.appendChild(entry);
    });

  } catch (err) {
    console.log("Leaderboard Server offline ❌", err);
  }
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
  { image: "images/bild20.png", x: 0.520, y: 0.040 }

];

let currentLocation;

// -------------------- LOAD --------------------
function loadRandomLocation() {
  currentLocation = locations[Math.floor(Math.random() * locations.length)];
  screenshot.src = currentLocation.image;
  mapContainer.classList.remove("fullscreen");

  // 🔥 Marker reset
  marker.style.display = "none";
  realMarker.style.display = "none";
  line.style.display = "none";

  guessX = null;
  guessY = null;

  // 🔥 MAP RESET
  zoom = 0.9;
  offsetX = 0;
  offsetY = 0;

  updateTransform();

  // 🔥 Timer neu starten
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

  line.style.width = length + "px";
  line.style.left = px1 + "px";
  line.style.top = py1 + "px";
  line.style.transform = `rotate(${angle}deg)`;

  line.style.display = "block";
}

function showResult() {
  // Map groß machen
  mapContainer.classList.add("fullscreen");

  // echte Position berechnen
  const realX = currentLocation.x;
  const realY = currentLocation.y;

  // Marker setzen
  realMarker.style.left = (realX * 100) + "%";
  realMarker.style.top = (realY * 100) + "%";
  realMarker.style.display = "block";

  // Linie berechnen
  drawLine(guessX, guessY, realX, realY);
}


// -------------------- TRANSFORM --------------------
function updateTransform() {
  const vp = mapViewport.getBoundingClientRect();

  const mapWidth = map.offsetWidth * zoom;
  const mapHeight = map.offsetHeight * zoom;

  const vpWidth = vp.width;
  const vpHeight = vp.height;

  const minX = vpWidth - mapWidth;
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

  const rect = map.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  guessX = x;
  guessY = y;

  marker.style.left = (x * 100) + "%";
  marker.style.top = (y * 100) + "%";
  marker.style.display = "block";

  coords.innerText = `x: ${x.toFixed(3)} | y: ${y.toFixed(3)}`;
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

  setTimeout(() => {

  // 🔥 RESULT VIEW ZURÜCKSETZEN
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
function endGame() {
  result.innerText = `GESAMT: ${totalScore} Punkte`;

  sendScore(); 

  setTimeout(() => {
    round = 0;
    totalScore = 0;

    startScreen.style.display = "block";
    game.style.display = "none";
    setTimeout(() => {
  loadLeaderboard();
}, 1000);
  }, 4000);
}

// -------------------- ZOOM --------------------
mapViewport.addEventListener("wheel", (e) => {
  e.preventDefault();

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

function sendScore() {
  console.log("Sende Score:", playerName, totalScore); // 👈 DEBUG

  fetch("http://localhost:3000/score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: playerName,
      score: totalScore
    })
  });
}