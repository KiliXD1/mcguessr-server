
app.get("/", (req, res) => {
  res.send("Server läuft!");
});

app.get("/leaderboard", (req, res) => {
  const data = JSON.parse(fs.readFileSync("leaderboard.json"));
  res.json(data);
});

const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Server läuft auf " + PORT));


const FILE = "leaderboard.json";

// GET leaderboard
app.get("/leaderboard", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  res.json(data);
});

// POST score
app.post("/score", (req, res) => {
  const { name, score } = req.body;

  let data = JSON.parse(fs.readFileSync(FILE));

  data.push({ name, score });

  data.sort((a, b) => b.score - a.score);
  data = data.slice(0, 10);

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Server läuft"));