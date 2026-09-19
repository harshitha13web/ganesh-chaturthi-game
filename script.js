const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const introScreen = document.getElementById("introScreen");
const game = document.getElementById("game");
const messageScreen = document.getElementById("messageScreen");

const scene = document.getElementById("scene");
const player = document.getElementById("player");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const progressEl = document.getElementById("progress");
const progressText = document.getElementById("progressText");

const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const finalScore = document.getElementById("finalScore");

let score = 0;
let lives = 3;
let playerX = 50;
let gameRunning = false;
let spawnTimer;
let animationFrame;
let objects = [];

const goodItems = [
  { emoji: "🍬", points: 10, name: "Modak" },
  { emoji: "🌸", points: 5, name: "Flower" },
  { emoji: "🪔", points: 15, name: "Diya" },
  { emoji: "🍎", points: 5, name: "Fruit" }
];

const badItems = [
  { emoji: "🪨", points: 0, name: "Obstacle" },
  { emoji: "🌪️", points: 0, name: "Obstacle" }
];

function startGame() {
  introScreen.classList.add("hidden");
  messageScreen.classList.add("hidden");
  game.classList.remove("hidden");
  resetGame();
}

function resetGame() {
  clearTimeout(spawnTimer);
  cancelAnimationFrame(animationFrame);

  objects.forEach(obj => obj.element.remove());
  objects = [];

  score = 0;
  lives = 3;
  playerX = 50;
  gameRunning = true;

  updateHUD();
  player.style.left = playerX + "%";

  spawnLoop();
  gameLoop();
}

function updateHUD() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  progressText.textContent = `${score} / 100`;
  progressEl.style.width = Math.min(score, 100) + "%";
}

function movePlayer(amount) {
  if (!gameRunning) return;
  playerX = Math.max(7, Math.min(93, playerX + amount));
  player.style.left = playerX + "%";
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    event.preventDefault();
    movePlayer(-5);
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    event.preventDefault();
    movePlayer(5);
  }
});

function spawnLoop() {
  if (!gameRunning) return;

  spawnObject();

  const delay = Math.max(350, 850 - score * 3);
  spawnTimer = setTimeout(spawnLoop, delay);
}

function spawnObject() {
  const isBad = Math.random() < 0.18;
  const list = isBad ? badItems : goodItems;
  const data = list[Math.floor(Math.random() * list.length)];

  const element = document.createElement("div");
  element.className = "item" + (isBad ? " obstacle" : "");
  element.textContent = data.emoji;
  element.style.left = (7 + Math.random() * 86) + "%";

  scene.appendChild(element);

  objects.push({
    element,
    data,
    y: -60,
    isBad
  });
}

function gameLoop() {
  if (!gameRunning) return;

  const sceneRect = scene.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();

  objects.forEach((obj, index) => {
    obj.y += 2.5 + score * 0.008;
    obj.element.style.top = obj.y + "px";

    const itemRect = obj.element.getBoundingClientRect();

    const hit =
      itemRect.bottom > playerRect.top + 10 &&
      itemRect.top < playerRect.bottom &&
      itemRect.right > playerRect.left + 12 &&
      itemRect.left < playerRect.right - 12;

    if (hit) {
      if (obj.isBad) {
        loseLife();
      } else {
        collect(obj);
      }
      obj.element.remove();
      objects.splice(index, 1);
      return;
    }

    if (obj.y > sceneRect.height + 50) {
      obj.element.remove();
      objects.splice(index, 1);
    }
  });

  animationFrame = requestAnimationFrame(gameLoop);
}

function collect(obj) {
  score += obj.data.points;
  showPop(obj.data.points, obj.element);

  if (score >= 100) {
    score = 100;
    updateHUD();
    endGame(true);
    return;
  }

  updateHUD();
}

function loseLife() {
  lives--;
  updateHUD();

  scene.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-8px)" },
      { transform: "translateX(8px)" },
      { transform: "translateX(0)" }
    ],
    { duration: 220 }
  );

  if (lives <= 0) {
    endGame(false);
  }
}

function showPop(points, element) {
  const pop = document.createElement("div");
  pop.className = "pop";
  pop.textContent = `+${points}`;

  const rect = element.getBoundingClientRect();
  const sceneRect = scene.getBoundingClientRect();

  pop.style.left = (rect.left - sceneRect.left + rect.width / 2) + "px";
  pop.style.top = (rect.top - sceneRect.top) + "px";

  scene.appendChild(pop);
  setTimeout(() => pop.remove(), 700);
}

function endGame(won) {
  gameRunning = false;
  clearTimeout(spawnTimer);
  cancelAnimationFrame(animationFrame);

  finalScore.textContent = score;

  if (won) {
    messageTitle.textContent = "Ganpati Bappa Morya! 🙏";
    messageText.textContent =
      "You collected the sacred offerings and completed the festival preparations!";
  } else {
    messageTitle.textContent = "The Journey Continues 🪔";
    messageText.textContent =
      "Don't give up! Try again and help complete the festival preparations.";
  }

  setTimeout(() => {
    game.classList.add("hidden");
    messageScreen.classList.remove("hidden");
  }, 500);
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", resetGame);
playAgainBtn.addEventListener("click", startGame);
