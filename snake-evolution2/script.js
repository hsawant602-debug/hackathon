const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
let speed = 150;
let game;
let gameOver = false;

let mode = "retro";
let difficulty = "medium";

let direction = "RIGHT";
let snake = [];
let food = {};
let score = 0;

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

// 🍎🍌🍇 FRUITS (Modern mode)
const fruits = [
  { type: "apple", color: "red", score: 1 },
  { type: "banana", color: "yellow", score: 2 },
  { type: "grape", color: "purple", score: 3 },
  { type: "orange", color: "orange", score: 2 }
];

// ---------------- INIT ----------------
function init() {
  snake = [{ x: 200, y: 200 }];
  direction = "RIGHT";
  food = spawnFood();
  score = 0;
  gameOver = false;

  document.getElementById("scoreText").innerText = "Score: 0";
  document.getElementById("restartBtn").style.display = "none";

  clearInterval(game);
  game = setInterval(draw, speed);
}

// ---------------- FOOD ----------------
function spawnFood() {
  const base = {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
  };

  if (mode === "modern") {
    const f = fruits[Math.floor(Math.random() * fruits.length)];
    return { ...base, ...f };
  }

  return base;
}

// ---------------- MODE ----------------
function setMode(m) {
  mode = m;
  document.getElementById("modeText").innerText = "Mode: " + m.toUpperCase();

  const diff = document.getElementById("difficulty");

  if (mode === "retro" || mode === "intermediate") {
    diff.style.display = "inline";
    setDifficulty(difficulty);
  } else {
    diff.style.display = "none";
    speed = 120;
  }

  init();
}

// ---------------- DIFFICULTY ----------------
function setDifficulty(d) {
  difficulty = d;
  speed = d === "easy" ? 200 : d === "hard" ? 90 : 150;
  clearInterval(game);
  game = setInterval(draw, speed);
}

// ---------------- INPUT ----------------
document.addEventListener("keydown", e => {
  if (gameOver) return;

  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// Touch
canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});

canvas.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 0 && direction !== "UP") direction = "DOWN";
    else if (dy < 0 && direction !== "DOWN") direction = "UP";
  }
});

// ---------------- DRAW ----------------
function draw() {
  drawBackground();
  drawFood();
  drawSnake();

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;

  if (mode === "retro") {
    if (headX < 0) headX = canvas.width - box;
    if (headX >= canvas.width) headX = 0;
    if (headY < 0) headY = canvas.height - box;
    if (headY >= canvas.height) headY = 0;
  } else {
    if (
      headX < 0 || headY < 0 ||
      headX >= canvas.width || headY >= canvas.height ||
      snake.some(s => s.x === headX && s.y === headY)
    ) {
      endGame();
      return;
    }
  }

  const newHead = { x: headX, y: headY };

  if (headX === food.x && headY === food.y) {
    score += food.score || 1;
    document.getElementById("scoreText").innerText = "Score: " + score;
    food = spawnFood();
  } else {
    snake.pop();
  }

  snake.unshift(newHead);
}

// ---------------- DRAW BACKGROUND ----------------
function drawBackground() {
  if (mode === "retro") {
    ctx.fillStyle = "#bada55";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#9aaa3a";
    for (let i = 0; i < canvas.width; i += box) {
      ctx.strokeRect(i, 0, box, canvas.height);
      ctx.strokeRect(0, i, canvas.width, box);
    }
  } else if (mode === "modern") {
    ctx.fillStyle = "#3b7a1f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ---------------- DRAW FOOD ----------------
function drawFood() {
  if (mode === "modern") {
    ctx.fillStyle = food.color;
    ctx.beginPath();
    ctx.arc(food.x + 10, food.y + 10, 9, 0, Math.PI * 2);
    ctx.fill();
  } else if (mode === "intermediate") {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(food.x + 10, food.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(food.x, food.y, box, box);
  }
}

// ---------------- DRAW SNAKE ----------------
function drawSnake() {
  snake.forEach((s, i) => {
    if (mode === "modern") {
      ctx.fillStyle = "#2ecc71";
      ctx.beginPath();
      ctx.arc(s.x + 10, s.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = mode === "retro" ? "black" : "lime";
      ctx.fillRect(s.x, s.y, box, box);
    }

    // Eyes (Intermediate & Modern)
    if (i === 0 && (mode === "intermediate" || mode === "modern")) {
      ctx.fillStyle = "white";
      ctx.fillRect(s.x + 4, s.y + 5, 4, 4);
      ctx.fillRect(s.x + 12, s.y + 5, 4, 4);
      ctx.fillStyle = "black";
      ctx.fillRect(s.x + 5, s.y + 6, 2, 2);
      ctx.fillRect(s.x + 13, s.y + 6, 2, 2);
    }
  });
}

// ---------------- GAME OVER ----------------
function endGame() {
  clearInterval(game);
  gameOver = true;

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "28px Arial";
  ctx.fillText("GAME OVER", 110, 190);
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 150, 220);

  document.getElementById("restartBtn").style.display = "inline";
}

function restartGame() {
  init();
}

// ---------------- START ----------------
setMode("retro");
