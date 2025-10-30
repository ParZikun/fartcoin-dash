// FartCoin Dash – Updated for Latest LittleJS (2025)
// Move with WASD or Arrow Keys. Collect FartCoins, avoid Clouds!

let player, coins = [], clouds = [];
let score = 0, timeLeft = 60, running = false;
let sCoin, sHit;  // sounds
const WORLD_SIZE = 20;

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);

function gameInit() {
  cameraPos = vec2(0, 0);
  cameraScale = innerWidth / 40;
  window.addEventListener('resize', updateCamera);

  player = new EngineObject(vec2(0, 0), vec2(1, 1));
  player.color = new Color(0, 1, 0);

  // Define sounds safely
  sCoin = new Sound([0,,0.2,,0.15,0.3,,0.3,,0.1]); // beep
  sHit = new Sound([0,,0.15,,0.3,0.25,,0.2,,0.2]); // thud
}

function updateCamera() {
  cameraScale = Math.max(20, Math.min(innerWidth, innerHeight) / 20);
  cameraPos = vec2(0, 0);
}

function spawnCoin() {
  const coin = new EngineObject(randInCircle(vec2(0,0), WORLD_SIZE), vec2(0.6, 0.6));
  coin.color = new Color(1, 1, 0);
  coin.type = 'coin';
  coins.push(coin);
}

function spawnCloud() {
  const c = new EngineObject(randInCircle(vec2(0,0), WORLD_SIZE), vec2(1.2, 1.2));
  c.color = new Color(0.8, 0.8, 0.8);
  c.type = 'cloud';
  c.velocity = randInCircle(vec2(0,0), 0.015);
  clouds.push(c);
}

function resetGame() {
  coins = [];
  clouds = [];
  score = 0;
  timeLeft = 60;
  running = true;
  player.pos = vec2(0,0);
  for (let i = 0; i < 8; i++) spawnCoin();
  for (let i = 0; i < 4; i++) spawnCloud();
}

function gameUpdate() {
  if (!running) return;

  const speed = 0.07;
  const move = vec2(
    (keyIsDown(39) || keyIsDown(68)) - (keyIsDown(37) || keyIsDown(65)),
    (keyIsDown(38) || keyIsDown(87)) - (keyIsDown(40) || keyIsDown(83))
  );
  player.pos = player.pos.add(move.scale(speed));

  // Coin collisions
  coins.forEach(c => {
    if (player.pos.distance(c.pos) < 1) {
      score += 10;
      soundPlay(sCoin);
      c.pos = randInCircle(vec2(0,0), WORLD_SIZE);
    }
  });

  // Cloud behavior
  clouds.forEach(c => {
    c.pos = c.pos.add(c.velocity);
    if (Math.abs(c.pos.x) > WORLD_SIZE || Math.abs(c.pos.y) > WORLD_SIZE)
      c.velocity = c.velocity.neg();
    if (player.pos.distance(c.pos) < 1) {
      score = Math.max(0, score - 15);
      soundPlay(sHit);
    }
  });

  // Use correct time variable (was engineDeltaTime before)
  timeLeft -= timeDelta;
  if (timeLeft <= 0) {
    running = false;
    setTimeout(() => alert(`Game Over! Score: ${score}`), 100);
  }
}

function gameUpdatePost() {}

function gameRender() {
  drawText(`Score: ${score}`, vec2(-18, 9), 1.2, new Color(0,1,0));
  drawText(`Time: ${Math.ceil(timeLeft)}`, vec2(10, 9), 1.2, new Color(1,1,1));

  if (!running) drawTextCentered('Press Start', vec2(0,0), 2, new Color(1,1,1));
}

function gameRenderPost() {}

function drawTextCentered(text, pos, size=1, color=new Color(1,1,1)) {
  const width = text.length * size * 0.6;
  drawText(text, vec2(pos.x - width/2, pos.y), size, color);
}

document.getElementById('startBtn').onclick = () => resetGame();
