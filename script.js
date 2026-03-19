// script.js

document.addEventListener("DOMContentLoaded", () => {
  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(
      navigator.userAgent,
    );
  }

  if (isMobileDevice()) {
    document.getElementById("mobileControls").style.display = "flex";
  }

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const displayName = document.getElementById("displayName");
  const scoreList = document.getElementById("scoreList");

  const menu = document.getElementById("menu");
  const gameContainer = document.getElementById("gameContainer");
  const startBtn = document.getElementById("startBtn");
  const playerNameInput = document.getElementById("playerName");

  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScore = document.getElementById("finalScore");
  const backToMenuBtn = document.getElementById("backToMenuBtn");

  const playPauseBtn = document.getElementById("playPauseBtn");
  const muteBtn = document.getElementById("muteBtn");
  const volumeControl = document.getElementById("volumeControl");
  const prevTrackBtn = document.getElementById("prevTrackBtn");
  const nextTrackBtn = document.getElementById("nextTrackBtn");

  const box = 20;
  const canvasSize = 400;
  const rows = canvasSize / box;

  let snake, direction, nextDirection, food, score, playerName, game;

  const musicFiles = [
    "audio/musica1.mp3",
    "audio/musica2.mp3",
    "audio/musica3.mp3",
  ];
  let audio = new Audio();
  let currentTrackIndex = 0;
  let isPlaying = true;
  let isMuted = false;
  let musicStarted = false;

  audio.volume = 0.5;
  volumeControl.value = audio.volume;
  volumeControl.style.setProperty("--value", audio.volume * 100 + "%");

  function playMusic() {
    audio.src = musicFiles[currentTrackIndex];
    audio.loop = false;
    audio.play();
    isPlaying = true;
    playPauseBtn.textContent = "⏸️ Pausar";

    audio.onended = () => {
      currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
      playMusic();
    };
  }

  function stopMusic() {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    playPauseBtn.textContent = "▶️ Tocar";
  }

  playPauseBtn.addEventListener("click", () => {
    if (isPlaying) {
      audio.pause();
      playPauseBtn.textContent = "▶️ Tocar";
    } else {
      audio.play();
      playPauseBtn.textContent = "⏸️ Pausar";
    }
    isPlaying = !isPlaying;
  });

  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    audio.muted = isMuted;
    muteBtn.textContent = isMuted ? "🔇 Mutar" : "🔈 Mutar";
  });

  volumeControl.addEventListener("input", () => {
    const volume = parseFloat(volumeControl.value);
    audio.volume = volume;
    audio.muted = volume <= 0.01;
    volumeControl.style.setProperty("--value", volume * 100 + "%");
  });

  prevTrackBtn.addEventListener("click", () => {
    currentTrackIndex =
      (currentTrackIndex - 1 + musicFiles.length) % musicFiles.length;
    playMusic();
  });

  nextTrackBtn.addEventListener("click", () => {
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    playMusic();
  });

  startBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if (name === "") {
      alert("Digite um nome!");
      return;
    }

    playerName = name;
    displayName.textContent = playerName;
    menu.style.display = "none";
    gameOverScreen.style.display = "none";
    gameContainer.style.display = "flex";
    gameContainer.style.flexDirection = "column";
    resetGame();
    drawScoreboard();
    game = setInterval(draw, 120);

    if (!musicStarted) {
      playMusic();
      musicStarted = true;
    }

    if (isMobileDevice()) {
      document.getElementById("mobileControls").style.display = "flex";
    }
  });

  backToMenuBtn?.addEventListener("click", () => {
    gameOverScreen.style.display = "none";
    menu.style.display = "flex";
    document.getElementById("mobileControls").style.display = "none";
  });

  function resetGame() {
    snake = [{ x: 9 * box, y: 9 * box }];
    direction = "RIGHT";
    nextDirection = "RIGHT";
    food = spawnFood();
    score = 0;
    scoreEl.textContent = score;
    bgGridOffset = { x: 0, y: 0 };
    document.getElementById("scoreboard").classList.remove("show");
    document.getElementById("mobileControls").classList.remove("hide");
  }

  document.addEventListener("keydown", changeDirection);

  function changeDirection(event) {
    const key = event.keyCode;
    if (key === 37 && direction !== "RIGHT") nextDirection = "LEFT";
    else if (key === 38 && direction !== "DOWN") nextDirection = "UP";
    else if (key === 39 && direction !== "LEFT") nextDirection = "RIGHT";
    else if (key === 40 && direction !== "UP") nextDirection = "DOWN";
  }

  function spawnFood() {
    return {
      x: Math.floor(Math.random() * rows) * box,
      y: Math.floor(Math.random() * rows) * box,
    };
  }

  function draw() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    direction = nextDirection;
    drawGrid();
    drawNeonFood();
    drawNeonSnake();

    let head = { ...snake[0] };
    if (direction === "LEFT") head.x -= box;
    else if (direction === "UP") head.y -= box;
    else if (direction === "RIGHT") head.x += box;
    else if (direction === "DOWN") head.y += box;

    if (
      head.x < 0 ||
      head.x >= canvasSize ||
      head.y < 0 ||
      head.y >= canvasSize ||
      collision(head)
    ) {
      endGame();
      return;
    }

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      food = spawnFood();
    } else {
      snake.pop();
    }

    snake.unshift(head);
  }

  function collision(head) {
    return snake.some(
      (segment, i) => i !== 0 && head.x === segment.x && head.y === segment.y,
    );
  }

  function endGame() {
    clearInterval(game);
    saveScore();
    finalScore.textContent = score;
    gameContainer.style.display = "none";
    gameOverScreen.style.display = "flex";
    document.getElementById("mobileControls").style.display = "none";
    document.getElementById("scoreboard").classList.add("show");
    document.getElementById("mobileControls").classList.add("hide");
  }

  function saveScore() {
    const previousScores =
      JSON.parse(localStorage.getItem("snakeScores")) || [];
    previousScores.push({ name: playerName, score });
    localStorage.setItem("snakeScores", JSON.stringify(previousScores));
  }

  function drawScoreboard() {
    const scores = JSON.parse(localStorage.getItem("snakeScores")) || [];
    const sorted = scores.sort((a, b) => b.score - a.score).slice(0, 10);
    scoreList.innerHTML = "";
    sorted.forEach(({ name, score }) => {
      const li = document.createElement("li");
      li.textContent = `${name}: ${score}`;
      scoreList.appendChild(li);
    });
  }

  function drawGrid() {
    const spacing = 20;
    const color = "rgba(190, 0, 255, 0.23)";
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    for (
      let x = -spacing + (bgGridOffset.x % spacing);
      x < canvasSize;
      x += spacing
    ) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize);
      ctx.stroke();
    }

    for (
      let y = -spacing + (bgGridOffset.y % spacing);
      y < canvasSize;
      y += spacing
    ) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawNeonFood() {
    const pulse = Math.sin(Date.now() / 200) * 5 + 10;
    const centerX = food.x + box / 2;
    const centerY = food.y + box / 2;

    ctx.save();
    ctx.shadowColor = "#f0f";
    ctx.shadowBlur = pulse;
    ctx.fillStyle = "#f0f";
    ctx.beginPath();
    ctx.arc(centerX, centerY, box / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#ff00ff";
    ctx.beginPath();
    ctx.arc(centerX, centerY, box / 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawNeonSnake() {
    snake.forEach((segment, i) => {
      const x = segment.x + box / 2;
      const y = segment.y + box / 2;
      const isHead = i === 0;
      const pulse = isHead ? Math.sin(Date.now() / 150) * 6 + 12 : 8;

      ctx.save();
      ctx.shadowColor = isHead ? "#0ff" : "#0f0";
      ctx.shadowBlur = pulse;
      ctx.fillStyle = isHead ? "#0ff" : "#0f0";
      ctx.beginPath();
      ctx.arc(x, y, box / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // Controles mobile com resposta imediata
  function setupMobileControl(btnId, newDirection, oppositeDirection) {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    const handler = () => {
      if (direction !== oppositeDirection) nextDirection = newDirection;
    };

    btn.addEventListener("touchstart", handler);
    btn.addEventListener("mousedown", handler);
  }

  setupMobileControl("upBtn", "UP", "DOWN");
  setupMobileControl("downBtn", "DOWN", "UP");
  setupMobileControl("leftBtn", "LEFT", "RIGHT");
  setupMobileControl("rightBtn", "RIGHT", "LEFT");
});
